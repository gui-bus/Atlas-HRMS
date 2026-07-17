import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../common/prisma.service";

const mockPrisma = {
  employee: { count: jest.fn(), findUnique: jest.fn() },
  department: { count: jest.fn() },
  vacation: { count: jest.fn(), findMany: jest.fn() },
  leave: { count: jest.fn() },
  recruitment: { count: jest.fn() },
  application: { count: jest.fn(), groupBy: jest.fn() },
  timeCorrectionRequest: { count: jest.fn() },
  hourBankLedger: { findFirst: jest.fn() },
  timeRecord: { count: jest.fn() },
};

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe("getStats()", () => {
    it("should return all 11 aggregated metrics", async () => {
      mockPrisma.employee.count.mockResolvedValueOnce(142).mockResolvedValueOnce(4);
      mockPrisma.department.count.mockResolvedValue(12);
      mockPrisma.vacation.count.mockResolvedValueOnce(8).mockResolvedValueOnce(10);
      mockPrisma.leave.count.mockResolvedValueOnce(3).mockResolvedValueOnce(5);
      mockPrisma.recruitment.count.mockResolvedValue(5);
      mockPrisma.application.count.mockResolvedValueOnce(87).mockResolvedValueOnce(12);
      mockPrisma.timeCorrectionRequest.count.mockResolvedValue(3);
      mockPrisma.application.groupBy.mockResolvedValue([
        { status: "SUBMITTED", _count: { status: 20 } },
        { status: "HIRED", _count: { status: 12 } },
      ]);

      const result = await service.getStats({});

      expect(result).toEqual({
        totalEmployees: 142,
        totalDepartments: 12,
        pendingVacations: 8,
        pendingLeaves: 3,
        activeAbsences: 15,
        openJobs: 5,
        totalApplications: 87,
        hiredCount: 12,
        newHiresThisMonth: 4,
        pendingCorrections: 3,
        applicationsByStage: { SUBMITTED: 20, HIRED: 12 },
      });
    });

    it("should return zeros when database is empty", async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.timeCorrectionRequest.count.mockResolvedValue(0);
      mockPrisma.application.groupBy.mockResolvedValue([]);

      const result = await service.getStats({});

      expect(result.totalEmployees).toBe(0);
      expect(result.newHiresThisMonth).toBe(0);
      expect(result.pendingCorrections).toBe(0);
      expect(result.applicationsByStage).toEqual({});
      expect(result.activeAbsences).toBe(0);
    });

    it("should calculate activeAbsences as sum of active vacations + leaves", async () => {
      mockPrisma.employee.count.mockResolvedValue(50);
      mockPrisma.department.count.mockResolvedValue(5);
      mockPrisma.vacation.count.mockResolvedValueOnce(2).mockResolvedValueOnce(7);
      mockPrisma.leave.count.mockResolvedValueOnce(1).mockResolvedValueOnce(3);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.timeCorrectionRequest.count.mockResolvedValue(0);
      mockPrisma.application.groupBy.mockResolvedValue([]);

      const result = await service.getStats({});

      expect(result.activeAbsences).toBe(10);
    });

    it("should execute all queries in parallel via Promise.all", async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.timeCorrectionRequest.count.mockResolvedValue(0);
      mockPrisma.application.groupBy.mockResolvedValue([]);

      await service.getStats({});

      expect(mockPrisma.employee.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.vacation.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.leave.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.application.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.timeCorrectionRequest.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.application.groupBy).toHaveBeenCalledTimes(1);
    });

    it("should map applicationsByStage correctly from groupBy result", async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);
      mockPrisma.timeCorrectionRequest.count.mockResolvedValue(0);
      mockPrisma.application.groupBy.mockResolvedValue([
        { status: "SUBMITTED", _count: { status: 10 } },
        { status: "SCREENING", _count: { status: 5 } },
        { status: "HIRED", _count: { status: 2 } },
      ]);

      const result = await service.getStats({});

      expect(result.applicationsByStage).toEqual({
        SUBMITTED: 10,
        SCREENING: 5,
        HIRED: 2,
      });
    });
  });

  describe("getEmployeeSummary()", () => {
    it("should return zeros and empty arrays when employee is not found", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      const result = await service.getEmployeeSummary("user-without-employee");

      expect(result).toEqual({
        hourBankBalance: 0,
        pendingVacationsCount: 0,
        pendingLeavesCount: 0,
        todayRecordsCount: 0,
        upcomingVacations: [],
      });
    });

    it("should return correct summary for a linked employee", async () => {
      const mockEmployee = { id: "emp-1", userId: "user-1" };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.hourBankLedger.findFirst.mockResolvedValue({ balance: 120 });
      mockPrisma.vacation.count.mockResolvedValue(2);
      mockPrisma.leave.count.mockResolvedValue(1);
      mockPrisma.timeRecord.count.mockResolvedValue(3);
      mockPrisma.vacation.findMany.mockResolvedValue([
        {
          id: "vac-1",
          startDate: new Date("2026-08-01"),
          endDate: new Date("2026-08-15"),
          status: "APPROVED",
        },
      ]);

      const result = await service.getEmployeeSummary("user-1");

      expect(result.hourBankBalance).toBe(120);
      expect(result.pendingVacationsCount).toBe(2);
      expect(result.pendingLeavesCount).toBe(1);
      expect(result.todayRecordsCount).toBe(3);
      expect(result.upcomingVacations).toHaveLength(1);
    });

    it("should return hourBankBalance as 0 when no ledger entry exists", async () => {
      const mockEmployee = { id: "emp-2", userId: "user-2" };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.hourBankLedger.findFirst.mockResolvedValue(null);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.timeRecord.count.mockResolvedValue(0);
      mockPrisma.vacation.findMany.mockResolvedValue([]);

      const result = await service.getEmployeeSummary("user-2");

      expect(result.hourBankBalance).toBe(0);
    });

    it("should run all queries in parallel via Promise.all", async () => {
      const mockEmployee = { id: "emp-3", userId: "user-3" };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.hourBankLedger.findFirst.mockResolvedValue(null);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.timeRecord.count.mockResolvedValue(0);
      mockPrisma.vacation.findMany.mockResolvedValue([]);

      await service.getEmployeeSummary("user-3");

      expect(mockPrisma.hourBankLedger.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrisma.vacation.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.leave.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.timeRecord.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.vacation.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
