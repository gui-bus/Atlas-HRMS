import { Test, TestingModule } from "@nestjs/testing";
import { TimeAttendanceService } from "./time-attendance.service";
import { PrismaService } from "../common/prisma.service";
import { ForbiddenException, BadRequestException } from "@nestjs/common";
import { TimeRecordType, TimeRecordSource } from "@prisma/client";

describe("TimeAttendanceService (Unit)", () => {
  let service: TimeAttendanceService;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    vacation: {
      findFirst: jest.fn(),
    },
    leave: {
      findFirst: jest.fn(),
    },
    timeRecord: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    timeSchedule: {
      findUnique: jest.fn(),
    },
    timeDaySummary: {
      upsert: jest.fn(),
    },
    hourBankLedger: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeAttendanceService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TimeAttendanceService>(TimeAttendanceService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("clockIn", () => {
    it("should throw ForbiddenException if user is not employee", async () => {
      (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.clockIn("usr-invalid", TimeRecordSource.WEB)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException if employee is INACTIVE", async () => {
      (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({
        id: "emp-1",
        status: "INACTIVE",
      });

      await expect(service.clockIn("usr-1", TimeRecordSource.WEB)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should successfully clock in ENTRY when no records exist today", async () => {
      (mockPrisma.employee.findUnique as jest.Mock).mockResolvedValue({
        id: "emp-1",
        status: "ACTIVE",
      });
      (mockPrisma.vacation.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.leave.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.timeRecord.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.timeRecord.create as jest.Mock).mockResolvedValue({
        id: "rec-1",
        type: TimeRecordType.ENTRY,
      });

      const res = await service.clockIn("usr-1", TimeRecordSource.WEB);
      expect(res.type).toBe(TimeRecordType.ENTRY);
    });
  });
});
