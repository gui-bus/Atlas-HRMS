import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsService } from "./documents.service";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { UserRole } from "@prisma/client";

describe("DocumentsService (Unit)", () => {
  let service: DocumentsService;

  const mockPrisma = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findFirst: jest.fn(),
    },
  };

  const mockUploadthing = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadthingService, useValue: mockUploadthing },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const createDto = {
      name: "RG - João",
      type: "IDENTIFICATION" as any,
      url: "https://utfs.io/f/abc123.pdf",
      employeeId: "emp-1",
    };

    const adminUser = { sub: "user-admin", role: UserRole.ADMIN };
    const employeeUser = { sub: "user-emp", role: UserRole.EMPLOYEE };

    it("should create a document when called by ADMIN", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-1" });
      mockPrisma.document.create.mockResolvedValue({ id: "doc-1", ...createDto });

      const result = await service.create(createDto, adminUser);
      expect(result).toBeDefined();
      expect(result.id).toBe("doc-1");
      expect(mockPrisma.document.create).toHaveBeenCalled();
    });

    it("should allow EMPLOYEE to create document for themselves", async () => {
      mockPrisma.employee.findFirst
        .mockResolvedValueOnce({ id: "emp-1", userId: "user-emp" })
        .mockResolvedValueOnce({ id: "emp-1" });
      mockPrisma.document.create.mockResolvedValue({ id: "doc-2", ...createDto });

      const result = await service.create(createDto, employeeUser);
      expect(result).toBeDefined();
    });

    it("should throw ForbiddenException when EMPLOYEE tries to create document for another employee", async () => {
      mockPrisma.employee.findFirst.mockResolvedValueOnce({ id: "emp-other", userId: "user-emp" });

      await expect(service.create(createDto, employeeUser)).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when EMPLOYEE has no linked employee record", async () => {
      mockPrisma.employee.findFirst.mockResolvedValueOnce(null);

      await expect(service.create(createDto, employeeUser)).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException when target employee does not exist", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto, adminUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should return all non-deleted documents", async () => {
      const mockDocs = [
        { id: "doc-1", name: "RG", deletedAt: null },
        { id: "doc-2", name: "CPF", deletedAt: null },
      ];
      mockPrisma.document.findMany.mockResolvedValue(mockDocs);

      const result = await service.findAll();
      expect(result).toEqual(mockDocs);
      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      );
    });
  });

  describe("findByEmployee", () => {
    const adminUser = { sub: "user-admin", role: UserRole.ADMIN };
    const employeeUser = { sub: "user-emp", role: UserRole.EMPLOYEE };

    it("should return documents for ADMIN without ownership check", async () => {
      const mockDocs = [{ id: "doc-1", employeeId: "emp-1" }];
      mockPrisma.document.findMany.mockResolvedValue(mockDocs);

      const result = await service.findByEmployee("emp-1", adminUser);
      expect(result).toEqual(mockDocs);
    });

    it("should allow EMPLOYEE to list their own documents", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-1", userId: "user-emp" });
      mockPrisma.document.findMany.mockResolvedValue([]);

      const result = await service.findByEmployee("emp-1", employeeUser);
      expect(result).toEqual([]);
    });

    it("should throw ForbiddenException when EMPLOYEE tries to list another employee's documents", async () => {
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-other", userId: "user-emp" });

      await expect(service.findByEmployee("emp-1", employeeUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findOne", () => {
    const adminUser = { sub: "user-admin", role: UserRole.ADMIN };
    const employeeUser = { sub: "user-emp", role: UserRole.EMPLOYEE };

    it("should return a document for ADMIN", async () => {
      const mockDoc = { id: "doc-1", employeeId: "emp-1" };
      mockPrisma.document.findFirst.mockResolvedValue(mockDoc);

      const result = await service.findOne("doc-1", adminUser);
      expect(result).toEqual(mockDoc);
    });

    it("should throw NotFoundException when document does not exist", async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(service.findOne("doc-invalid", adminUser)).rejects.toThrow(NotFoundException);
    });

    it("should allow EMPLOYEE to view their own document", async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: "doc-1", employeeId: "emp-1" });
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-1", userId: "user-emp" });

      const result = await service.findOne("doc-1", employeeUser);
      expect(result).toBeDefined();
    });

    it("should throw ForbiddenException when EMPLOYEE tries to view another's document", async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: "doc-1", employeeId: "emp-other" });
      mockPrisma.employee.findFirst.mockResolvedValue({ id: "emp-1", userId: "user-emp" });

      await expect(service.findOne("doc-1", employeeUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("remove", () => {
    it("should soft-delete document and call UploadThing deleteFile", async () => {
      const mockDoc = { id: "doc-1", url: "https://utfs.io/f/abc123.pdf" };
      mockPrisma.document.findFirst.mockResolvedValue(mockDoc);
      mockPrisma.document.update.mockResolvedValue({ ...mockDoc, deletedAt: new Date() });
      mockUploadthing.deleteFile.mockResolvedValue({ success: true });

      await service.remove("doc-1");

      expect(mockUploadthing.deleteFile).toHaveBeenCalledWith("abc123.pdf");
      expect(mockPrisma.document.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "doc-1" },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it("should throw NotFoundException if document does not exist", async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(service.remove("doc-invalid")).rejects.toThrow(NotFoundException);
    });
  });
});
