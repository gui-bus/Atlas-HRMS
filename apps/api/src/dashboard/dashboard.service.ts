import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    console.log("DashboardService.getStats check:", typeof this.prisma);
    return {
      totalEmployees: 0,
      totalDepartments: 0,
      activeRecruitments: 0,
      pendingVacations: 0,
    };
  }
}
