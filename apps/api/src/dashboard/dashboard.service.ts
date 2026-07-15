import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import {
  VacationStatus,
  LeaveStatus,
  RecruitmentStatus,
  ApplicationStatus,
} from "@prisma/client";

import { QueryDashboardDto } from "./dto/query-dashboard.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(query: QueryDashboardDto) {
    const departmentId = query.departmentId;
    const startFilter = query.startDate ? new Date(query.startDate) : new Date();
    const endFilter = query.endDate ? new Date(query.endDate) : new Date();

    const employeeWhere: Prisma.EmployeeWhereInput = { deletedAt: null };
    const departmentWhere: Prisma.DepartmentWhereInput = { deletedAt: null };
    const vacationWhere: Prisma.VacationWhereInput = { deletedAt: null };
    const leaveWhere: Prisma.LeaveWhereInput = { deletedAt: null };
    const recruitmentWhere: Prisma.RecruitmentWhereInput = { deletedAt: null };
    const applicationWhere: Prisma.ApplicationWhereInput = { deletedAt: null };

    if (departmentId) {
      employeeWhere.departmentId = departmentId;
      departmentWhere.id = departmentId;
      vacationWhere.employee = { departmentId };
      leaveWhere.employee = { departmentId };
      recruitmentWhere.departmentId = departmentId;
      applicationWhere.recruitment = { departmentId };
    }

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
      this.prisma.employee.count({ where: employeeWhere }),

      this.prisma.department.count({ where: departmentWhere }),

      this.prisma.vacation.count({
        where: {
          ...vacationWhere,
          status: VacationStatus.PENDING,
        },
      }),

      this.prisma.leave.count({
        where: {
          ...leaveWhere,
          status: LeaveStatus.PENDING,
        },
      }),

      this.prisma.vacation.count({
        where: {
          ...vacationWhere,
          status: VacationStatus.APPROVED,
          startDate: { lte: endFilter },
          endDate: { gte: startFilter },
        },
      }),

      this.prisma.leave.count({
        where: {
          ...leaveWhere,
          status: LeaveStatus.APPROVED,
          startDate: { lte: endFilter },
          endDate: { gte: startFilter },
        },
      }),

      this.prisma.recruitment.count({
        where: {
          ...recruitmentWhere,
          status: RecruitmentStatus.OPEN,
        },
      }),

      this.prisma.application.count({
        where: {
          ...applicationWhere,
          status: { not: ApplicationStatus.WITHDRAWN },
        },
      }),

      this.prisma.application.count({
        where: {
          ...applicationWhere,
          status: ApplicationStatus.HIRED,
        },
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
