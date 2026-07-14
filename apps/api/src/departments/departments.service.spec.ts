import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { DepartmentsService } from "./departments.service";
import { PrismaService } from "../common/prisma.service";

interface MockPrismaService {
  department: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  employee: {
    findFirst: jest.Mock;
  };
}

describe("DepartmentsService", () => {
  let service: DepartmentsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    const prismaMock = {
      department: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      employee: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    prisma = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all active departments", async () => {
      const mockResult = [{ id: "1", name: "Engineering", code: "ENG", deletedAt: null }];
      prisma.department.findMany.mockResolvedValue(mockResult);

      const result = await service.findAll();
      expect(result).toEqual(mockResult);
      expect(prisma.department.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        include: {
          manager: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { employees: true, positions: true } },
        },
      });
    });
  });

  describe("findOne", () => {
    it("should return a department if found", async () => {
      const mockDept = { id: "1", name: "Engineering", code: "ENG", deletedAt: null };
      prisma.department.findFirst.mockResolvedValue(mockDept);

      const result = await service.findOne("1");
      expect(result).toEqual(mockDept);
    });

    it("should throw NotFoundException if department is not found", async () => {
      prisma.department.findFirst.mockResolvedValue(null);
      await expect(service.findOne("invalid-id")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const dto = {
      name: "Engineering",
      code: "ENG",
      description: "Tech",
      active: true,
    };

    it("should throw ConflictException if active name already exists", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({ id: "1", name: dto.name });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if active code already exists", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce({ id: "1", code: dto.code });
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if manager does not exist", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.employee.findFirst.mockResolvedValueOnce(null);

      await expect(service.create({ ...dto, managerId: "invalid" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should restore a soft-deleted department if found", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce({
        id: "deleted-id",
        deletedAt: new Date(),
      });

      const updatedDept = { id: "deleted-id", ...dto, deletedAt: null };
      prisma.department.update.mockResolvedValueOnce(updatedDept);

      const result = await service.create(dto);
      expect(result).toEqual(updatedDept);
      expect(prisma.department.update).toHaveBeenCalledWith({
        where: { id: "deleted-id" },
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          active: true,
          managerId: undefined,
          deletedAt: null,
        },
      });
    });

    it("should create a new department if no conflicts or soft-deleted matches", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);

      const createdDept = { id: "new-id", ...dto };
      prisma.department.create.mockResolvedValueOnce(createdDept);

      const result = await service.create(dto);
      expect(result).toEqual(createdDept);
      expect(prisma.department.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          code: dto.code,
          description: dto.description,
          active: true,
          managerId: undefined,
        },
      });
    });
  });

  describe("update", () => {
    const existingDept = { id: "1", name: "Engineering", code: "ENG", managerId: null };
    const updateDto = { name: "New Name", code: "NEW" };

    it("should throw NotFoundException if department does not exist", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      await expect(service.update("invalid", updateDto)).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if updated name is in use globally", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(existingDept);
      prisma.department.findFirst.mockResolvedValueOnce({ id: "2", name: "New Name" });

      await expect(service.update("1", updateDto)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if updated code is in use globally", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(existingDept);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce({ id: "2", code: "NEW" });

      await expect(service.update("1", updateDto)).rejects.toThrow(ConflictException);
    });

    it("should update and return department", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(existingDept);
      prisma.department.findFirst.mockResolvedValueOnce(null);
      prisma.department.findFirst.mockResolvedValueOnce(null);

      const updated = { ...existingDept, ...updateDto };
      prisma.department.update.mockResolvedValueOnce(updated);

      const result = await service.update("1", updateDto);
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should throw NotFoundException if department does not exist", async () => {
      prisma.department.findFirst.mockResolvedValueOnce(null);
      await expect(service.remove("invalid")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if department has active employees", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({
        id: "1",
        _count: { employees: 2 },
      });
      await expect(service.remove("1")).rejects.toThrow(BadRequestException);
    });

    it("should successfully soft delete", async () => {
      prisma.department.findFirst.mockResolvedValueOnce({
        id: "1",
        _count: { employees: 0 },
      });
      prisma.department.update.mockResolvedValueOnce({ id: "1", deletedAt: new Date() });

      const result = await service.remove("1");
      expect(result.deletedAt).toBeDefined();
      expect(prisma.department.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
