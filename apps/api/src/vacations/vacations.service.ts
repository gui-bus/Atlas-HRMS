import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class VacationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vacation.findMany({
      where: { deletedAt: null },
      include: { employee: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.vacation.findFirst({
      where: { id, deletedAt: null },
      include: { employee: true },
    });
  }

  async create(dto: any) {
    return this.prisma.vacation.create({
      data: {
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status || "PENDING",
        employeeId: dto.employeeId,
        approvedById: dto.approvedById,
      },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.vacation.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.vacation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
