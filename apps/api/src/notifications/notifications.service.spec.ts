import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../common/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("NotificationsService (Unit)", () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: { findFirst: jest.fn() },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should throw NotFoundException if destination user does not exist", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.create("u-1", "Msg")).rejects.toThrow(NotFoundException);
    });

    it("should create notification if user exists", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: "u-1" });
      mockPrisma.notification.create.mockResolvedValue({ id: "n-1", message: "Msg", userId: "u-1" });

      const res = await service.create("u-1", "Msg");
      expect(res).toHaveProperty("id");
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });
  });

  describe("markAsRead", () => {
    it("should throw NotFoundException if notification does not exist", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);
      await expect(service.markAsRead("n-1", "u-1", false)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if requester is not the owner and not admin", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: "n-1", userId: "u-owner" });
      await expect(service.markAsRead("n-1", "u-stranger", false)).rejects.toThrow(ForbiddenException);
    });

    it("should mark as read if requester is owner", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: "n-1", userId: "u-owner" });
      mockPrisma.notification.update.mockResolvedValue({ id: "n-1", read: true });

      const res = await service.markAsRead("n-1", "u-owner", false);
      expect(res).toBeDefined();
      expect(mockPrisma.notification.update).toHaveBeenCalled();
    });

    it("should mark as read if requester is admin even if not owner", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: "n-1", userId: "u-owner" });
      mockPrisma.notification.update.mockResolvedValue({ id: "n-1", read: true });

      const res = await service.markAsRead("n-1", "u-admin", true);
      expect(res).toBeDefined();
      expect(mockPrisma.notification.update).toHaveBeenCalled();
    });
  });
});
