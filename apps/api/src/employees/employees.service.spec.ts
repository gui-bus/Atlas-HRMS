import { Test, TestingModule } from "@nestjs/testing";
import { EmployeesService } from "./employees.service";
import { PrismaService } from "../common/prisma.service";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { EmployeeStatus } from "@prisma/client";

describe("EmployeesService (Unit)", () => {
  let service: EmployeesService;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    employeePersonalData: {
      findUnique: jest.fn(),
    },
    emergencyContact: {
      deleteMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "user-123" }),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated active employees list", async () => {
      const mockList = [{ id: "emp-1", firstName: "John", deletedAt: null }];
      mockPrisma.employee.findMany.mockResolvedValue(mockList);
      mockPrisma.employee.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual({
        data: mockList,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return employee if found", async () => {
      const mockEmp = { id: "emp-1", firstName: "John", deletedAt: null };
      mockPrisma.employee.findFirst.mockResolvedValue(mockEmp);

      const result = await service.findOne("emp-1");
      expect(result).toEqual(mockEmp);
    });

    it("should throw NotFoundException if employee not found", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(service.findOne("emp-invalid")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    const createDto = {
      firstName: "João",
      lastName: "Silva",
      email: "joao.silva@atlas.com",
      phone: "(31) 98888-8888",
      hireDate: "2026-07-14",
      salary: "5500.00",
      personalData: {
        cpf: "123.456.789-00",
        birthDate: "1990-05-15",
      },
      address: {
        cep: "30130-010",
        street: "Avenida Afonso Pena",
        number: "1500",
        neighborhood: "Centro",
        city: "Belo Horizonte",
        state: "MG",
      },
      bankAccount: {
        bankCode: "341",
        bankAgency: "0001",
        bankAccount: "12345-6",
        accountType: "CORRENTE",
      },
      emergencyContacts: [],
    };

    it("should create employee successfully", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null); // email check
      mockPrisma.employeePersonalData.findUnique.mockResolvedValue(null); // cpf check
      mockPrisma.employee.create.mockResolvedValue({ id: "new-emp-1", ...createDto });

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(mockPrisma.employee.create).toHaveBeenCalled();
    });

    it("should throw ConflictException if email already exists", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({ id: "existing-id" });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if CPF already exists", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.employeePersonalData.findUnique.mockResolvedValue({ id: "existing-data-id" });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe("remove", () => {
    it("should soft delete employee and deactivate user", async () => {
      const mockEmp = { id: "emp-1", firstName: "John", userId: "user-1", deletedAt: null };
      mockPrisma.employee.findFirst.mockResolvedValue(mockEmp);
      mockPrisma.employee.update.mockResolvedValue({ ...mockEmp, deletedAt: new Date() });

      await service.remove("emp-1");
      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "emp-1" },
          data: expect.objectContaining({
            status: EmployeeStatus.INACTIVE,
          }),
        }),
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-1" },
          data: expect.objectContaining({
            isActive: false,
            deletedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
