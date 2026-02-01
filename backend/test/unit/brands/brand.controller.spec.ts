import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { BrandController } from "../../../src/brands/brand.controller";
import { BrandService } from "../../../src/brands/brand.service";
import { CreateBrandDto } from "../../../src/brands/dto/create-brand.dto";
import { UpdateBrandDto } from "../../../src/brands/dto/update-brand.dto";
import { BrandDto } from "../../../src/brands/dto/brand.dto";

describe("BrandController", () => {
  let controller: BrandController;
  let service: jest.Mocked<BrandService>;

  const mockBrandDto: BrandDto = {
    id: 101,
    name: "Premium Leather Co",
    isActive: true,
    displayName: "Premium Leather Co",
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActiveBrands: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandController],
      providers: [{ provide: BrandService, useValue: mockService }],
    }).compile();

    controller = module.get<BrandController>(BrandController);
    service = module.get(BrandService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new brand successfully", async () => {
      // Arrange
      const createDto: CreateBrandDto = {
        name: "Premium Leather Co",
      };
      service.create.mockResolvedValue(mockBrandDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockBrandDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it("should handle conflict when brand name already exists", async () => {
      // Arrange
      const createDto: CreateBrandDto = {
        name: "Existing Brand",
      };
      service.create.mockRejectedValue(
        new ConflictException("Brand with this name already exists"),
      );

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all brands with pagination", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockBrandDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll("1", "10");

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });

    it("should filter by search term", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockBrandDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll("1", "10", "Premium");

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(1, 10, "Premium");
    });

    it("should throw BadRequestException for invalid page number", async () => {
      // Arrange & Act & Assert
      await expect(controller.findAll("0", "10")).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll("-1", "10")).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll("invalid", "10")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException for invalid limit", async () => {
      // Arrange & Act & Assert
      await expect(controller.findAll("1", "0")).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll("1", "-1")).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll("1", "101")).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.findAll("1", "invalid")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should use default values for page and limit", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockBrandDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
    });
  });

  describe("findActiveBrands", () => {
    it("should return all active brands", async () => {
      // Arrange
      const activeBrands = [mockBrandDto];
      service.findActiveBrands.mockResolvedValue(activeBrands);

      // Act
      const result = await controller.findActiveBrands();

      // Assert
      expect(result).toEqual(activeBrands);
      expect(service.findActiveBrands).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no active brands", async () => {
      // Arrange
      service.findActiveBrands.mockResolvedValue([]);

      // Act
      const result = await controller.findActiveBrands();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return brand by ID", async () => {
      // Arrange
      const brandId = 101;
      service.findOne.mockResolvedValue(mockBrandDto);

      // Act
      const result = await controller.findOne(brandId);

      // Assert
      expect(result).toEqual(mockBrandDto);
      expect(service.findOne).toHaveBeenCalledWith(brandId);
    });

    it("should handle brand not found", async () => {
      // Arrange
      const brandId = 999;
      service.findOne.mockRejectedValue(
        new NotFoundException("Brand not found"),
      );

      // Act & Assert
      await expect(controller.findOne(brandId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update brand successfully", async () => {
      // Arrange
      const brandId = 101;
      const updateDto: UpdateBrandDto = {
        name: "Updated Brand Name",
      };
      const updatedBrand = { ...mockBrandDto, ...updateDto };
      service.update.mockResolvedValue(updatedBrand);

      // Act
      const result = await controller.update(brandId, updateDto);

      // Assert
      expect(result).toEqual(updatedBrand);
      expect(service.update).toHaveBeenCalledWith(brandId, updateDto);
    });

    it("should handle brand not found during update", async () => {
      // Arrange
      const brandId = 999;
      const updateDto: UpdateBrandDto = { name: "New Name" };
      service.update.mockRejectedValue(
        new NotFoundException("Brand not found"),
      );

      // Act & Assert
      await expect(controller.update(brandId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should handle name conflict during update", async () => {
      // Arrange
      const brandId = 101;
      const updateDto: UpdateBrandDto = {
        name: "Existing Name",
      };
      service.update.mockRejectedValue(
        new ConflictException("Brand with this name already exists"),
      );

      // Act & Assert
      await expect(controller.update(brandId, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("remove", () => {
    it("should remove brand successfully", async () => {
      // Arrange
      const brandId = 101;
      service.remove.mockResolvedValue();

      // Act
      await controller.remove(brandId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(brandId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle brand not found during removal", async () => {
      // Arrange
      const brandId = 999;
      service.remove.mockRejectedValue(
        new NotFoundException("Brand not found"),
      );

      // Act & Assert
      await expect(controller.remove(brandId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
