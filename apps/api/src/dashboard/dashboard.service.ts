import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import {
  VacationStatus,
  LeaveStatus,
  RecruitmentStatus,
  ApplicationStatus,
} from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();

    const [
      totalEmployees,
      totalDepartments,
      pendingVacations,
      pendingLeaves,
      activeVacations,
      activeLeaves,
      openJobs,
      totalApplications,
      hiredCount,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { deletedAt: null },
      }),

      this.prisma.department.count({
        where: { deletedAt: null },
      }),

      this.prisma.vacation.count({
        where: { status: VacationStatus.PENDING, deletedAt: null },
      }),

      this.prisma.leave.count({
        where: { status: LeaveStatus.PENDING, deletedAt: null },
      }),

      this.prisma.vacation.count({
        where: {
          status: VacationStatus.APPROVED,
          deletedAt: null,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),

      this.prisma.leave.count({
        where: {
          status: LeaveStatus.APPROVED,
          deletedAt: null,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),

      this.prisma.recruitment.count({
        where: { status: RecruitmentStatus.OPEN, deletedAt: null },
      }),

      this.prisma.application.count({
        where: {
          status: { not: ApplicationStatus.WITHDRAWN },
          deletedAt: null,
        },
      }),

      this.prisma.application.count({
        where: { status: ApplicationStatus.HIRED, deletedAt: null },
      }),
    ]);

    return {
      totalEmployees,
      totalDepartments,
      pendingVacations,
      pendingLeaves,
      activeAbsences: activeVacations + activeLeaves,
      openJobs,
      totalApplications,
      hiredCount,
    };
  }
}
