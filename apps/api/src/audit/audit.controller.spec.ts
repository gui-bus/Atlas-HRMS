import { Test, TestingModule } from "@nestjs/testing";
import { AuditController } from "./audit.controller";
import { AuditService } from "./audit.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("AuditController (Unit)", () => {
  let controller: AuditController;
  let service: AuditService;

  const mockService = {
    findAll: jest.fn(),
  };

  const mockAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get<AuditService>(AuditService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return audit logs from service", async () => {
      const mockLogs = [
        {
          id: "log-1",
          action: "JOB_CREATED",
          details: "Vaga criada",
          timestamp: new Date(),
          user: { id: "u1", email: "admin@atlas.com", role: "ADMIN" },
        },
        {
          id: "log-2",
          action: "APPLICATION_RECEIVED",
          details: "Candidatura recebida",
          timestamp: new Date(),
          user: null,
        },
      ];
      mockService.findAll.mockResolvedValue(mockLogs);

      const result = await controller.findAll();
      expect(result).toEqual(mockLogs);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no logs exist", async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
    });
  });
});
