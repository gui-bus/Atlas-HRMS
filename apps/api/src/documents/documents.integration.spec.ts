import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { CommonModule } from "../common/common.module";
import { DocumentsModule } from "./documents.module";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { UserRole } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";

import { AuditModule } from "../audit/audit.module";
import { AuditService } from "../audit/audit.service";
import { UploadthingModule } from "../common/uploadthing/uploadthing.module";

const EMP_ID = "d3b07384-d113-4a0b-bc11-ce1338dfd1d2";
const EMP_OTHER_ID = "a1b2c3d4-e5f6-4a0b-bc11-ce1338dfd1d3";
const DOC_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

describe("Documents Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockPrisma = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
    },
  };

  const mockUploadthing = {
    deleteFile: jest.fn(),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  let adminToken: string;
  let hrToken: string;
  let managerToken: string;
  let employeeToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, UploadthingModule, DocumentsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .overrideProvider(UploadthingService)
      .useValue(mockUploadthing)
      .overrideProvider(AuditService)
      .useValue(mockAudit)
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

  describe("POST /documents", () => {
    const validDto = {
      name: "RG - João da Silva",
      type: "IDENTIFICATION",
      url: "https://utfs.io/f/abc123-rg.pdf",
      employeeId: EMP_ID,
    };

    it("should allow ADMIN to create a document", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: EMP_ID });
      mockPrisma.document.create.mockResolvedValue({ id: DOC_ID, ...validDto });

      const response = await request(app.getHttpServer())
        .post("/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    it("should allow EMPLOYEE to create document for themselves", async () => {
      mockPrisma.employee.findFirst
        .mockResolvedValueOnce({ id: EMP_ID, userId: "user-emp" })
        .mockResolvedValueOnce({ id: EMP_ID });
      mockPrisma.document.create.mockResolvedValue({ id: DOC_ID, ...validDto });

      const response = await request(app.getHttpServer())
        .post("/documents")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(validDto);

      expect(response.status).toBe(201);
    });

    it("should return 403 when EMPLOYEE tries to create document for another employee", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: EMP_OTHER_ID, userId: "user-emp" });

      const response = await request(app.getHttpServer())
        .post("/documents")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(validDto);

      expect(response.status).toBe(403);
    });

    it("should return 400 with invalid document type", async () => {
      const invalidDto = { ...validDto, type: "INVALID_TYPE" };

      const response = await request(app.getHttpServer())
        .post("/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
    });

    it("should return 400 with invalid URL", async () => {
      const invalidDto = { ...validDto, url: "not-a-url" };

      const response = await request(app.getHttpServer())
        .post("/documents")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app.getHttpServer()).post("/documents").send(validDto);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /documents", () => {
    it("should allow ADMIN to list all documents", async () => {
      mockPrisma.document.findMany.mockResolvedValue([{ id: DOC_ID }]);

      const response = await request(app.getHttpServer())
        .get("/documents")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it("should allow HR to list all documents", async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get("/documents")
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
    });

    it("should allow MANAGER to list all documents", async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get("/documents")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
    });

    it("should forbid EMPLOYEE from listing all documents", async () => {
      const response = await request(app.getHttpServer())
        .get("/documents")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("GET /documents/employee/:employeeId", () => {
    it("should allow HR to list employee documents", async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get(`/documents/employee/${EMP_ID}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
    });

    it("should allow EMPLOYEE to list their own documents", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: EMP_ID, userId: "user-emp" });
      mockPrisma.document.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get(`/documents/employee/${EMP_ID}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 403 when EMPLOYEE tries to list another's documents", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: EMP_OTHER_ID, userId: "user-emp" });

      const response = await request(app.getHttpServer())
        .get(`/documents/employee/${EMP_ID}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /documents/:id", () => {
    it("should allow ADMIN to delete a document", async () => {
      mockPrisma.document.findFirst.mockResolvedValue({
        id: DOC_ID,
        url: "https://utfs.io/f/abc123.pdf",
      });
      mockPrisma.document.update.mockResolvedValue({ id: DOC_ID, deletedAt: new Date() });
      mockUploadthing.deleteFile.mockResolvedValue({ success: true });

      const response = await request(app.getHttpServer())
        .delete(`/documents/${DOC_ID}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(mockUploadthing.deleteFile).toHaveBeenCalledWith("abc123.pdf");
    });

    it("should allow HR to delete a document", async () => {
      mockPrisma.document.findFirst.mockResolvedValue({
        id: DOC_ID,
        url: "https://utfs.io/f/xyz.pdf",
      });
      mockPrisma.document.update.mockResolvedValue({ id: DOC_ID, deletedAt: new Date() });
      mockUploadthing.deleteFile.mockResolvedValue({ success: true });

      const response = await request(app.getHttpServer())
        .delete(`/documents/${DOC_ID}`)
        .set("Authorization", `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
    });

    it("should forbid MANAGER from deleting documents", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/documents/${DOC_ID}`)
        .set("Authorization", `Bearer ${managerToken}`);

      expect(response.status).toBe(403);
    });

    it("should forbid EMPLOYEE from deleting documents", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/documents/${DOC_ID}`)
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
