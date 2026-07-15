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
    employee: { count: jest.fn().mockResolvedValue(50) },
    department: { count: jest.fn().mockResolvedValue(5) },
    vacation: { count: jest.fn().mockResolvedValue(3) },
    leave: { count: jest.fn().mockResolvedValue(2) },
    recruitment: { count: jest.fn().mockResolvedValue(4) },
    application: { count: jest.fn().mockResolvedValue(20) },
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
    mockPrisma.department.count.mockResolvedValue(5);
    mockPrisma.vacation.count.mockResolvedValue(3);
    mockPrisma.leave.count.mockResolvedValue(2);
    mockPrisma.recruitment.count.mockResolvedValue(4);
    mockPrisma.application.count.mockResolvedValue(20);
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

    it("should forbid EMPLOYEE from accessing dashboard", async () => {
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
    });
  });
});
