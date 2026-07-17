import { Test, TestingModule } from "@nestjs/testing";
import { LeavesController } from "./leaves.controller";
import { VacationsService } from "./vacations.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("LeavesController (Unit)", () => {
  let controller: LeavesController;
  let service: VacationsService;

  const mockVacationsService = {
    findAllLeaves: jest.fn(),
    findLeavesByEmployee: jest.fn(),
    createLeave: jest.fn(),
    updateLeaveStatus: jest.fn(),
    cancelLeave: jest.fn(),
  };

  const mockAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeavesController],
      providers: [{ provide: VacationsService, useValue: mockVacationsService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<LeavesController>(LeavesController);
    service = module.get<VacationsService>(VacationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllLeaves", () => {
    it("should call vacationsService.findAllLeaves", async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockVacationsService.findAllLeaves.mockResolvedValue(mockResult);
      const result = await controller.findAllLeaves({});
      expect(result).toEqual(mockResult);
      expect(service.findAllLeaves).toHaveBeenCalled();
    });
  });
});
