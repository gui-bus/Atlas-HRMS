import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.employee.findMany({
      where: { deletedAt: null },
      include: { department: true, position: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: { department: true, position: true },
    });
  }

  async create(dto: any) {
    return this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: dto.status || "ACTIVE",
        hireDate: new Date(dto.hireDate),
        salary: dto.salary,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
