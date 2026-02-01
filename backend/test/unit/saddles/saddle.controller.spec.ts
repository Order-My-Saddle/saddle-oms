import { Test, TestingModule } from "@nestjs/testing";
import { SaddleController } from "../../../src/saddles/saddle.controller";
import { SaddleService } from "../../../src/saddles/saddle.service";
import { CreateSaddleDto } from "../../../src/saddles/dto/create-saddle.dto";
import { UpdateSaddleDto } from "../../../src/saddles/dto/update-saddle.dto";
import { SaddleDto } from "../../../src/saddles/dto/saddle.dto";

describe("SaddleController", () => {
  let controller: SaddleController;
  let service: jest.Mocked<SaddleService>;

  const mockSaddleDto: SaddleDto = {
    id: 1,
    factoryEu: 1,
    factoryGb: 2,
    factoryUs: 3,
    factoryCa: 4,
    factoryAud: 5,
    factoryDe: 6,
    factoryNl: 7,
    brand: "Test Brand",
    modelName: "Test Model",
    presets: "1,2,3",
    active: 1,
    type: 0,
    sequence: 10,
    deleted: 0,
    isActive: true,
    displayName: "Test Brand - Test Model",
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findActiveSaddles: jest.fn(),
      findByBrand: jest.fn(),
      findByType: jest.fn(),
      getUniqueBrands: jest.fn(),
      getNextSequence: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaddleController],
      providers: [
        {
          provide: SaddleService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SaddleController>(SaddleController);
    service = module.get(SaddleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new saddle", async () => {
      // Arrange
      const createDto: CreateSaddleDto = {
        factoryEu: 1,
        factoryGb: 2,
        factoryUs: 3,
        factoryCa: 4,
        brand: "Test Brand",
        modelName: "Test Model",
      };
      service.create.mockResolvedValue(mockSaddleDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockSaddleDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should return paginated saddles with default parameters", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should pass all query parameters to service", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(
        2,
        20,
        1,
        "Test",
        "Model",
        10,
        0,
        "search",
        true,
        "true",
      );

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        2,
        20,
        1,
        "Test",
        "Model",
        10,
        0,
        "search",
        true,
        "true",
      );
    });

    it("should handle pagination parameters", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleDto],
        total: 50,
        pages: 5,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll(3, 10);

      // Assert
      expect(result.pages).toBe(5);
      expect(service.findAll).toHaveBeenCalledWith(
        3,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should handle filter parameters", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(
        undefined,
        undefined,
        1,
        "Brand",
        "Model",
        10,
        0,
      );

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        1,
        "Brand",
        "Model",
        10,
        0,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe("findActiveSaddles", () => {
    it("should return all active saddles", async () => {
      // Arrange
      service.findActiveSaddles.mockResolvedValue([mockSaddleDto]);

      // Act
      const result = await controller.findActiveSaddles();

      // Assert
      expect(result).toEqual([mockSaddleDto]);
      expect(service.findActiveSaddles).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no active saddles", async () => {
      // Arrange
      service.findActiveSaddles.mockResolvedValue([]);

      // Act
      const result = await controller.findActiveSaddles();

      // Assert
      expect(result).toEqual([]);
      expect(service.findActiveSaddles).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUniqueBrands", () => {
    it("should return unique brand names", async () => {
      // Arrange
      const brands = ["Brand A", "Brand B", "Brand C"];
      service.getUniqueBrands.mockResolvedValue(brands);

      // Act
      const result = await controller.getUniqueBrands();

      // Assert
      expect(result).toEqual(brands);
      expect(service.getUniqueBrands).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no brands", async () => {
      // Arrange
      service.getUniqueBrands.mockResolvedValue([]);

      // Act
      const result = await controller.getUniqueBrands();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getNextSequence", () => {
    it("should return next sequence number", async () => {
      // Arrange
      const nextSequence = { nextSequence: 101 };
      service.getNextSequence.mockResolvedValue(nextSequence);

      // Act
      const result = await controller.getNextSequence();

      // Assert
      expect(result).toEqual(nextSequence);
      expect(service.getNextSequence).toHaveBeenCalledTimes(1);
    });
  });

  describe("findByBrand", () => {
    it("should return saddles by brand", async () => {
      // Arrange
      service.findByBrand.mockResolvedValue([mockSaddleDto]);

      // Act
      const result = await controller.findByBrand("Test Brand");

      // Assert
      expect(result).toEqual([mockSaddleDto]);
      expect(service.findByBrand).toHaveBeenCalledWith("Test Brand");
      expect(service.findByBrand).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no saddles for brand", async () => {
      // Arrange
      service.findByBrand.mockResolvedValue([]);

      // Act
      const result = await controller.findByBrand("Nonexistent Brand");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByType", () => {
    it("should return saddles by type", async () => {
      // Arrange
      service.findByType.mockResolvedValue([mockSaddleDto]);

      // Act
      const result = await controller.findByType(0);

      // Assert
      expect(result).toEqual([mockSaddleDto]);
      expect(service.findByType).toHaveBeenCalledWith(0);
      expect(service.findByType).toHaveBeenCalledTimes(1);
    });

    it("should handle different type values", async () => {
      // Arrange
      service.findByType.mockResolvedValue([]);

      // Act
      const result = await controller.findByType(5);

      // Assert
      expect(result).toEqual([]);
      expect(service.findByType).toHaveBeenCalledWith(5);
    });
  });

  describe("findOne", () => {
    it("should return saddle by ID", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockSaddleDto);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockSaddleDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe("update", () => {
    it("should update saddle", async () => {
      // Arrange
      const updateDto: UpdateSaddleDto = {
        brand: "Updated Brand",
        sequence: 15,
      };
      const updatedSaddle = { ...mockSaddleDto, ...updateDto };
      service.update.mockResolvedValue(updatedSaddle);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedSaddle);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it("should update with partial data", async () => {
      // Arrange
      const updateDto: UpdateSaddleDto = {
        active: 0,
      };
      const updatedSaddle = { ...mockSaddleDto, active: 0 };
      service.update.mockResolvedValue(updatedSaddle);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedSaddle);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe("remove", () => {
    it("should remove saddle", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle removal of different IDs", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(999);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
