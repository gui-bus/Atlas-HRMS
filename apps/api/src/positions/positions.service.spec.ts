import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { PositionsService } from "./positions.service";
import { PrismaService } from "../common/prisma.service";

interface MockPrismaService {
  position: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  department: {
    findFirst: jest.Mock;
  };
}

describe("PositionsService", () => {
  let service: PositionsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const prismaMock = {
      position: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      department: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PositionsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<PositionsService>(PositionsService);
    prisma = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all active positions", async () => {
      const mockResult = [{ id: "1", title: "Backend Engineer", deletedAt: null }];
      prisma.position.findMany.mockResolvedValue(mockResult);

      const result = await service.findAll();
      expect(result).toEqual(mockResult);
    });
  });

  describe("findOne", () => {
    it("should return a position if found", async () => {
      const mockPos = { id: "1", title: "Backend Engineer", deletedAt: null };
      prisma.position.findFirst.mockResolvedValue(mockPos);

      const result = await service.findOne("1");
      expect(result).toEqual(mockPos);
    });

    it("should throw NotFoundException if not found", async () => {
      prisma.position.findFirst.mockResolvedValue(null);
      await expect(service.findOne("invalid")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const dto = {
      title: "Backend Engineer",
      description: "NestJS developer",
      salaryRangeMin: 5000,
      salaryRangeMax: 8000,
      departmentId: "dept-1",
      active: true,
    };

    it("should throw NotFoundException if department does not exist", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if min salary is greater than max", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({ id: "dept-1" });
      await expect(service.create({ ...dto, salaryRangeMin: 9000 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if active title already exists in department", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({ id: "dept-1" });
      prisma.position.findFirst.mockResolvedValueOnce({ id: "1", title: dto.title });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it("should restore a soft-deleted position if found in department", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({ id: "dept-1" });
      prisma.position.findFirst.mockResolvedValueOnce(null);
      prisma.position.findFirst.mockResolvedValueOnce({ id: "deleted-id", deletedAt: new Date() });

      const updatedPos = { id: "deleted-id", ...dto, deletedAt: null };
      prisma.position.update.mockResolvedValueOnce(updatedPos);

      const result = await service.create(dto);
      expect(result).toEqual(updatedPos);
    });

    it("should create a new position", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({ id: "dept-1" });
      prisma.position.findFirst.mockResolvedValueOnce(null);
      prisma.position.findFirst.mockResolvedValueOnce(null);

      const created = { id: "new-id", ...dto };
      prisma.position.create.mockResolvedValueOnce(created);

      const result = await service.create(dto);
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    const existingPos = {
      id: "1",
      title: "Backend Engineer",
      salaryRangeMin: 5000,
      salaryRangeMax: 8000,
      departmentId: "dept-1",
    };
    const updateDto = { title: "Senior Backend Engineer" };

    it("should throw NotFoundException if position is not found", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(null);
      await expect(service.update("invalid", updateDto)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if changed department does not exist", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(existingPos);
      prisma.department.findFirst.mockResolvedValueOnce(null);

      await expect(service.update("1", { departmentId: "invalid" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if updated salary range is invalid", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(existingPos);
      await expect(service.update("1", { salaryRangeMin: 9000 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw ConflictException if updated title already exists in department", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(existingPos);
      prisma.position.findFirst.mockResolvedValueOnce({
        id: "2",
        title: "Senior Backend Engineer",
      });

      await expect(service.update("1", updateDto)).rejects.toThrow(ConflictException);
    });

    it("should update and return position", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(existingPos);
      prisma.position.findFirst.mockResolvedValueOnce(null);

      const updated = { ...existingPos, ...updateDto };
      prisma.position.update.mockResolvedValueOnce(updated);

      const result = await service.update("1", updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException if position does not exist", async () => {
      prisma.position.findFirst.mockResolvedValueOnce(null);
      await expect(service.remove("invalid")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if position has active employees", async () => {
      prisma.position.findFirst.mockResolvedValueOnce({
        id: "1",
        _count: { employees: 3 },
      });

      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
    });

    it("should soft delete position", async () => {
      prisma.position.findFirst.mockResolvedValueOnce({
        id: "1",
        _count: { employees: 0 },
      });
      prisma.position.update.mockResolvedValueOnce({ id: "1", deletedAt: new Date() });

      const result = await service.remove("1");
      expect(result.deletedAt).toBeDefined();
    });
  });
});
