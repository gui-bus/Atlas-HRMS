import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "@prisma/client";
import { Response } from "express";

import { JwtService } from "@nestjs/jwt";

describe("AuthController", () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn(), signAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should call authService.register and return the user", async () => {
      const dto: RegisterDto = {
        email: "register@atlas.com",
        password: "Password123#",
        confirmPassword: "Password123#",
        role: UserRole.EMPLOYEE,
      };
      const expectedUser = {
        id: "id",
        email: dto.email,
        role: dto.role || UserRole.EMPLOYEE,
        isActive: true,
        createdAt: new Date(),
      };
      service.register.mockResolvedValue(expectedUser);

      const result = await controller.register(dto);

      expect(service.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe("login", () => {
    it("should login, set cookie and return access token", async () => {
      const dto: LoginDto = { email: "login@atlas.com", password: "Password123#" };
      const serviceResult = {
        user: { id: "id", email: dto.email, role: UserRole.EMPLOYEE },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      service.login.mockResolvedValue(serviceResult);

      const resMock = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(dto, resMock);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(resMock.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
      expect(result).toEqual({
        user: serviceResult.user,
        accessToken: "access-token",
      });
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success", async () => {
      const resMock = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(resMock);

      expect(resMock.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: "none",
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe("findMe", () => {
    it("should return the profile details for authenticated user", async () => {
      const mockProfile = { id: "u-1", email: "me@atlas.com", role: UserRole.EMPLOYEE };
      (service as any).findMe = jest.fn().mockResolvedValue(mockProfile);

      const result = await controller.findMe({ sub: "u-1" });
      expect(result).toEqual(mockProfile);
      expect((service as any).findMe).toHaveBeenCalledWith("u-1");
    });
  });

  describe("forgotPassword", () => {
    it("should request password reset link and token", async () => {
      const serviceResult = { message: "Token enviado" };
      (service as any).forgotPassword = jest.fn().mockResolvedValue(serviceResult);

      const result = await controller.forgotPassword({ email: "forgot@email.com" });
      expect(result).toEqual(serviceResult);
      expect((service as any).forgotPassword).toHaveBeenCalledWith("forgot@email.com");
    });
  });

  describe("resetPassword", () => {
    it("should submit new password with token", async () => {
      const serviceResult = { message: "Senha alterada" };
      (service as any).resetPassword = jest.fn().mockResolvedValue(serviceResult);

      const result = await controller.resetPassword({ token: "t-123", password: "NewPassword123#" });
      expect(result).toEqual(serviceResult);
      expect((service as any).resetPassword).toHaveBeenCalledWith("t-123", "NewPassword123#");
    });
  });
});
