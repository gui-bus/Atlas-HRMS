import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

import { QueryPaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: QueryPaginationDto) {
    const page = query?.page;
    const limit = query?.limit;

    if (!page && !limit) {
      return this.prisma.department.findMany({
        where: { deletedAt: null },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              employees: true,
              positions: true,
            },
          },
        },
      });
    }

    const currentPage = page ?? 1;
    const currentLimit = limit ?? 10;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where: { deletedAt: null },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              employees: true,
              positions: true,
            },
          },
        },
        skip,
        take: currentLimit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.department.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
    };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        employees: {
          where: { deletedAt: null },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        positions: {
          where: { active: true, deletedAt: null },
        },
      },
    });

    if (!department) {
      throw new NotFoundException("Departamento não encontrado");
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    const activeName = await this.prisma.department.findFirst({
      where: { name: dto.name, deletedAt: null },
    });
    if (activeName) {
      throw new ConflictException("Já existe um departamento ativo com este nome");
    }

    const activeCode = await this.prisma.department.findFirst({
      where: { code: dto.code, deletedAt: null },
    });
    if (activeCode) {
      throw new ConflictException("Já existe um departamento ativo com este código");
    }

    const softDeleted = await this.prisma.department.findFirst({
      where: {
        OR: [{ name: dto.name }, { code: dto.code }],
        NOT: { deletedAt: null },
      },
    });

    if (dto.managerId) {
      const managerExists = await this.prisma.employee.findFirst({
        where: { id: dto.managerId, deletedAt: null },
      });
      if (!managerExists) {
        throw new NotFoundException("Funcionário gerente indicado não encontrado");
      }
    }

    if (softDeleted) {
      return this.prisma.department.update({
        where: { id: softDeleted.id },
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          active: dto.active ?? true,
          managerId: dto.managerId,
          deletedAt: null,
        },
      });
    }

    return this.prisma.department.create({
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        active: dto.active ?? true,
        managerId: dto.managerId,
      },
    });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!department) {
      throw new NotFoundException("Departamento não encontrado");
    }

    if (dto.name && dto.name !== department.name) {
      const existingName = await this.prisma.department.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existingName) {
        throw new ConflictException("Já existe um departamento (ativo ou excluído) com este nome");
      }
    }

    if (dto.code && dto.code !== department.code) {
      const existingCode = await this.prisma.department.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException(
          "Já existe um departamento (ativo ou excluído) com este código",
        );
      }
    }

    if (dto.managerId && dto.managerId !== department.managerId) {
      const managerExists = await this.prisma.employee.findFirst({
        where: { id: dto.managerId, deletedAt: null },
      });
      if (!managerExists) {
        throw new NotFoundException("Funcionário gerente indicado não encontrado");
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        active: dto.active,
        managerId: dto.managerId,
      },
    });
  }

  async remove(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException("Departamento não encontrado");
    }

    if (department._count.employees > 0) {
      throw new BadRequestException(
        "Não é possível excluir um departamento que possui funcionários ativos",
      );
    }

    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
