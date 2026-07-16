import { Test, TestingModule } from "@nestjs/testing";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { UploadthingService } from "../common/uploadthing/uploadthing.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "@prisma/client";

describe("DocumentsController (Unit)", () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmployee: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
        { provide: UploadthingService, useValue: { uploadFile: jest.fn(), deleteFile: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should call service.create with dto and user", async () => {
      const dto: any = {
        name: "RG",
        type: "IDENTIFICATION",
        url: "https://utfs.io/f/abc.pdf",
        employeeId: "emp-1",
      };
      const user = { sub: "user-1", role: UserRole.ADMIN };
      mockDocumentsService.create.mockResolvedValue({ id: "doc-1", ...dto });

      const result = await controller.create(dto, user);
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(dto, user);
    });
  });

  describe("findAll", () => {
    it("should return list of documents", async () => {
      const mockDocs = [{ id: "doc-1", name: "RG" }];
      mockDocumentsService.findAll.mockResolvedValue(mockDocs);

      const result = await controller.findAll();
      expect(result).toEqual(mockDocs);
    });
  });

  describe("findByEmployee", () => {
    it("should call service.findByEmployee with employeeId and user", async () => {
      const user = { sub: "user-1", role: UserRole.HR };
      mockDocumentsService.findByEmployee.mockResolvedValue([]);

      const result = await controller.findByEmployee("emp-1", user);
      expect(result).toEqual([]);
      expect(service.findByEmployee).toHaveBeenCalledWith("emp-1", user);
    });
  });

  describe("findOne", () => {
    it("should call service.findOne with id and user", async () => {
      const user = { sub: "user-1", role: UserRole.ADMIN };
      const mockDoc = { id: "doc-1", name: "RG" };
      mockDocumentsService.findOne.mockResolvedValue(mockDoc);

      const result = await controller.findOne("doc-1", user);
      expect(result).toEqual(mockDoc);
      expect(service.findOne).toHaveBeenCalledWith("doc-1", user);
    });
  });

  describe("remove", () => {
    it("should call service.remove with id", async () => {
      mockDocumentsService.remove.mockResolvedValue({ id: "doc-1", deletedAt: new Date() });

      await controller.remove("doc-1");
      expect(service.remove).toHaveBeenCalledWith("doc-1");
    });
  });
});
