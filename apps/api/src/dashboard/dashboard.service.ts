import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalEmployees = await this.prisma.employee.count({ where: { deletedAt: null } });
    const totalDepartments = await this.prisma.department.count({ where: { deletedAt: null } });
    const activeRecruitments = await this.prisma.recruitment.count({
      where: { status: "OPEN", deletedAt: null },
    });
    const pendingVacations = await this.prisma.vacation.count({
      where: { status: "PENDING", deletedAt: null },
    });

    return {
      totalEmployees,
      totalDepartments,
      activeRecruitments,
      pendingVacations,
    };
  }
}
