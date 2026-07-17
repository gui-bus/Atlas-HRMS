import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { QueryEmployeeDto } from "./dto/query-employee.dto";
import { Prisma, EmployeeStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryEmployeeDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
    };

    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query.status) {
      where.status = query.status as EmployeeStatus;
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      where.OR = [
        { firstName: { contains: searchLower, mode: "insensitive" } },
        { lastName: { contains: searchLower, mode: "insensitive" } },
        { email: { contains: searchLower, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.EmployeeOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sortBy) {
      const order = query.sortOrder || "asc";
      if (query.sortBy === "name") {
        orderBy = { firstName: order };
      } else if (
        ["email", "phone", "status", "hireDate", "salary", "createdAt"].includes(query.sortBy)
      ) {
        orderBy = { [query.sortBy]: order };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          personalData: true,
          address: true,
          bankAccount: true,
          emergencyContacts: true,
          department: true,
          position: true,
        },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        personalData: true,
        address: true,
        bankAccount: true,
        emergencyContacts: true,
        department: true,
        position: true,
      },
    });

    if (!employee) {
      throw new NotFoundException("Funcionário não encontrado");
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto) {
    // Check if email already exists
    const emailExists = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new ConflictException("E-mail corporativo já cadastrado");
    }

    // Check if CPF already exists
    const cpfClean = dto.personalData.cpf.replace(/[^\d]/g, "");
    const cpfExists = await this.prisma.employeePersonalData.findUnique({
      where: { cpf: cpfClean },
    });
    if (cpfExists) {
      throw new ConflictException("CPF já cadastrado no sistema");
    }

    // Verify userId relationship uniqueness
    if (dto.userId) {
      const userHasEmployee = await this.prisma.employee.findUnique({
        where: { userId: dto.userId },
      });
      if (userHasEmployee) {
        throw new ConflictException("Usuário informado já está associado a outro funcionário");
      }
    }

    return this.prisma.$transaction(async (tx) => {
      let linkedUserId = dto.userId || null;
      if (!linkedUserId) {
        // Check if user already exists
        const existingUser = await tx.user.findUnique({
          where: { email: dto.email },
        });
        if (existingUser) {
          linkedUserId = existingUser.id;
        } else {
          const hashedPassword = await bcrypt.hash("Mudar@123", 10);
          const newUser = await tx.user.create({
            data: {
              email: dto.email,
              password: hashedPassword,
              role: "EMPLOYEE",
            },
          });
          linkedUserId = newUser.id;
        }
      }

      return tx.employee.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          phone: dto.phone,
          status: dto.status ?? EmployeeStatus.ACTIVE,
          hireDate: new Date(dto.hireDate),
          terminationDate: dto.terminationDate ? new Date(dto.terminationDate) : null,
          salary: dto.salary,
          userId: linkedUserId,
          departmentId: dto.departmentId || null,
          positionId: dto.positionId || null,
          personalData: {
            create: {
              cpf: cpfClean,
              rg: dto.personalData.rg || null,
              birthDate: new Date(dto.personalData.birthDate),
              gender: dto.personalData.gender || null,
              maritalStatus: dto.personalData.maritalStatus || null,
              avatarUrl: dto.personalData.avatarUrl || null,
            },
          },
          ...(dto.address && dto.address.cep
            ? {
                address: {
                  create: {
                    cep: dto.address.cep.replace(/[^\d]/g, ""),
                    street: dto.address.street || "",
                    number: dto.address.number || "",
                    complement: dto.address.complement || null,
                    neighborhood: dto.address.neighborhood || "",
                    city: dto.address.city || "",
                    state: (dto.address.state || "").toUpperCase(),
                  },
                },
              }
            : {}),
          ...(dto.bankAccount && dto.bankAccount.bankCode
            ? {
                bankAccount: {
                  create: {
                    bankCode: dto.bankAccount.bankCode,
                    bankAgency: dto.bankAccount.bankAgency || "",
                    bankAccount: dto.bankAccount.bankAccount || "",
                    accountType: dto.bankAccount.accountType || "CORRENTE",
                  },
                },
              }
            : {}),
          emergencyContacts: {
            createMany: {
              data: (dto.emergencyContacts || []).map((contact) => ({
                name: contact.name,
                phone: contact.phone,
                relationship: contact.relationship,
                isPrimary: contact.isPrimary ?? false,
              })),
            },
          },
        },
        include: {
          personalData: true,
          address: true,
          bankAccount: true,
          emergencyContacts: true,
        },
      });
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);

    if (dto.email && dto.email !== employee.email) {
      const emailExists = await this.prisma.employee.findUnique({
        where: { email: dto.email },
      });
      if (emailExists) {
        throw new ConflictException("E-mail corporativo já cadastrado por outro funcionário");
      }
    }

    if (dto.personalData?.cpf) {
      const cpfClean = dto.personalData.cpf.replace(/[^\d]/g, "");
      if (cpfClean !== employee.personalData?.cpf) {
        const cpfExists = await this.prisma.employeePersonalData.findUnique({
          where: { cpf: cpfClean },
        });
        if (cpfExists) {
          throw new ConflictException("CPF já cadastrado no sistema por outro funcionário");
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Emergency Contacts handling if provided
      if (dto.emergencyContacts) {
        // Delete all old contacts first
        await tx.emergencyContact.deleteMany({
          where: { employeeId: id },
        });
      }

      const updateData: any = {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        terminationDate: dto.terminationDate
          ? new Date(dto.terminationDate)
          : dto.terminationDate === null
            ? null
            : undefined,
        salary: dto.salary,
        userId: dto.userId !== undefined ? dto.userId : undefined,
        departmentId: dto.departmentId !== undefined ? dto.departmentId : undefined,
        positionId: dto.positionId !== undefined ? dto.positionId : undefined,
      };

      if (dto.personalData) {
        const cpfClean = dto.personalData.cpf
          ? dto.personalData.cpf.replace(/[^\d]/g, "")
          : undefined;
        updateData.personalData = {
          update: {
            cpf: cpfClean,
            rg: dto.personalData.rg,
            birthDate: dto.personalData.birthDate
              ? new Date(dto.personalData.birthDate)
              : undefined,
            gender: dto.personalData.gender,
            maritalStatus: dto.personalData.maritalStatus,
            avatarUrl: dto.personalData.avatarUrl,
          },
        };
      }

      if (dto.address) {
        const cepClean = dto.address.cep ? dto.address.cep.replace(/[^\d]/g, "") : undefined;
        updateData.address = {
          update: {
            cep: cepClean,
            street: dto.address.street,
            number: dto.address.number,
            complement: dto.address.complement,
            neighborhood: dto.address.neighborhood,
            city: dto.address.city,
            state: dto.address.state ? dto.address.state.toUpperCase() : undefined,
          },
        };
      }

      if (dto.bankAccount) {
        updateData.bankAccount = {
          update: {
            bankCode: dto.bankAccount.bankCode,
            bankAgency: dto.bankAccount.bankAgency,
            bankAccount: dto.bankAccount.bankAccount,
            accountType: dto.bankAccount.accountType,
          },
        };
      }

      if (dto.emergencyContacts) {
        updateData.emergencyContacts = {
          createMany: {
            data: dto.emergencyContacts.map((contact) => ({
              name: contact.name,
              phone: contact.phone,
              relationship: contact.relationship,
              isPrimary: contact.isPrimary ?? false,
            })),
          },
        };
      }

      return tx.employee.update({
        where: { id },
        data: updateData,
        include: {
          personalData: true,
          address: true,
          bankAccount: true,
          emergencyContacts: true,
          department: true,
          position: true,
        },
      });
    });
  }

  async remove(id: string) {
    const employee = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      // Soft delete Employee
      const updated = await tx.employee.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: EmployeeStatus.INACTIVE,
        },
      });

      // If user linked, soft delete and deactivate the user
      if (employee.userId) {
        await tx.user.update({
          where: { id: employee.userId },
          data: {
            isActive: false,
            deletedAt: new Date(),
          },
        });
      }

      return updated;
    });
  }
}
