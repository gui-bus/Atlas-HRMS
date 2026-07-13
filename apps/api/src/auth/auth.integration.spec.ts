import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import * as bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { CommonModule } from "../common/common.module";
import { AuditModule } from "../audit/audit.module";
import { AuthModule } from "./auth.module";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../audit/audit.service";
import { UserRole } from "@prisma/client";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("Auth Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let prisma: jest.Mocked<any>;

  const mockUser = {
    id: "user-id",
    email: "integration@atlas.com",
    password: "hashed-password",
    role: UserRole.EMPLOYEE,
    isActive: true,
    failedAttempts: 0,
    lockoutUntil: null,
  };

  beforeAll(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const auditMock = {
      logAction: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommonModule, AuditModule, AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(AuditService)
      .useValue(auditMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should return 201 and created user details on success", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
      prisma.user.create.mockResolvedValue({
        id: "new-user-id",
        email: "register-integration@atlas.com",
        role: UserRole.EMPLOYEE,
        isActive: true,
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer()).post("/auth/register").send({
        email: "register-integration@atlas.com",
        password: "SecurePassword123#",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("register-integration@atlas.com");
      expect(response.body).not.toHaveProperty("password");
    });

    it("should return 400 if password does not meet strength requirements", async () => {
      const response = await request(app.getHttpServer()).post("/auth/register").send({
        email: "weak@atlas.com",
        password: "123", // too weak, no special char, uppercase or length
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining("mínimo 8 caracteres")]),
      );
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 and set cookies on valid credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app.getHttpServer()).post("/auth/login").send({
        email: "integration@atlas.com",
        password: "SecurePassword123#",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body.user.email).toBe("integration@atlas.com");

      // Verify secure HTTPOnly cookie
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("refreshToken=");
      expect(cookies[0]).toContain("HttpOnly");
    });

    it("should return 401 on incorrect credentials", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app.getHttpServer()).post("/auth/login").send({
        email: "integration@atlas.com",
        password: "wrong-password",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Credenciais inválidas");
    });
  });

  describe("POST /auth/logout", () => {
    it("should clear the refresh token cookie and return success", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", ["refreshToken=existing-token"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("refreshToken=;"); // cleared
    });
  });
});
