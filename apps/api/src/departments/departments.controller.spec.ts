import { Test, TestingModule } from "@nestjs/testing";
import { DepartmentsController } from "./departments.controller";
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { JwtService } from "@nestjs/jwt";

describe("DepartmentsController", () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const jwtServiceMock = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        { provide: DepartmentsService, useValue: serviceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get(DepartmentsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should call service.findAll and return result", async () => {
      const mockList = [{ id: "1", name: "Engineering", code: "ENG" }];
      service.findAll.mockResolvedValue(mockList as any);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe("findOne", () => {
    it("should call service.findOne and return result", async () => {
      const mockDept = { id: "1", name: "Engineering", code: "ENG" };
      service.findOne.mockResolvedValue(mockDept as any);

      const result = await controller.findOne("1");
      expect(service.findOne).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockDept);
    });
  });

  describe("create", () => {
    it("should call service.create and return result", async () => {
      const dto: CreateDepartmentDto = {
        name: "Engineering",
        code: "ENG",
        description: "Tech",
        active: true,
      };
      const created = { id: "1", ...dto };
      service.create.mockResolvedValue(created as any);

      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe("update", () => {
    it("should call service.update and return result", async () => {
      const dto: UpdateDepartmentDto = { name: "New Name" };
      const updated = { id: "1", name: "New Name", code: "ENG" };
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update("1", dto);
      expect(service.update).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should call service.remove and return result", async () => {
      service.remove.mockResolvedValue({ id: "1", deletedAt: new Date() } as any);

      const result = await controller.remove("1");
      expect(service.remove).toHaveBeenCalledWith("1");
      expect(result).toBeDefined();
    });
  });
});
