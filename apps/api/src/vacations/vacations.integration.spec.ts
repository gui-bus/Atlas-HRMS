import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { VacationsModule } from "./vacations.module";
import { PrismaService } from "../common/prisma.service";
import { UserRole, VacationStatus, LeaveStatus, LeaveType } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { AuditModule } from "../audit/audit.module";
import { AuditService } from "../audit/audit.service";

describe("Vacations Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

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

  const mockAudit = {
    logAction: jest.fn(),
  };

  let hrToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, VacationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(AuditService)
      .useValue(mockAudit)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test tokens
    hrToken = jwtService.sign({ sub: "user-hr", role: UserRole.HR });
    employeeToken = jwtService.sign({ sub: "user-emp", role: UserRole.EMPLOYEE });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /vacations", () => {
    it("should allow HR access and return vacations", async () => {
      mockPrisma.vacation.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get("/vacations")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should forbid Employee access", async () => {
      const response = await request(app.getHttpServer())
        .get("/vacations")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("POST /vacations", () => {
    const validDto = {
      startDate: "2026-08-01",
      endDate: "2026-08-15",
      employeeId: "emp-1",
    };

    it("should request vacation successfully", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp-1",
        hireDate: new Date("2024-01-01"),
      });
      mockPrisma.vacation.findFirst.mockResolvedValue(null);
      mockPrisma.vacation.create.mockResolvedValue({ id: "vac-1", ...validDto });

      // Using mock bypass check ownership on helper for HR token
      const response = await request(app.getHttpServer())
        .post("/vacations")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });
  });
});
