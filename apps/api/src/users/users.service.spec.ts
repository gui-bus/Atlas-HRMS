import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../common/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { UserRole } from "@prisma/client";

import { UploadthingService } from "../common/uploadthing/uploadthing.service";

describe("UsersService (Unit)", () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadthingService, useValue: { uploadFile: jest.fn(), deleteFile: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return users mapping active state", async () => {
      const mockList = [{ id: "u-1", email: "a@a.com", role: UserRole.EMPLOYEE, isActive: true }];
      mockPrisma.user.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();
      expect(result).toEqual(mockList);
    });
  });

  describe("findOne", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.findOne("u-invalid")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should throw NotFoundException if user not found", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.update("u-invalid", { role: UserRole.ADMIN })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should update user successfully", async () => {
      const mockUser = { id: "u-123", email: "user@atlas.com" };
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      const updateMock = jest.fn().mockResolvedValue({ id: "u-123", role: UserRole.ADMIN });
      mockPrisma.user.update = updateMock;

      await service.update("u-123", { role: UserRole.ADMIN });
      expect(updateMock).toHaveBeenCalledWith({
        where: { id: "u-123" },
        data: { role: UserRole.ADMIN, isActive: undefined },
      });
    });
  });
});
