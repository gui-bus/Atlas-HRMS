import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { RecruitmentModule } from "./recruitment.module";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { AuditService } from "../audit/audit.service";
import {
  UserRole,
  RecruitmentStatus,
  EmploymentType,
  WorkModel,
  Seniority,
  ApplicationStatus,
} from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

import { AuditModule } from "../audit/audit.module";
import { UploadthingModule } from "../common/uploadthing/uploadthing.module";

const DEPT_ID = "a7b6a4a6-7a13-43ef-b209-efdb17eddfb1";
const POS_ID = "b7b6a4a6-7a13-43ef-b209-efdb17eddfb1";
const REC_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const APP_ID = "c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f";

import { NotificationsService } from "../notifications/notifications.service";

describe("Recruitment Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    recruitment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      user: { findFirst: jest.fn() },
    },
    candidate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: "user-1", email: "candidate@email.com" }),
    },
    $transaction: jest.fn((cb: any) => cb(mockPrisma)),
  };

  const mockUploadthing = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  let adminToken: string;
  let hrToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, UploadthingModule, RecruitmentModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(UploadthingService)
      .useValue(mockUploadthing)
      .overrideProvider(AuditService)
      .useValue(mockAudit)
      .overrideProvider(NotificationsService)
      .useValue({ create: jest.fn().mockResolvedValue({ id: "n-1" }) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    adminToken = jwtService.sign({ sub: "user-admin", role: UserRole.ADMIN });
    hrToken = jwtService.sign({ sub: "user-hr", role: UserRole.HR });
    employeeToken = jwtService.sign({ sub: "user-emp", role: UserRole.EMPLOYEE });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================== PUBLIC ROUTES =====================

  describe("GET /recruitments (public)", () => {
    it("should list open recruitments without auth", async () => {
      mockPrisma.recruitment.findMany.mockResolvedValue([]);
      mockPrisma.recruitment.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer()).get("/recruitments");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("total");
    });

    it("should support pagination query params", async () => {
      mockPrisma.recruitment.findMany.mockResolvedValue([]);
      mockPrisma.recruitment.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer()).get("/recruitments?page=2&limit=5");

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(5);
    });
  });

  describe("GET /recruitments/:slug (public)", () => {
    it("should return recruitment details by slug", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: REC_ID,
        title: "Dev Backend",
        slug: "dev-backend-abc",
        description: "desc",
        status: RecruitmentStatus.OPEN,
        employmentType: EmploymentType.CLT,
        workModel: WorkModel.HYBRID,
        seniority: Seniority.SENIOR,
        vacancies: 1,
        salaryMin: null,
        salaryMax: null,
        isSalaryVisible: false,
        city: "BH",
        state: "MG",
        country: "Brasil",
        requirements: null,
        responsibilities: null,
        benefits: null,
        publishedAt: new Date(),
        expiresAt: null,
        deletedAt: null,
        views: 0,
        department: { name: "Tech" },
        position: { title: "Dev" },
      });
      mockPrisma.recruitment.update.mockResolvedValue({});

      const response = await request(app.getHttpServer()).get("/recruitments/dev-backend-abc");

      expect(response.status).toBe(200);
      expect(response.body.slug).toBe("dev-backend-abc");
    });

    it("should return 404 for non-existent slug", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer()).get("/recruitments/non-existent");

      expect(response.status).toBe(404);
    });
  });

  // ===================== ADMIN ROUTES =====================

  describe("POST /recruitments/admin (authenticated)", () => {
    const validDto = {
      title: "Desenvolvedor Full-Stack",
      description: "Vaga para full-stack com React e NestJS",
      employmentType: "CLT",
      workModel: "HYBRID",
      seniority: "SENIOR",
      departmentId: DEPT_ID,
      positionId: POS_ID,
    };

    it("should allow ADMIN to create recruitment", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue(null);
      mockPrisma.recruitment.create.mockResolvedValue({
        id: REC_ID,
        ...validDto,
        slug: "desenvolvedor-full-stack-abc123",
      });

      const response = await request(app.getHttpServer())
        .post("/recruitments/admin")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should allow HR to create recruitment", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue(null);
      mockPrisma.recruitment.create.mockResolvedValue({
        id: REC_ID,
        ...validDto,
        slug: "desenvolvedor-full-stack-xyz",
      });

      const response = await request(app.getHttpServer())
        .post("/recruitments/admin")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
    });

    it("should forbid EMPLOYEE from creating recruitment", async () => {
      const response = await request(app.getHttpServer())
        .post("/recruitments/admin")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(validDto);

      expect(response.status).toBe(403);
    });

    it("should return 401 without auth", async () => {
      const response = await request(app.getHttpServer())
        .post("/recruitments/admin")
        .send(validDto);

      expect(response.status).toBe(401);
    });

    it("should return 400 with invalid data", async () => {
      const response = await request(app.getHttpServer())
        .post("/recruitments/admin")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Only title" });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /recruitments/admin/:id (authenticated)", () => {
    it("should allow ADMIN to update recruitment", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue({
        id: REC_ID,
        title: "Old",
        publishedAt: null,
      });
      mockPrisma.recruitment.update.mockResolvedValue({
        id: REC_ID,
        title: "Updated Title",
      });

      const response = await request(app.getHttpServer())
        .put(`/recruitments/admin/${REC_ID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(200);
    });

    it("should forbid EMPLOYEE from updating", async () => {
      const response = await request(app.getHttpServer())
        .put(`/recruitments/admin/${REC_ID}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({ title: "Hack" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /recruitments/admin/:id (authenticated)", () => {
    it("should allow HR to soft-delete recruitment", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue({
        id: REC_ID,
        title: "Test",
      });
      mockPrisma.recruitment.update.mockResolvedValue({
        id: REC_ID,
        deletedAt: new Date(),
        title: "Test",
      });

      const response = await request(app.getHttpServer())
        .delete(`/recruitments/admin/${REC_ID}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
    });

    it("should forbid EMPLOYEE from deleting", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/recruitments/admin/${REC_ID}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /recruitments/applications/:id/status (authenticated)", () => {
    it("should allow ADMIN to update application status", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: APP_ID,
        status: ApplicationStatus.SUBMITTED,
        candidate: { firstName: "M", lastName: "O" },
        recruitment: { title: "Dev" },
      });
      mockPrisma.application.update.mockResolvedValue({
        id: APP_ID,
        status: ApplicationStatus.HR_INTERVIEW,
      });

      const response = await request(app.getHttpServer())
        .put(`/recruitments/applications/${APP_ID}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "HR_INTERVIEW" });

      expect(response.status).toBe(200);
    });

    it("should forbid EMPLOYEE from updating status", async () => {
      const response = await request(app.getHttpServer())
        .put(`/recruitments/applications/${APP_ID}/status`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({ status: "SCREENING" });

      expect(response.status).toBe(403);
    });
  });

  describe("POST /recruitments/applications/:id/hire (authenticated)", () => {
    it("should allow ADMIN to hire candidate", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: APP_ID,
        status: ApplicationStatus.OFFER,
        candidate: {
          firstName: "Maria",
          lastName: "O",
          email: "m@g.com",
          phone: "123",
        },
        recruitment: {
          title: "Dev",
          departmentId: DEPT_ID,
          positionId: POS_ID,
          department: { id: DEPT_ID },
          position: { id: POS_ID, salaryRangeMin: "8000" },
        },
      });
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.employee.create.mockResolvedValue({ id: "emp-new" });
      mockPrisma.application.update.mockResolvedValue({
        id: APP_ID,
        status: ApplicationStatus.HIRED,
      });

      const response = await request(app.getHttpServer())
        .post(`/recruitments/applications/${APP_ID}/hire`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
    });

    it("should forbid EMPLOYEE from hiring", async () => {
      const response = await request(app.getHttpServer())
        .post(`/recruitments/applications/${APP_ID}/hire`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
