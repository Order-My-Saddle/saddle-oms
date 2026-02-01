import { Test, TestingModule } from "@nestjs/testing";
import { ExtraController } from "../../../src/extras/extra.controller";
import { ExtraService } from "../../../src/extras/extra.service";
import { ExtraDto } from "../../../src/extras/dto/extra.dto";

describe("ExtraController", () => {
  let controller: ExtraController;
  let service: jest.Mocked<ExtraService>;

  const mockExtraDto: ExtraDto = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Complete Re-Flock",
    description: "Complete re-flocking service",
    price1: 250,
    price2: 150,
    price3: 135,
    price4: 290,
    price5: 290,
    price6: 0,
    price7: 0,
    sequence: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
    isActive: true,
    displayName: "Complete Re-Flock",
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findActiveExtras: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtraController],
      providers: [
        {
          provide: ExtraService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ExtraController>(ExtraController);
    service = module.get(ExtraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new extra", async () => {
      const createDto = {
        name: "New Extra",
        description: "New description",
        price1: 100,
        price2: 80,
        price3: 70,
        sequence: 2,
      };
      service.create.mockResolvedValue(mockExtraDto);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockExtraDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it("should handle create with minimal data", async () => {
      const createDto = {
        name: "Simple Extra",
      };
      const simpleExtra = { ...mockExtraDto, ...createDto };
      service.create.mockResolvedValue(simpleExtra);

      const result = await controller.create(createDto as any);

      expect(result).toEqual(simpleExtra);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("should return all extras with default pagination", async () => {
      const paginatedResult = {
        data: [mockExtraDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it("should pass pagination params to service", async () => {
      const paginatedResult = {
        data: [mockExtraDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(2, 20, "flock");

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(2, 20, "flock");
    });

    it("should return empty array when no extras", async () => {
      const emptyResult = {
        data: [],
        total: 0,
        pages: 0,
      };
      service.findAll.mockResolvedValue(emptyResult);

      const result = await controller.findAll();

      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
    });
  });

  describe("findActiveExtras", () => {
    it("should return all active extras", async () => {
      service.findActiveExtras.mockResolvedValue([mockExtraDto]);

      const result = await controller.findActiveExtras();

      expect(result).toEqual([mockExtraDto]);
      expect(service.findActiveExtras).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no active extras", async () => {
      service.findActiveExtras.mockResolvedValue([]);

      const result = await controller.findActiveExtras();

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return extra by UUID", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      service.findOne.mockResolvedValue(mockExtraDto);

      const result = await controller.findOne(extraId);

      expect(result).toEqual(mockExtraDto);
      expect(service.findOne).toHaveBeenCalledWith(extraId);
    });
  });

  describe("update", () => {
    it("should update extra prices", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto = {
        price1: 300,
        price2: 200,
      };
      const updatedExtra = { ...mockExtraDto, ...updateDto };
      service.update.mockResolvedValue(updatedExtra);

      const result = await controller.update(extraId, updateDto);

      expect(result).toEqual(updatedExtra);
      expect(service.update).toHaveBeenCalledWith(extraId, updateDto);
    });

    it("should update with partial data", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto = { sequence: 5 };
      const updatedExtra = { ...mockExtraDto, sequence: 5 };
      service.update.mockResolvedValue(updatedExtra);

      const result = await controller.update(extraId, updateDto);

      expect(result.sequence).toBe(5);
      expect(service.update).toHaveBeenCalledWith(extraId, updateDto);
    });
  });

  describe("remove", () => {
    it("should remove extra", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      service.remove.mockResolvedValue(undefined);

      await controller.remove(extraId);

      expect(service.remove).toHaveBeenCalledWith(extraId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });
});
