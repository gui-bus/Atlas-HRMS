import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import {
  VacationStatus,
  LeaveStatus,
  RecruitmentStatus,
  ApplicationStatus,
  RequestStatus,
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

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
      newHiresThisMonth,
      pendingCorrections,
      applicationsByStageRaw,
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
        },
      }),

      this.prisma.application.count({
        where: {
          ...applicationWhere,
          status: ApplicationStatus.HIRED,
        },
      }),

      this.prisma.employee.count({
        where: {
          ...employeeWhere,
          hireDate: { gte: startOfMonth },
        },
      }),

      this.prisma.timeCorrectionRequest.count({
        where: { status: RequestStatus.PENDING },
      }),

      this.prisma.application.groupBy({
        by: ["status"],
        where: {
          ...applicationWhere,
        },
        _count: { status: true },
      }),
    ]);

    const applicationsByStage: Record<string, number> = {};
    for (const entry of applicationsByStageRaw) {
      applicationsByStage[entry.status] = entry._count.status;
    }

    return {
      totalEmployees,
      totalDepartments,
      pendingVacations,
      pendingLeaves,
      activeAbsences: activeVacations + activeLeaves,
      openJobs,
      totalApplications,
      hiredCount,
      newHiresThisMonth,
      pendingCorrections,
      applicationsByStage,
    };
  }

  async getEmployeeSummary(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      return {
        hourBankBalance: 0,
        pendingVacationsCount: 0,
        pendingLeavesCount: 0,
        todayRecordsCount: 0,
        upcomingVacations: [],
      };
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    const [
      lastLedger,
      pendingVacationsCount,
      pendingLeavesCount,
      todayRecordsCount,
      upcomingVacations,
    ] = await Promise.all([
      this.prisma.hourBankLedger.findFirst({
        where: { employeeId: employee.id },
        orderBy: { date: "desc" },
      }),

      this.prisma.vacation.count({
        where: {
          employeeId: employee.id,
          status: VacationStatus.PENDING,
          deletedAt: null,
        },
      }),

      this.prisma.leave.count({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.PENDING,
          deletedAt: null,
        },
      }),

      this.prisma.timeRecord.count({
        where: {
          employeeId: employee.id,
          timestamp: { gte: todayStart, lte: todayEnd },
        },
      }),

      this.prisma.vacation.findMany({
        where: {
          employeeId: employee.id,
          status: VacationStatus.APPROVED,
          startDate: { gte: today },
          deletedAt: null,
        },
        orderBy: { startDate: "asc" },
        take: 3,
        select: { id: true, startDate: true, endDate: true, status: true },
      }),
    ]);

    return {
      hourBankBalance: lastLedger?.balance ?? 0,
      pendingVacationsCount,
      pendingLeavesCount,
      todayRecordsCount,
      upcomingVacations,
    };
  }
}
