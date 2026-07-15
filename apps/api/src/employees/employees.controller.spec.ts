import { Test, TestingModule } from "@nestjs/testing";
import { EmployeesController } from "./employees.controller";
import { EmployeesService } from "./employees.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";

describe("EmployeesController (Unit)", () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployeesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAuthGuard = { canActivate: () => true };
  const mockRolesGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        { provide: EmployeesService, useValue: mockEmployeesService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return a list of employees", async () => {
      const mockResult = { data: [{ id: "1", firstName: "Maria" }], total: 1 };
      mockEmployeesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll({});
      expect(result).toEqual(mockResult);
    });
  });

  describe("findOne", () => {
    it("should return a single employee details", async () => {
      const mockResult = { id: "1", firstName: "Maria" };
      mockEmployeesService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne("1");
      expect(result).toEqual(mockResult);
    });
  });

  describe("create", () => {
    it("should call service.create with dto", async () => {
      const createDto: any = { firstName: "Maria" };
      mockEmployeesService.create.mockResolvedValue({ id: "1", ...createDto });

      const result = await controller.create(createDto);
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update", () => {
    it("should call service.update with id and dto", async () => {
      const updateDto: any = { firstName: "Joana" };
      mockEmployeesService.update.mockResolvedValue({ id: "1", ...updateDto });

      const result = await controller.update("1", updateDto);
      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith("1", updateDto);
    });
  });

  describe("remove", () => {
    it("should call service.remove", async () => {
      mockEmployeesService.remove.mockResolvedValue({ id: "1", deletedAt: new Date() });

      await controller.remove("1");
      expect(service.remove).toHaveBeenCalledWith("1");
    });
  });
});
