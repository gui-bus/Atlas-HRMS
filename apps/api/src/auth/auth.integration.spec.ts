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
import { JwtService } from "@nestjs/jwt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

interface MockPrismaService {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    findFirst: jest.Mock;
  };
}

describe("Auth Integration Tests (Supertest)", () => {
  let app: INestApplication;
  let prisma: MockPrismaService;

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
        findFirst: jest.fn(),
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
        confirmPassword: "SecurePassword123#",
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
        confirmPassword: "123",
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

  describe("GET /auth/me (session restore)", () => {
    it("should return the user profile with 200 when authenticated", async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      const jwtService = app.get(JwtService);
      const accessToken = jwtService.sign({ sub: "user-id", role: UserRole.EMPLOYEE });

      const response = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe("integration@atlas.com");
    });
  });

  describe("POST /auth/forgot-password", () => {
    it("should accept registered email and return 200", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post("/auth/forgot-password")
        .send({ email: "integration@atlas.com" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /auth/reset-password", () => {
    it("should accept valid token and password and reset password successfully", async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      const response = await request(app.getHttpServer())
        .post("/auth/reset-password")
        .send({ token: "t-123", password: "NewPassword123#" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
    });
  });
});
