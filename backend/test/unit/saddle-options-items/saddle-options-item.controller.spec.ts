import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { SaddleOptionsItemController } from "../../../src/saddle-options-items/saddle-options-item.controller";
import { SaddleOptionsItemService } from "../../../src/saddle-options-items/saddle-options-item.service";
import { CreateSaddleOptionsItemDto } from "../../../src/saddle-options-items/dto/create-saddle-options-item.dto";
import { UpdateSaddleOptionsItemDto } from "../../../src/saddle-options-items/dto/update-saddle-options-item.dto";
import { SaddleOptionsItemDto } from "../../../src/saddle-options-items/dto/saddle-options-item.dto";

describe("SaddleOptionsItemController", () => {
  let controller: SaddleOptionsItemController;
  let service: jest.Mocked<SaddleOptionsItemService>;

  const mockSaddleOptionsItemDto: SaddleOptionsItemDto = {
    id: 1,
    saddleId: 100,
    optionId: 10,
    optionItemId: 20,
    leatherId: 5,
    sequence: 1,
    deleted: 0,
    isActive: true,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBySaddleId: jest.fn(),
      findByOptionId: jest.fn(),
      findBySaddleAndOption: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaddleOptionsItemController],
      providers: [{ provide: SaddleOptionsItemService, useValue: mockService }],
    }).compile();

    controller = module.get<SaddleOptionsItemController>(
      SaddleOptionsItemController,
    );
    service = module.get(SaddleOptionsItemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new saddle-options-item association successfully", async () => {
      // Arrange
      const createDto: CreateSaddleOptionsItemDto = {
        saddleId: 100,
        optionId: 10,
        optionItemId: 20,
        leatherId: 5,
        sequence: 1,
      };
      service.create.mockResolvedValue(mockSaddleOptionsItemDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockSaddleOptionsItemDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it("should handle conflict when association already exists", async () => {
      // Arrange
      const createDto: CreateSaddleOptionsItemDto = {
        saddleId: 100,
        optionId: 10,
        optionItemId: 20,
        leatherId: 5,
      };
      service.create.mockRejectedValue(
        new ConflictException("Saddle-option-item association already exists"),
      );

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all associations with pagination", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleOptionsItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll(1, 10);

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined, undefined);
    });

    it("should filter by saddleId", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleOptionsItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, 100);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(1, 10, 100, undefined);
    });

    it("should filter by optionId", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockSaddleOptionsItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, undefined, 10);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined, 10);
    });
  });

  describe("findBySaddleId", () => {
    it("should return associations for a specific saddle", async () => {
      // Arrange
      const saddleId = 100;
      const associations = [mockSaddleOptionsItemDto];
      service.findBySaddleId.mockResolvedValue(associations);

      // Act
      const result = await controller.findBySaddleId(saddleId);

      // Assert
      expect(result).toEqual(associations);
      expect(service.findBySaddleId).toHaveBeenCalledWith(saddleId);
    });
  });

  describe("findByOptionId", () => {
    it("should return associations for a specific option", async () => {
      // Arrange
      const optionId = 10;
      const associations = [mockSaddleOptionsItemDto];
      service.findByOptionId.mockResolvedValue(associations);

      // Act
      const result = await controller.findByOptionId(optionId);

      // Assert
      expect(result).toEqual(associations);
      expect(service.findByOptionId).toHaveBeenCalledWith(optionId);
    });
  });

  describe("findBySaddleAndOption", () => {
    it("should return associations for a specific saddle and option", async () => {
      // Arrange
      const saddleId = 100;
      const optionId = 10;
      const associations = [mockSaddleOptionsItemDto];
      service.findBySaddleAndOption.mockResolvedValue(associations);

      // Act
      const result = await controller.findBySaddleAndOption(saddleId, optionId);

      // Assert
      expect(result).toEqual(associations);
      expect(service.findBySaddleAndOption).toHaveBeenCalledWith(
        saddleId,
        optionId,
      );
    });
  });

  describe("findOne", () => {
    it("should return association by ID", async () => {
      // Arrange
      const id = 1;
      service.findOne.mockResolvedValue(mockSaddleOptionsItemDto);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(mockSaddleOptionsItemDto);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it("should handle association not found", async () => {
      // Arrange
      const id = 999;
      service.findOne.mockRejectedValue(
        new NotFoundException("Saddle-options-item association not found"),
      );

      // Act & Assert
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update association successfully", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateSaddleOptionsItemDto = {
        sequence: 5,
        leatherId: 10,
      };
      const updatedAssociation = { ...mockSaddleOptionsItemDto, ...updateDto };
      service.update.mockResolvedValue(updatedAssociation);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(updatedAssociation);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it("should handle association not found during update", async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateSaddleOptionsItemDto = { sequence: 5 };
      service.update.mockRejectedValue(
        new NotFoundException("Saddle-options-item association not found"),
      );

      // Act & Assert
      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove association successfully", async () => {
      // Arrange
      const id = 1;
      service.remove.mockResolvedValue();

      // Act
      await controller.remove(id);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle association not found during removal", async () => {
      // Arrange
      const id = 999;
      service.remove.mockRejectedValue(
        new NotFoundException("Saddle-options-item association not found"),
      );

      // Act & Assert
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
