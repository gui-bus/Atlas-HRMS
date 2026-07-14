import { Test, TestingModule } from "@nestjs/testing";
import { PositionsController } from "./positions.controller";
import { PositionsService } from "./positions.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { JwtService } from "@nestjs/jwt";

describe("PositionsController", () => {
  let controller: PositionsController;
  let service: jest.Mocked<PositionsService>;

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
      controllers: [PositionsController],
      providers: [
        { provide: PositionsService, useValue: serviceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<PositionsController>(PositionsController);
    service = module.get(PositionsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should call service.findAll and return results", async () => {
      const mockList = [{ id: "1", title: "Backend Developer" }];
      service.findAll.mockResolvedValue(mockList as any);

      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe("findOne", () => {
    it("should call service.findOne and return a single record", async () => {
      const mockPos = { id: "1", title: "Backend Developer" };
      service.findOne.mockResolvedValue(mockPos as any);

      const result = await controller.findOne("1");
      expect(service.findOne).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockPos);
    });
  });

  describe("create", () => {
    it("should call service.create and return created record", async () => {
      const dto: CreatePositionDto = {
        title: "Backend Developer",
        description: "Node.js Developer",
        salaryRangeMin: 5000,
        salaryRangeMax: 8000,
        departmentId: "dept-1",
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
    it("should call service.update and return updated record", async () => {
      const dto: UpdatePositionDto = { title: "Senior Backend Developer" };
      const updated = { id: "1", title: "Senior Backend Developer", departmentId: "dept-1" };
      service.update.mockResolvedValue(updated as any);

      const result = await controller.update("1", dto);
      expect(service.update).toHaveBeenCalledWith("1", dto);
      expect(result).toEqual(updated);
    });
  });

  describe("remove", () => {
    it("should call service.remove and return deleted status", async () => {
      service.remove.mockResolvedValue({ id: "1", deletedAt: new Date() } as any);

      const result = await controller.remove("1");
      expect(service.remove).toHaveBeenCalledWith("1");
      expect(result).toBeDefined();
    });
  });
});
