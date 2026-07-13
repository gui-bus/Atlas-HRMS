import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(dto: any) {
    return this.prisma.department.create({
      data: {
        name: dto.name,
        code: dto.code,
        active: dto.active ?? true,
        managerId: dto.managerId,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
