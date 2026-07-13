import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class RecruitmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.recruitment.findMany({
      where: { deletedAt: null },
      include: { department: true },
    });
  }

  async create(dto: any) {
    return this.prisma.recruitment.create({
      data: {
        title: dto.title,
        status: dto.status || "OPEN",
        description: dto.description,
        salary: dto.salary,
        departmentId: dto.departmentId,
      },
    });
  }
}
