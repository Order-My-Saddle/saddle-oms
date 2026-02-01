import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { OrderProductSaddleController } from "../../../src/order-product-saddles/order-product-saddle.controller";
import { OrderProductSaddleService } from "../../../src/order-product-saddles/order-product-saddle.service";
import { CreateOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/create-order-product-saddle.dto";
import { UpdateOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/update-order-product-saddle.dto";
import { QueryOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/query-order-product-saddle.dto";
import { OrderProductSaddleDto } from "../../../src/order-product-saddles/dto/order-product-saddle.dto";

describe("OrderProductSaddleController", () => {
  let controller: OrderProductSaddleController;
  let service: jest.Mocked<OrderProductSaddleService>;

  const mockOrderProductSaddleDto: OrderProductSaddleDto = {
    id: 1,
    orderId: 1001,
    productId: 500,
    serial: "SN-2024-001",
    configuration: { color: "brown" } as Record<string, any>,
    quantity: 2,
    notes: "Special order",
    sequence: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByOrderId: jest.fn(),
      findByProductId: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      countByOrderId: jest.fn(),
      getTotalQuantityByOrderId: jest.fn(),
      bulkCreate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderProductSaddleController],
      providers: [
        { provide: OrderProductSaddleService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<OrderProductSaddleController>(
      OrderProductSaddleController,
    );
    service = module.get(OrderProductSaddleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new order-product-saddle relationship successfully", async () => {
      // Arrange
      const createDto: CreateOrderProductSaddleDto = {
        orderId: 1001,
        productId: 500,
        serial: "SN-2024-001",
        quantity: 2,
      };
      service.create.mockResolvedValue(mockOrderProductSaddleDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockOrderProductSaddleDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it("should handle validation error", async () => {
      // Arrange
      const createDto: CreateOrderProductSaddleDto = {
        productId: 500,
      } as CreateOrderProductSaddleDto;
      service.create.mockRejectedValue(
        new BadRequestException("Both orderId and productId are required"),
      );

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all relationships with query filters", async () => {
      // Arrange
      const queryDto = new QueryOrderProductSaddleDto();
      queryDto.orderId = 1001;
      const relationships = [mockOrderProductSaddleDto];
      service.findAll.mockResolvedValue(relationships);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(relationships);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe("findByOrderId", () => {
    it("should return all products for a specific order", async () => {
      // Arrange
      const orderId = 1001;
      const products = [mockOrderProductSaddleDto];
      service.findByOrderId.mockResolvedValue(products);

      // Act
      const result = await controller.findByOrderId(orderId);

      // Assert
      expect(result).toEqual(products);
      expect(service.findByOrderId).toHaveBeenCalledWith(orderId);
    });
  });

  describe("getOrderProductCount", () => {
    it("should return count and total quantity for an order", async () => {
      // Arrange
      const orderId = 1001;
      service.countByOrderId.mockResolvedValue(3);
      service.getTotalQuantityByOrderId.mockResolvedValue(10);

      // Act
      const result = await controller.getOrderProductCount(orderId);

      // Assert
      expect(result).toEqual({
        count: 3,
        totalQuantity: 10,
      });
      expect(service.countByOrderId).toHaveBeenCalledWith(orderId);
      expect(service.getTotalQuantityByOrderId).toHaveBeenCalledWith(orderId);
    });

    it("should call both methods in parallel", async () => {
      // Arrange
      const orderId = 1001;
      service.countByOrderId.mockResolvedValue(0);
      service.getTotalQuantityByOrderId.mockResolvedValue(0);

      // Act
      await controller.getOrderProductCount(orderId);

      // Assert
      expect(service.countByOrderId).toHaveBeenCalledWith(orderId);
      expect(service.getTotalQuantityByOrderId).toHaveBeenCalledWith(orderId);
    });
  });

  describe("findByProductId", () => {
    it("should return all orders for a specific product", async () => {
      // Arrange
      const productId = 500;
      const orders = [mockOrderProductSaddleDto];
      service.findByProductId.mockResolvedValue(orders);

      // Act
      const result = await controller.findByProductId(productId);

      // Assert
      expect(result).toEqual(orders);
      expect(service.findByProductId).toHaveBeenCalledWith(productId);
    });
  });

  describe("findOne", () => {
    it("should return relationship by ID", async () => {
      // Arrange
      const id = 1;
      service.findOne.mockResolvedValue(mockOrderProductSaddleDto);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(mockOrderProductSaddleDto);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it("should handle relationship not found", async () => {
      // Arrange
      const id = 999;
      service.findOne.mockRejectedValue(
        new NotFoundException("Order-product relationship not found"),
      );

      // Act & Assert
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update relationship successfully", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateOrderProductSaddleDto = {
        quantity: 5,
        notes: "Updated notes",
      };
      const updatedRelationship = {
        ...mockOrderProductSaddleDto,
        ...updateDto,
      };
      service.update.mockResolvedValue(updatedRelationship);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(updatedRelationship);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it("should handle relationship not found during update", async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateOrderProductSaddleDto = { quantity: 5 };
      service.update.mockRejectedValue(
        new NotFoundException("Order-product relationship not found"),
      );

      // Act & Assert
      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove relationship successfully", async () => {
      // Arrange
      const id = 1;
      service.remove.mockResolvedValue();

      // Act
      await controller.remove(id);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle relationship not found during removal", async () => {
      // Arrange
      const id = 999;
      service.remove.mockRejectedValue(
        new NotFoundException("Order-product relationship not found"),
      );

      // Act & Assert
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("bulkCreate", () => {
    it("should bulk create multiple relationships", async () => {
      // Arrange
      const createDtos: CreateOrderProductSaddleDto[] = [
        {
          orderId: 1001,
          productId: 500,
          quantity: 1,
        },
        {
          orderId: 1001,
          productId: 501,
          quantity: 2,
        },
      ];
      const createdRelationships = [
        mockOrderProductSaddleDto,
        { ...mockOrderProductSaddleDto, id: 2, productId: 501 },
      ];
      service.bulkCreate.mockResolvedValue(createdRelationships);

      // Act
      const result = await controller.bulkCreate(createDtos);

      // Assert
      expect(result).toEqual(createdRelationships);
      expect(service.bulkCreate).toHaveBeenCalledWith(createDtos);
    });
  });
});
