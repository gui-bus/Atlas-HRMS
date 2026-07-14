import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "@prisma/client";
import { Response } from "express";

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
      providers: [{ provide: AuthService, useValue: authServiceMock }],
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
});
