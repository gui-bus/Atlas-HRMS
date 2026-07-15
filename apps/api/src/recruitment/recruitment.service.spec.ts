import { Test, TestingModule } from "@nestjs/testing";
import { RecruitmentService } from "./recruitment.service";
import { PrismaService } from "../common/prisma.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { AuditService } from "../audit/audit.service";
import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import {
  RecruitmentStatus,
  EmploymentType,
  WorkModel,
  Seniority,
  ApplicationStatus,
} from "@prisma/client";

import { NotificationsService } from "../notifications/notifications.service";

describe("RecruitmentService (Unit)", () => {
  let service: RecruitmentService;

  const mockPrisma = {
    recruitment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    candidate: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  const mockUploadthing = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  const baseDto = {
    title: "Desenvolvedor Backend Sênior",
    description: "Vaga para dev backend",
    employmentType: EmploymentType.CLT,
    workModel: WorkModel.HYBRID,
    seniority: Seniority.SENIOR,
    departmentId: "dept-1",
    positionId: "pos-1",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadthingService, useValue: mockUploadthing },
        { provide: AuditService, useValue: mockAudit },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue({ id: "n-1" }) },
        },
      ],
    }).compile();

    service = module.get<RecruitmentService>(RecruitmentService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a recruitment with auto-generated slug", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue(null);
      mockPrisma.recruitment.create.mockResolvedValue({
        id: "rec-1",
        ...baseDto,
        slug: "desenvolvedor-backend-senior-abc123",
        status: RecruitmentStatus.DRAFT,
      });

      const result = await service.create(baseDto as any, "user-1");
      expect(result).toBeDefined();
      expect(result.id).toBe("rec-1");
      expect(mockPrisma.recruitment.create).toHaveBeenCalled();
      expect(mockAudit.logAction).toHaveBeenCalled();
    });

    it("should throw ConflictException if slug already exists", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({ id: "existing" });

      await expect(service.create(baseDto as any, "user-1")).rejects.toThrow(ConflictException);
    });

    it("should set publishedAt when status is OPEN", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue(null);
      mockPrisma.recruitment.create.mockImplementation(({ data }) => ({
        id: "rec-2",
        ...data,
      }));

      const result = await service.create(
        { ...baseDto, status: RecruitmentStatus.OPEN } as any,
        "user-1",
      );
      expect(mockPrisma.recruitment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            publishedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe("update", () => {
    it("should update a recruitment", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue({
        id: "rec-1",
        title: "Old Title",
        publishedAt: null,
      });
      mockPrisma.recruitment.update.mockResolvedValue({
        id: "rec-1",
        title: "New Title",
      });

      const result = await service.update("rec-1", { title: "New Title" } as any, "user-1");
      expect(result.title).toBe("New Title");
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue(null);

      await expect(service.update("invalid", {} as any, "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should soft-delete and close the recruitment", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue({
        id: "rec-1",
        title: "Test",
      });
      mockPrisma.recruitment.update.mockResolvedValue({
        id: "rec-1",
        deletedAt: new Date(),
        status: RecruitmentStatus.CLOSED,
        title: "Test",
      });

      const result = await service.remove("rec-1", "user-1");
      expect(result.deletedAt).toBeDefined();
      expect(mockAudit.logAction).toHaveBeenCalled();
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrisma.recruitment.findFirst.mockResolvedValue(null);

      await expect(service.remove("invalid", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAllPublic", () => {
    it("should return paginated results with sanitized salary", async () => {
      const mockData = [
        {
          id: "rec-1",
          title: "Dev Backend",
          slug: "dev-backend-abc",
          description: "desc",
          employmentType: EmploymentType.CLT,
          workModel: WorkModel.REMOTE,
          seniority: Seniority.SENIOR,
          vacancies: 2,
          salaryMin: "8000.00",
          salaryMax: "15000.00",
          isSalaryVisible: false,
          city: "BH",
          state: "MG",
          country: "Brasil",
          requirements: null,
          responsibilities: null,
          benefits: null,
          publishedAt: new Date(),
          department: { name: "Tech" },
          position: { title: "Backend Dev" },
        },
      ];
      mockPrisma.recruitment.findMany.mockResolvedValue(mockData);
      mockPrisma.recruitment.count.mockResolvedValue(1);

      const result = await service.findAllPublic({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].salaryMin).toBeNull();
      expect(result.data[0].salaryMax).toBeNull();
      expect(result.total).toBe(1);
    });

    it("should expose salary when isSalaryVisible is true", async () => {
      const mockData = [
        {
          id: "rec-1",
          title: "Dev",
          slug: "dev",
          description: "d",
          employmentType: EmploymentType.CLT,
          workModel: WorkModel.REMOTE,
          seniority: Seniority.MID,
          vacancies: 1,
          salaryMin: "5000.00",
          salaryMax: "10000.00",
          isSalaryVisible: true,
          city: null,
          state: null,
          country: "Brasil",
          requirements: null,
          responsibilities: null,
          benefits: null,
          publishedAt: new Date(),
          department: { name: "Eng" },
          position: { title: "Dev" },
        },
      ];
      mockPrisma.recruitment.findMany.mockResolvedValue(mockData);
      mockPrisma.recruitment.count.mockResolvedValue(1);

      const result = await service.findAllPublic({});
      expect(result.data[0].salaryMin).toBe("5000.00");
      expect(result.data[0].salaryMax).toBe("10000.00");
    });
  });

  describe("findBySlugPublic", () => {
    it("should return recruitment and increment views", async () => {
      const mockRec = {
        id: "rec-1",
        title: "Dev",
        slug: "dev-abc",
        description: "d",
        status: RecruitmentStatus.OPEN,
        employmentType: EmploymentType.CLT,
        workModel: WorkModel.REMOTE,
        seniority: Seniority.SENIOR,
        vacancies: 1,
        salaryMin: null,
        salaryMax: null,
        isSalaryVisible: false,
        city: null,
        state: null,
        country: "Brasil",
        requirements: null,
        responsibilities: null,
        benefits: null,
        publishedAt: new Date(),
        expiresAt: null,
        deletedAt: null,
        views: 10,
        department: { name: "Tech" },
        position: { title: "Dev" },
      };
      mockPrisma.recruitment.findUnique.mockResolvedValue(mockRec);
      mockPrisma.recruitment.update.mockResolvedValue(mockRec);

      const result = await service.findBySlugPublic("dev-abc");
      expect(result.slug).toBe("dev-abc");
      expect(mockPrisma.recruitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { views: { increment: 1 } },
        }),
      );
    });

    it("should throw NotFoundException for non-OPEN recruitment", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: "rec-1",
        status: RecruitmentStatus.CLOSED,
        deletedAt: null,
      });

      await expect(service.findBySlugPublic("closed-job")).rejects.toThrow(NotFoundException);
    });

    it("should close expired recruitment and throw NotFoundException", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: "rec-1",
        status: RecruitmentStatus.OPEN,
        deletedAt: null,
        expiresAt: new Date("2020-01-01"),
        department: { name: "T" },
        position: { title: "D" },
      });
      mockPrisma.recruitment.update.mockResolvedValue({});

      await expect(service.findBySlugPublic("expired-job")).rejects.toThrow(NotFoundException);
      expect(mockPrisma.recruitment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: RecruitmentStatus.CLOSED },
        }),
      );
    });
  });

  describe("applyToRecruitment", () => {
    const applyDto = {
      firstName: "Maria",
      lastName: "Oliveira",
      email: "maria@gmail.com",
      phone: "(31) 99999-0000",
    };

    const mockFile = { buffer: Buffer.from("pdf") } as Express.Multer.File;

    it("should create candidate and application", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: "rec-1",
        status: RecruitmentStatus.OPEN,
        deletedAt: null,
        expiresAt: null,
        title: "Dev",
      });
      mockUploadthing.uploadFile.mockResolvedValue({
        data: { url: "https://utfs.io/f/resume.pdf" },
      });
      mockPrisma.candidate.findUnique.mockResolvedValue(null);
      mockPrisma.candidate.create.mockResolvedValue({
        id: "cand-1",
        ...applyDto,
      });
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: "app-1",
        resumeUrl: "https://utfs.io/f/resume.pdf",
        candidate: { id: "cand-1", ...applyDto },
      });

      const result = await service.applyToRecruitment("dev-slug", applyDto as any, mockFile);
      expect(result.id).toBe("app-1");
    });

    it("should throw ConflictException for duplicate application", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: "rec-1",
        status: RecruitmentStatus.OPEN,
        deletedAt: null,
        expiresAt: null,
      });
      mockUploadthing.uploadFile.mockResolvedValue({
        data: { url: "https://utfs.io/f/resume.pdf" },
      });
      mockPrisma.candidate.findUnique.mockResolvedValue({
        id: "cand-1",
        ...applyDto,
      });
      mockPrisma.candidate.update.mockResolvedValue({
        id: "cand-1",
        ...applyDto,
      });
      mockPrisma.application.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        service.applyToRecruitment("dev-slug", applyDto as any, mockFile),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException for closed job", async () => {
      mockPrisma.recruitment.findUnique.mockResolvedValue({
        id: "rec-1",
        status: RecruitmentStatus.CLOSED,
        deletedAt: null,
      });

      await expect(service.applyToRecruitment("closed", applyDto as any, mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateApplicationStatus", () => {
    it("should update the application status", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.SUBMITTED,
        candidate: { firstName: "Maria", lastName: "O" },
        recruitment: { title: "Dev" },
      });
      mockPrisma.application.update.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.HR_INTERVIEW,
      });

      const result = await service.updateApplicationStatus(
        "app-1",
        { status: ApplicationStatus.HR_INTERVIEW } as any,
        "user-1",
      );
      expect(result.status).toBe(ApplicationStatus.HR_INTERVIEW);
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      await expect(
        service.updateApplicationStatus(
          "invalid",
          { status: ApplicationStatus.SCREENING } as any,
          "user-1",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("hireCandidate", () => {
    it("should convert candidate to employee", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.OFFER,
        candidate: {
          firstName: "Maria",
          lastName: "Oliveira",
          email: "maria@gmail.com",
          phone: "(31) 99999-0000",
        },
        recruitment: {
          title: "Dev Backend",
          departmentId: "dept-1",
          positionId: "pos-1",
          department: { id: "dept-1" },
          position: { id: "pos-1", salaryRangeMin: "8000.00" },
        },
      });
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.employee.create.mockResolvedValue({
        id: "emp-new",
        firstName: "Maria",
        lastName: "Oliveira",
      });
      mockPrisma.application.update.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.HIRED,
      });

      const result = await service.hireCandidate("app-1", "user-1");
      expect(result.id).toBe("emp-new");
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: ApplicationStatus.HIRED,
          }),
        }),
      );
    });

    it("should throw ConflictException if already hired", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.HIRED,
        candidate: { firstName: "M", lastName: "O" },
        recruitment: { title: "D" },
      });

      await expect(service.hireCandidate("app-1", "user-1")).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if email already exists as employee", async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: "app-1",
        status: ApplicationStatus.OFFER,
        candidate: {
          firstName: "Maria",
          lastName: "O",
          email: "maria@gmail.com",
          phone: "123",
        },
        recruitment: {
          title: "D",
          departmentId: "d1",
          positionId: "p1",
          department: { id: "d1" },
          position: { id: "p1", salaryRangeMin: "5000" },
        },
      });
      mockPrisma.employee.findUnique.mockResolvedValue({ id: "existing-emp" });

      await expect(service.hireCandidate("app-1", "user-1")).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if application not found", async () => {
      mockPrisma.application.findFirst.mockResolvedValue(null);

      await expect(service.hireCandidate("invalid", "user-1")).rejects.toThrow(NotFoundException);
    });
  });
});
