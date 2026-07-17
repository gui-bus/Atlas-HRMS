import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { DashboardModule } from "./dashboard.module";
import { PrismaService } from "../common/prisma.service";
import { UserRole } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { AuditModule } from "../audit/audit.module";
import { AuditService } from "../audit/audit.service";

describe("Dashboard Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    employee: {
      count: jest.fn().mockResolvedValue(50),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    department: { count: jest.fn().mockResolvedValue(5) },
    vacation: { count: jest.fn().mockResolvedValue(3), findMany: jest.fn().mockResolvedValue([]) },
    leave: { count: jest.fn().mockResolvedValue(2) },
    recruitment: { count: jest.fn().mockResolvedValue(4) },
    application: {
      count: jest.fn().mockResolvedValue(20),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    timeCorrectionRequest: { count: jest.fn().mockResolvedValue(0) },
    hourBankLedger: { findFirst: jest.fn().mockResolvedValue(null) },
    timeRecord: { count: jest.fn().mockResolvedValue(0) },
  };

  let adminToken: string;
  let hrToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, DashboardModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(AuditService)
      .useValue({ logAction: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    adminToken = jwtService.sign({ sub: "user-admin", role: UserRole.ADMIN });
    hrToken = jwtService.sign({ sub: "user-hr", role: UserRole.HR });
    managerToken = jwtService.sign({ sub: "user-manager", role: UserRole.MANAGER });
    employeeToken = jwtService.sign({ sub: "user-emp", role: UserRole.EMPLOYEE });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.employee.count.mockResolvedValue(50);
    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.department.count.mockResolvedValue(5);
    mockPrisma.vacation.count.mockResolvedValue(3);
    mockPrisma.vacation.findMany.mockResolvedValue([]);
    mockPrisma.leave.count.mockResolvedValue(2);
    mockPrisma.recruitment.count.mockResolvedValue(4);
    mockPrisma.application.count.mockResolvedValue(20);
    mockPrisma.application.groupBy.mockResolvedValue([]);
    mockPrisma.timeCorrectionRequest.count.mockResolvedValue(0);
    mockPrisma.hourBankLedger.findFirst.mockResolvedValue(null);
    mockPrisma.timeRecord.count.mockResolvedValue(0);
  });

  describe("GET /dashboard", () => {
    it("should allow ADMIN to access dashboard stats", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalEmployees");
      expect(response.body).toHaveProperty("totalDepartments");
      expect(response.body).toHaveProperty("pendingVacations");
      expect(response.body).toHaveProperty("pendingLeaves");
      expect(response.body).toHaveProperty("activeAbsences");
      expect(response.body).toHaveProperty("openJobs");
      expect(response.body).toHaveProperty("totalApplications");
      expect(response.body).toHaveProperty("hiredCount");
    });

    it("should return the 3 new fields: newHiresThisMonth, pendingCorrections, applicationsByStage", async () => {
      mockPrisma.application.groupBy.mockResolvedValue([
        { status: "SUBMITTED", _count: { status: 10 } },
        { status: "HIRED", _count: { status: 5 } },
      ]);

      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("newHiresThisMonth");
      expect(response.body).toHaveProperty("pendingCorrections");
      expect(response.body).toHaveProperty("applicationsByStage");
      expect(typeof response.body.newHiresThisMonth).toBe("number");
      expect(typeof response.body.pendingCorrections).toBe("number");
      expect(typeof response.body.applicationsByStage).toBe("object");
    });

    it("should allow HR to access dashboard stats", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("totalEmployees");
    });

    it("should allow MANAGER to access dashboard stats", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
    });

    it("should forbid EMPLOYEE from accessing dashboard stats", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).get("/dashboard");

      expect(response.status).toBe(401);
    });

    it("should return numeric values for all metrics", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(typeof response.body.totalEmployees).toBe("number");
      expect(typeof response.body.activeAbsences).toBe("number");
      expect(typeof response.body.openJobs).toBe("number");
      expect(typeof response.body.newHiresThisMonth).toBe("number");
      expect(typeof response.body.pendingCorrections).toBe("number");
    });
  });

  describe("GET /dashboard/employee-summary", () => {
    it("should return 200 for EMPLOYEE role", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/employee-summary")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("hourBankBalance");
      expect(response.body).toHaveProperty("pendingVacationsCount");
      expect(response.body).toHaveProperty("pendingLeavesCount");
      expect(response.body).toHaveProperty("todayRecordsCount");
      expect(response.body).toHaveProperty("upcomingVacations");
    });

    it("should return 200 for ADMIN role", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/employee-summary")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 200 for HR role", async () => {
      const response = await request(app.getHttpServer())
        .get("/dashboard/employee-summary")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
    });

    it("should return zeros when employee record is not linked to user", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get("/dashboard/employee-summary")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.hourBankBalance).toBe(0);
      expect(response.body.pendingVacationsCount).toBe(0);
      expect(response.body.upcomingVacations).toEqual([]);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).get("/dashboard/employee-summary");

      expect(response.status).toBe(401);
    });
  });
});
