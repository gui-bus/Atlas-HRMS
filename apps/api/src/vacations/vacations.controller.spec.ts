import { Test, TestingModule } from "@nestjs/testing";
import { VacationsController } from "./vacations.controller";
import { VacationsService } from "./vacations.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { UserRole } from "@prisma/client";

describe("VacationsController (Unit)", () => {
  let controller: VacationsController;
  let service: VacationsService;

  const mockVacationsService = {
    findAllVacations: jest.fn(),
    findVacationsByEmployee: jest.fn(),
    createVacation: jest.fn(),
    updateVacationStatus: jest.fn(),
    cancelVacation: jest.fn(),
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
      controllers: [VacationsController],
      providers: [
        { provide: VacationsService, useValue: mockVacationsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<VacationsController>(VacationsController);
    service = module.get<VacationsService>(VacationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllVacations", () => {
    it("should call vacationsService.findAllVacations", async () => {
      mockVacationsService.findAllVacations.mockResolvedValue([]);
      const result = await controller.findAllVacations();
      expect(result).toEqual([]);
      expect(service.findAllVacations).toHaveBeenCalled();
    });
  });

  describe("findAllLeaves", () => {
    it("should call vacationsService.findAllLeaves", async () => {
      mockVacationsService.findAllLeaves.mockResolvedValue([]);
      const result = await controller.findAllLeaves();
      expect(result).toEqual([]);
      expect(service.findAllLeaves).toHaveBeenCalled();
    });
  });
});
