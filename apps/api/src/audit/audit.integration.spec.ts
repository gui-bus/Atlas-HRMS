import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { AuditModule } from "./audit.module";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "./audit.service";
import { UserRole } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

describe("Audit Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockAuditLogs = [
    {
      id: "log-1",
      action: "JOB_CREATED",
      details: 'Vaga "Dev Backend" criada',
      timestamp: new Date(),
      user: { id: "u1", email: "admin@atlas.com", role: "ADMIN" },
    },
    {
      id: "log-2",
      action: "APPLICATION_RECEIVED",
      details: "Candidatura recebida de Maria Oliveira",
      timestamp: new Date(),
      user: null,
    },
  ];

  const mockPrisma = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  let adminToken: string;
  let hrToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
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
  });

  describe("GET /audit", () => {
    it("should allow ADMIN to list audit logs", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue(mockAuditLogs);

      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
    });

    it("should allow HR to list audit logs", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue(mockAuditLogs);

      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it("should forbid MANAGER from accessing audit logs", async () => {
      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
    });

    it("should forbid EMPLOYEE from accessing audit logs", async () => {
      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).get("/audit");

      expect(response.status).toBe(401);
    });

    it("should return logs with user relationship (nullable)", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue(mockAuditLogs);

      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].user).toBeDefined();
      expect(response.body[0].user.email).toBe("admin@atlas.com");
      expect(response.body[1].user).toBeNull();
    });

    it("should return empty array when no logs exist", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get("/audit")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
});
