import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";
import { AuditService } from "../audit/audit.service";
import { UserRole } from "@prisma/client";

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

describe("AuthService", () => {
  let service: AuthService;
  let prisma: MockPrismaService;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const jwtServiceMock = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const auditServiceMock = {
      logAction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
    auditService = module.get(AuditService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should throw BadRequestException if passwords do not match", async () => {
      const dto = {
        email: "new@atlas.com",
        password: "Password123#",
        confirmPassword: "DifferentPassword123#",
        role: UserRole.EMPLOYEE,
      };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should successfully register a user", async () => {
      const dto = {
        email: "new@atlas.com",
        password: "Password123#",
        confirmPassword: "Password123#",
        role: UserRole.EMPLOYEE,
      };
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

      const createdUser = {
        id: "user-id",
        email: dto.email,
        role: dto.role,
        isActive: true,
        createdAt: new Date(),
      };
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(auditService.logAction).toHaveBeenCalledWith(
        "user-id",
        "USER_REGISTER",
        expect.stringContaining(dto.email),
      );
      expect(result).toEqual(createdUser);
    });

    it("should throw ConflictException if email is already taken", async () => {
      const dto = {
        email: "exists@atlas.com",
        password: "Password123#",
        confirmPassword: "Password123#",
        role: UserRole.EMPLOYEE,
      };
      prisma.user.findUnique.mockResolvedValue({ id: "existing-id" });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const mockUser = {
      id: "user-id",
      email: "user@atlas.com",
      password: "hashed-password",
      role: UserRole.EMPLOYEE,
      isActive: true,
      failedAttempts: 0,
      lockoutUntil: null,
    };

    it("should login successfully with correct credentials", async () => {
      const dto = { email: "user@atlas.com", password: "Password123#" };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token");

      const result = await service.login(dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { failedAttempts: 0, lockoutUntil: null },
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        "USER_LOGIN_SUCCESS",
        expect.any(String),
      );
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    it("should throw UnauthorizedException if password is wrong and lock account on 5th failure", async () => {
      const dto = { email: "user@atlas.com", password: "WrongPassword" };

      const userWith4Failures = { ...mockUser, failedAttempts: 4 };
      prisma.user.findUnique.mockResolvedValue(userWith4Failures);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          failedAttempts: 5,
          lockoutUntil: expect.any(Date),
        },
      });
      expect(auditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        "USER_LOCKOUT_WARN",
        expect.any(String),
      );
    });

    it("should throw UnauthorizedException if account is locked", async () => {
      const dto = { email: "user@atlas.com", password: "Password123#" };
      const lockedUser = {
        ...mockUser,
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1000), // locked for 10m
      };
      prisma.user.findUnique.mockResolvedValue(lockedUser);

      await expect(service.login(dto)).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining("bloqueada temporariamente"),
        }),
      );
      expect(auditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        "USER_LOGIN_LOCKED",
        expect.any(String),
      );
    });
  });

  describe("findMe", () => {
    it("should throw UnauthorizedException if user not found", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.findMe("non-existing")).rejects.toThrow(UnauthorizedException);
    });

    it("should return profile details including employee avatarUrl if present", async () => {
      const userProfile = {
        id: "u-1",
        email: "u1@atlas.com",
        role: UserRole.ADMIN,
        isActive: true,
        employee: {
          id: "emp-1",
          firstName: "John",
          lastName: "Doe",
          personalData: { avatarUrl: "https://photo.png" },
        },
      };
      prisma.user.findFirst.mockResolvedValue(userProfile);

      const result = await service.findMe("u-1");
      expect(result).toEqual({
        id: "u-1",
        email: "u1@atlas.com",
        role: UserRole.ADMIN,
        isActive: true,
        employee: {
          id: "emp-1",
          firstName: "John",
          lastName: "Doe",
          avatarUrl: "https://photo.png",
        },
      });
    });
  });

  describe("forgotPassword", () => {
    it("should throw NotFoundException if email does not exist", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.forgotPassword("unknown@email.com")).rejects.toThrow(NotFoundException);
    });

    it("should generate hex token, save and return message", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u-1", email: "known@email.com" });
      prisma.user.update.mockResolvedValue({ id: "u-1" });
      
      // Mock process.env.RESEND_API_KEY to trigger mockResend
      const originalApiKey = process.env.RESEND_API_KEY;
      process.env.RESEND_API_KEY = "dummy_key";

      const result = await service.forgotPassword("known@email.com");
      expect(result).toHaveProperty("message");
      expect(prisma.user.update).toHaveBeenCalled();
      
      process.env.RESEND_API_KEY = originalApiKey;
    });
  });

  describe("resetPassword", () => {
    it("should throw BadRequestException if token is invalid or expired", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.resetPassword("bad-token", "NewPassword123#")).rejects.toThrow(BadRequestException);
    });

    it("should update password, clear token and reset failedAttempts", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "u-1", email: "known@email.com" });
      prisma.user.update.mockResolvedValue({ id: "u-1" });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-pass");

      const result = await service.resetPassword("good-token", "NewPassword123#");
      expect(result).toHaveProperty("message");
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          password: "hashed-pass",
          resetToken: null,
          resetTokenExp: null,
          failedAttempts: 0,
        }),
      }));
    });
  });
});
