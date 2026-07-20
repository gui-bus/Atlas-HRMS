import { Test, TestingModule } from "@nestjs/testing";
import { VacationsService } from "./vacations.service";
import { PrismaService } from "../common/prisma.service";
import { NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { NotificationsService } from "../notifications/notifications.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { VacationStatus, LeaveStatus, LeaveType } from "@prisma/client";

describe("VacationsService (Unit)", () => {
  let service: VacationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    vacation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    leave: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacationsService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue({ id: "n-1" }) },
        },
        {
          provide: UploadthingService,
          useValue: { deleteFile: jest.fn().mockResolvedValue({ success: true }) },
        },
      ],
    }).compile();

    service = module.get<VacationsService>(VacationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createVacation", () => {
    const validDto = {
      startDate: "2026-08-01",
      endDate: "2026-08-15",
      employeeId: "emp-1",
    };

    it("should create vacation successfully if aquisitive period is met and no overlap", async () => {
      
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp-1",
        hireDate: new Date("2024-01-01"),
      });
      mockPrisma.vacation.findFirst.mockResolvedValue(null);
      mockPrisma.vacation.create.mockResolvedValue({ id: "vac-1", ...validDto });

      const result = await service.createVacation(validDto);
      expect(result).toBeDefined();
      expect(mockPrisma.vacation.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if employee has not completed 12 months", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp-1",
        
        hireDate: new Date(),
      });

      await expect(service.createVacation(validDto)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException on overlapping vacation periods", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp-1",
        hireDate: new Date("2024-01-01"),
      });
      mockPrisma.vacation.findFirst.mockResolvedValue({ id: "overlap-vac" });

      await expect(service.createVacation(validDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("createLeave (Atestados)", () => {
    const leaveDto = {
      startDate: "2026-09-10",
      endDate: "2026-09-15",
      type: LeaveType.MEDICAL,
      description: "Cirurgia",
      attachmentUrl: "https://utfs.io/f/atestado.pdf",
      employeeId: "emp-1",
    };

    it("should create leave request successfully", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: "emp-1" });
      mockPrisma.leave.findFirst.mockResolvedValue(null);
      mockPrisma.leave.create.mockResolvedValue({ id: "leave-1", ...leaveDto });

      const result = await service.createLeave(leaveDto);
      expect(result).toBeDefined();
      expect(mockPrisma.leave.create).toHaveBeenCalled();
    });
  });
});
