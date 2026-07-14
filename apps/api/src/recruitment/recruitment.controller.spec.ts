import { Test, TestingModule } from "@nestjs/testing";
import { RecruitmentController } from "./recruitment.controller";
import { RecruitmentService } from "./recruitment.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { EmploymentType, WorkModel, Seniority, ApplicationStatus } from "@prisma/client";

describe("RecruitmentController (Unit)", () => {
  let controller: RecruitmentController;
  let service: RecruitmentService;

  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllPublic: jest.fn(),
    findBySlugPublic: jest.fn(),
    applyToRecruitment: jest.fn(),
    findApplications: jest.fn(),
    updateApplicationStatus: jest.fn(),
    hireCandidate: jest.fn(),
  };

  const mockAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentController],
      providers: [{ provide: RecruitmentService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<RecruitmentController>(RecruitmentController);
    service = module.get<RecruitmentService>(RecruitmentService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllPublic", () => {
    it("should call service.findAllPublic with query", async () => {
      const query = { page: 1, limit: 10 };
      mockService.findAllPublic.mockResolvedValue({ data: [], total: 0 });

      const result = await controller.findAllPublic(query);
      expect(result).toBeDefined();
      expect(service.findAllPublic).toHaveBeenCalledWith(query);
    });
  });

  describe("findBySlug", () => {
    it("should call service.findBySlugPublic", async () => {
      mockService.findBySlugPublic.mockResolvedValue({ slug: "test-slug" });

      const result = await controller.findBySlug("test-slug");
      expect(result.slug).toBe("test-slug");
      expect(service.findBySlugPublic).toHaveBeenCalledWith("test-slug");
    });
  });

  describe("apply", () => {
    it("should call service.applyToRecruitment", async () => {
      const dto = { firstName: "Maria", lastName: "O", email: "m@g.com", phone: "123" };
      const file = { buffer: Buffer.from("pdf") } as Express.Multer.File;
      mockService.applyToRecruitment.mockResolvedValue({ id: "app-1" });

      const result = await controller.apply("test-slug", dto as any, file);
      expect(result.id).toBe("app-1");
      expect(service.applyToRecruitment).toHaveBeenCalledWith("test-slug", dto, file);
    });
  });

  describe("create", () => {
    it("should call service.create with dto and userId", async () => {
      const dto = {
        title: "Dev Backend",
        description: "desc",
        employmentType: EmploymentType.CLT,
        workModel: WorkModel.HYBRID,
        seniority: Seniority.SENIOR,
        departmentId: "d1",
        positionId: "p1",
      };
      mockService.create.mockResolvedValue({ id: "rec-1", ...dto });

      const result = await controller.create(dto as any, "user-1");
      expect(result.id).toBe("rec-1");
      expect(service.create).toHaveBeenCalledWith(dto, "user-1");
    });
  });

  describe("update", () => {
    it("should call service.update", async () => {
      mockService.update.mockResolvedValue({ id: "rec-1", title: "Updated" });

      const result = await controller.update("rec-1", { title: "Updated" } as any, "user-1");
      expect(result.title).toBe("Updated");
    });
  });

  describe("remove", () => {
    it("should call service.remove", async () => {
      mockService.remove.mockResolvedValue({ id: "rec-1" });

      await controller.remove("rec-1", "user-1");
      expect(service.remove).toHaveBeenCalledWith("rec-1", "user-1");
    });
  });

  describe("findApplications", () => {
    it("should call service.findApplications", async () => {
      mockService.findApplications.mockResolvedValue({ data: [], total: 0 });

      const result = await controller.findApplications("rec-1", 1, 10);
      expect(result).toBeDefined();
      expect(service.findApplications).toHaveBeenCalledWith("rec-1", 1, 10);
    });
  });

  describe("updateApplicationStatus", () => {
    it("should call service.updateApplicationStatus", async () => {
      const dto = { status: ApplicationStatus.HR_INTERVIEW };
      mockService.updateApplicationStatus.mockResolvedValue({ id: "app-1", status: dto.status });

      const result = await controller.updateApplicationStatus("app-1", dto as any, "user-1");
      expect(result.status).toBe(dto.status);
    });
  });

  describe("hireCandidate", () => {
    it("should call service.hireCandidate", async () => {
      mockService.hireCandidate.mockResolvedValue({ id: "emp-1" });

      const result = await controller.hireCandidate("app-1", "user-1");
      expect(result.id).toBe("emp-1");
      expect(service.hireCandidate).toHaveBeenCalledWith("app-1", "user-1");
    });
  });
});
