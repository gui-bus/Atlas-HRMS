import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { NotificationsModule } from "./notifications.module";
import { PrismaService } from "../common/prisma.service";
import { UserRole } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { AuditModule } from "../audit/audit.module";

describe("Notifications Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    user: { findFirst: jest.fn().mockResolvedValue({ id: "user-target" }) },
    notification: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let hrToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, NotificationsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    hrToken = jwtService.sign({ sub: "user-hr", role: UserRole.HR });
    employeeToken = jwtService.sign({ sub: "user-emp", role: UserRole.EMPLOYEE });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /notifications", () => {
    it("should allow authenticated users to list their notifications", async () => {
      const response = await request(app.getHttpServer())
        .get("/notifications")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return 401 for unauthenticated calls", async () => {
      const response = await request(app.getHttpServer()).get("/notifications");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /notifications", () => {
    const payload = { userId: "e674b88d-69d5-45db-b27b-b5cc04a43b12", message: "Hello!" };

    it("should allow HR to create notification", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: "user-target" });
      mockPrisma.notification.create.mockResolvedValue({ id: "n-1", ...payload });

      const response = await request(app.getHttpServer())
        .post("/notifications")
        .set("Authorization", `Bearer ${hrToken}`)
        .send(payload);

      expect(response.status).toBe(201);
    });

    it("should forbid EMPLOYEE from creating notifications", async () => {
      const response = await request(app.getHttpServer())
        .post("/notifications")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(payload);

      expect(response.status).toBe(403);
    });
  });
});
