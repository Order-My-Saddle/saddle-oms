import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { OptionItemController } from "../../../src/options-items/option-item.controller";
import { OptionItemService } from "../../../src/options-items/option-item.service";
import { CreateOptionItemDto } from "../../../src/options-items/dto/create-option-item.dto";
import { UpdateOptionItemDto } from "../../../src/options-items/dto/update-option-item.dto";
import { OptionItemDto } from "../../../src/options-items/dto/option-item.dto";

describe("OptionItemController", () => {
  let controller: OptionItemController;
  let service: jest.Mocked<OptionItemService>;

  const mockOptionItemDto: OptionItemDto = {
    id: 1,
    optionId: 10,
    leatherId: 5,
    name: "Premium Leather Color",
    userColor: 1,
    userLeather: 1,
    price1: 100,
    price2: 110,
    price3: 120,
    price4: 130,
    price5: 140,
    price6: 150,
    price7: 160,
    sequence: 1,
    restrict: "none",
    deleted: 0,
    isActive: true,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByOptionId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findActiveItems: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OptionItemController],
      providers: [{ provide: OptionItemService, useValue: mockService }],
    }).compile();

    controller = module.get<OptionItemController>(OptionItemController);
    service = module.get(OptionItemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new option item successfully", async () => {
      // Arrange
      const createDto: CreateOptionItemDto = {
        optionId: 10,
        leatherId: 5,
        name: "Premium Leather Color",
        userColor: 1,
        userLeather: 1,
        price1: 100,
      };
      service.create.mockResolvedValue(mockOptionItemDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockOptionItemDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should return all option items with pagination", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockOptionItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll(1, 10);

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should filter by optionId", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockOptionItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, 10);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        10,
        undefined,
        undefined,
      );
    });

    it("should filter by leatherId", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockOptionItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, undefined, 5);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        5,
        undefined,
      );
    });

    it("should filter by search term", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockOptionItemDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, undefined, undefined, "Premium");

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined,
        undefined,
        "Premium",
      );
    });
  });

  describe("findActiveItems", () => {
    it("should return all active option items", async () => {
      // Arrange
      const activeItems = [mockOptionItemDto];
      service.findActiveItems.mockResolvedValue(activeItems);

      // Act
      const result = await controller.findActiveItems();

      // Assert
      expect(result).toEqual(activeItems);
      expect(service.findActiveItems).toHaveBeenCalledTimes(1);
    });
  });

  describe("findByOptionId", () => {
    it("should return items for a specific option", async () => {
      // Arrange
      const optionId = 10;
      const items = [mockOptionItemDto];
      service.findByOptionId.mockResolvedValue(items);

      // Act
      const result = await controller.findByOptionId(optionId);

      // Assert
      expect(result).toEqual(items);
      expect(service.findByOptionId).toHaveBeenCalledWith(optionId);
    });
  });

  describe("findOne", () => {
    it("should return option item by ID", async () => {
      // Arrange
      const itemId = 1;
      service.findOne.mockResolvedValue(mockOptionItemDto);

      // Act
      const result = await controller.findOne(itemId);

      // Assert
      expect(result).toEqual(mockOptionItemDto);
      expect(service.findOne).toHaveBeenCalledWith(itemId);
    });

    it("should handle item not found", async () => {
      // Arrange
      const itemId = 999;
      service.findOne.mockRejectedValue(
        new NotFoundException("Option item not found"),
      );

      // Act & Assert
      await expect(controller.findOne(itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update option item successfully", async () => {
      // Arrange
      const itemId = 1;
      const updateDto: UpdateOptionItemDto = {
        name: "Updated Name",
        price1: 200,
      };
      const updatedItem = { ...mockOptionItemDto, ...updateDto };
      service.update.mockResolvedValue(updatedItem);

      // Act
      const result = await controller.update(itemId, updateDto);

      // Assert
      expect(result).toEqual(updatedItem);
      expect(service.update).toHaveBeenCalledWith(itemId, updateDto);
    });

    it("should handle item not found during update", async () => {
      // Arrange
      const itemId = 999;
      const updateDto: UpdateOptionItemDto = { name: "New Name" };
      service.update.mockRejectedValue(
        new NotFoundException("Option item not found"),
      );

      // Act & Assert
      await expect(controller.update(itemId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove option item successfully", async () => {
      // Arrange
      const itemId = 1;
      service.remove.mockResolvedValue();

      // Act
      await controller.remove(itemId);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(itemId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle item not found during removal", async () => {
      // Arrange
      const itemId = 999;
      service.remove.mockRejectedValue(
        new NotFoundException("Option item not found"),
      );

      // Act & Assert
      await expect(controller.remove(itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
