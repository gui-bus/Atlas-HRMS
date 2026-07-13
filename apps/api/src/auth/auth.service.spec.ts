import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
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
});
