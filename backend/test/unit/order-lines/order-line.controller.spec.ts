import { Test, TestingModule } from "@nestjs/testing";
import { OrderLineController } from "../../../src/order-lines/order-line.controller";
import { OrderLineService } from "../../../src/order-lines/order-line.service";
import { CreateOrderLineDto } from "../../../src/order-lines/dto/create-order-line.dto";
import { UpdateOrderLineDto } from "../../../src/order-lines/dto/update-order-line.dto";

describe("OrderLineController", () => {
  let controller: OrderLineController;
  let service: jest.Mocked<OrderLineService>;

  const mockOrderLineDto = {
    id: 1,
    orderId: 100,
    productId: 50,
    quantity: 2,
    unitPrice: 250.0,
    totalPrice: 500.0,
    notes: "Test notes",
    sequence: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      bulkCreate: jest.fn(),
      findAll: jest.fn(),
      findByOrderId: jest.fn(),
      findByProductId: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      calculateOrderTotal: jest.fn(),
      resequence: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderLineController],
      providers: [
        {
          provide: OrderLineService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<OrderLineController>(OrderLineController);
    service = module.get(OrderLineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new order line", async () => {
      // Arrange
      const createDto: CreateOrderLineDto = {
        orderId: 100,
        productId: 50,
        quantity: 2,
        unitPrice: 250.0,
        totalPrice: 500.0,
      };

      service.create.mockResolvedValue(mockOrderLineDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockOrderLineDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("bulkCreate", () => {
    it("should bulk create order lines", async () => {
      // Arrange
      const createDtos: CreateOrderLineDto[] = [
        {
          orderId: 100,
          productId: 50,
          quantity: 1,
          unitPrice: 250.0,
          totalPrice: 250.0,
        },
        {
          orderId: 100,
          productId: 51,
          quantity: 2,
          unitPrice: 300.0,
          totalPrice: 600.0,
        },
      ];

      service.bulkCreate.mockResolvedValue([
        mockOrderLineDto,
        { ...mockOrderLineDto, id: 2 },
      ]);

      // Act
      const result = await controller.bulkCreate(createDtos);

      // Assert
      expect(result).toHaveLength(2);
      expect(service.bulkCreate).toHaveBeenCalledWith(createDtos);
    });
  });

  describe("findAll", () => {
    it("should return paginated order lines", async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 20,
      };

      const paginatedResult = {
        data: [mockOrderLineDto],
        total: 1,
        page: 1,
        limit: 20,
      };

      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll(query as any);

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it("should pass filter parameters to service", async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 20,
        orderId: 100,
        productId: 50,
      };

      service.findAll.mockResolvedValue({
        data: [mockOrderLineDto],
        total: 1,
        page: 1,
        limit: 20,
      });

      // Act
      await controller.findAll(query as any);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("findByOrderId", () => {
    it("should return order lines for specific order", async () => {
      // Arrange
      service.findByOrderId.mockResolvedValue([mockOrderLineDto]);

      // Act
      const result = await controller.findByOrderId(100);

      // Assert
      expect(result).toEqual([mockOrderLineDto]);
      expect(service.findByOrderId).toHaveBeenCalledWith(100);
    });

    it("should return empty array when no lines found", async () => {
      // Arrange
      service.findByOrderId.mockResolvedValue([]);

      // Act
      const result = await controller.findByOrderId(999);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("calculateOrderTotal", () => {
    it("should return order total", async () => {
      // Arrange
      service.calculateOrderTotal.mockResolvedValue(1500.5);

      // Act
      const result = await controller.calculateOrderTotal(100);

      // Assert
      expect(result).toEqual({ total: 1500.5 });
      expect(service.calculateOrderTotal).toHaveBeenCalledWith(100);
    });

    it("should return zero total for empty order", async () => {
      // Arrange
      service.calculateOrderTotal.mockResolvedValue(0);

      // Act
      const result = await controller.calculateOrderTotal(999);

      // Assert
      expect(result).toEqual({ total: 0 });
    });
  });

  describe("resequence", () => {
    it("should resequence order lines successfully", async () => {
      // Arrange
      const lineIds = [2, 1, 3];
      service.resequence.mockResolvedValue([
        mockOrderLineDto,
        { ...mockOrderLineDto, id: 2 },
        { ...mockOrderLineDto, id: 3 },
      ]);

      // Act
      const result = await controller.resequence(100, lineIds);

      // Assert
      expect(result).toHaveLength(3);
      expect(service.resequence).toHaveBeenCalledWith(100, lineIds);
    });

    it("should propagate errors from service", async () => {
      // Arrange
      service.resequence.mockRejectedValue(new Error("Line IDs do not match"));

      // Act & Assert
      await expect(controller.resequence(100, [1, 2])).rejects.toThrow(
        "Line IDs do not match",
      );
    });
  });

  describe("findByProductId", () => {
    it("should return order lines for specific product", async () => {
      // Arrange
      service.findByProductId.mockResolvedValue([mockOrderLineDto]);

      // Act
      const result = await controller.findByProductId(50);

      // Assert
      expect(result).toEqual([mockOrderLineDto]);
      expect(service.findByProductId).toHaveBeenCalledWith(50);
    });
  });

  describe("findOne", () => {
    it("should return order line by ID", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockOrderLineDto);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockOrderLineDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should propagate NotFoundException from service", async () => {
      // Arrange
      service.findOne.mockRejectedValue(new Error("Order line not found"));

      // Act & Assert
      await expect(controller.findOne(999)).rejects.toThrow(
        "Order line not found",
      );
    });
  });

  describe("update", () => {
    it("should update order line successfully", async () => {
      // Arrange
      const updateDto: UpdateOrderLineDto = {
        quantity: 3,
        totalPrice: 750.0,
      };

      const updatedOrderLine = {
        ...mockOrderLineDto,
        ...updateDto,
      };

      service.update.mockResolvedValue(updatedOrderLine);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedOrderLine);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it("should handle partial updates", async () => {
      // Arrange
      const updateDto: UpdateOrderLineDto = {
        notes: "Updated notes",
      };

      service.update.mockResolvedValue(mockOrderLineDto);

      // Act
      await controller.update(1, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe("remove", () => {
    it("should remove order line successfully", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it("should propagate errors from service", async () => {
      // Arrange
      service.remove.mockRejectedValue(new Error("Order line not found"));

      // Act & Assert
      await expect(controller.remove(999)).rejects.toThrow(
        "Order line not found",
      );
    });
  });
});
