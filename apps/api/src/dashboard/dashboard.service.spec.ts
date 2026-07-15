import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../common/prisma.service";

describe("DashboardService (Unit)", () => {
  let service: DashboardService;

  const mockPrisma = {
    employee: { count: jest.fn() },
    department: { count: jest.fn() },
    vacation: { count: jest.fn() },
    leave: { count: jest.fn() },
    recruitment: { count: jest.fn() },
    application: { count: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getStats", () => {
    it("should return all 8 aggregated metrics", async () => {
      mockPrisma.employee.count.mockResolvedValue(142);
      mockPrisma.department.count.mockResolvedValue(12);
      mockPrisma.vacation.count
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(10);
      mockPrisma.leave.count
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5);
      mockPrisma.recruitment.count.mockResolvedValue(5);
      mockPrisma.application.count
        .mockResolvedValueOnce(87)
        .mockResolvedValueOnce(12);

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
      });
    });

    it("should return zeros when database is empty", async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.department.count.mockResolvedValue(0);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);

      const result = await service.getStats({});

      expect(result.totalEmployees).toBe(0);
      expect(result.totalDepartments).toBe(0);
      expect(result.pendingVacations).toBe(0);
      expect(result.pendingLeaves).toBe(0);
      expect(result.activeAbsences).toBe(0);
      expect(result.openJobs).toBe(0);
      expect(result.totalApplications).toBe(0);
      expect(result.hiredCount).toBe(0);
    });

    it("should calculate activeAbsences as sum of active vacations and leaves", async () => {
      mockPrisma.employee.count.mockResolvedValue(10);
      mockPrisma.department.count.mockResolvedValue(2);
      mockPrisma.vacation.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(7);
      mockPrisma.leave.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(3);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);

      const result = await service.getStats({});

      expect(result.activeAbsences).toBe(10);
    });

    it("should execute all queries in parallel via Promise.all", async () => {
      mockPrisma.employee.count.mockResolvedValue(1);
      mockPrisma.department.count.mockResolvedValue(1);
      mockPrisma.vacation.count.mockResolvedValue(0);
      mockPrisma.leave.count.mockResolvedValue(0);
      mockPrisma.recruitment.count.mockResolvedValue(0);
      mockPrisma.application.count.mockResolvedValue(0);

      await service.getStats({});

      expect(mockPrisma.employee.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.department.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.vacation.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.leave.count).toHaveBeenCalledTimes(2);
      expect(mockPrisma.recruitment.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.application.count).toHaveBeenCalledTimes(2);
    });
  });
});
