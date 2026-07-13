import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.position.findMany({
      where: { deletedAt: null },
      include: { department: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.position.findFirst({
      where: { id, deletedAt: null },
      include: { department: true },
    });
  }

  async create(dto: any) {
    return this.prisma.position.create({
      data: {
        title: dto.title,
        salaryRangeMin: dto.salaryRangeMin,
        salaryRangeMax: dto.salaryRangeMax,
        active: dto.active ?? true,
        departmentId: dto.departmentId,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.position.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
