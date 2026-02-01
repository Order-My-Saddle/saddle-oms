import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { OrderLineService } from "../../../src/order-lines/order-line.service";
import { OrderLineEntity } from "../../../src/order-lines/infrastructure/persistence/relational/entities/order-line.entity";
import { CreateOrderLineDto } from "../../../src/order-lines/dto/create-order-line.dto";
import { UpdateOrderLineDto } from "../../../src/order-lines/dto/update-order-line.dto";

describe("OrderLineService", () => {
  let service: OrderLineService;
  let repository: jest.Mocked<Repository<OrderLineEntity>>;

  const mockOrderLine: OrderLineEntity = {
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
  } as OrderLineEntity;

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getMany: jest.fn().mockResolvedValue([mockOrderLine]),
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: "500.00" }),
    };

    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderLineService,
        {
          provide: getRepositoryToken(OrderLineEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrderLineService>(OrderLineService);
    repository = module.get(getRepositoryToken(OrderLineEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new order line successfully", async () => {
      // Arrange
      const createDto: CreateOrderLineDto = {
        orderId: 100,
        productId: 50,
        quantity: 2,
        unitPrice: 250.0,
        totalPrice: 500.0,
      };

      repository.create.mockReturnValue(mockOrderLine);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.orderId).toBe(100);
      expect(result.quantity).toBe(2);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          productId: 50,
          quantity: 2,
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it("should create order line with default quantity 1", async () => {
      // Arrange
      const createDto: CreateOrderLineDto = {
        orderId: 100,
        unitPrice: 250.0,
        totalPrice: 250.0,
      };

      repository.create.mockReturnValue(mockOrderLine);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 1,
        }),
      );
    });

    it("should create order line with default sequence 0", async () => {
      // Arrange
      const createDto: CreateOrderLineDto = {
        orderId: 100,
        unitPrice: 250.0,
        totalPrice: 250.0,
      };

      repository.create.mockReturnValue(mockOrderLine);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sequence: 0,
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should find order line by ID", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockOrderLine);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException when order line not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe("findAll", () => {
    it("should return paginated order lines", async () => {
      // Arrange
      const queryDto = {
        page: 1,
        limit: 20,
      };

      // Act
      const result = await service.findAll(queryDto as any);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should filter by orderId", async () => {
      // Arrange
      const queryDto = {
        page: 1,
        limit: 20,
        orderId: 100,
      };

      // Act
      await service.findAll(queryDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "orderLine.orderId = :orderId",
        { orderId: 100 },
      );
    });

    it("should filter by productId", async () => {
      // Arrange
      const queryDto = {
        page: 1,
        limit: 20,
        productId: 50,
      };

      // Act
      await service.findAll(queryDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "orderLine.productId = :productId",
        { productId: 50 },
      );
    });

    it("should apply default sorting by sequence", async () => {
      // Arrange
      const queryDto = {
        page: 1,
        limit: 20,
      };

      // Act
      await service.findAll(queryDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        "orderLine.sequence",
        "ASC",
      );
    });
  });

  describe("findByOrderId", () => {
    it("should find all order lines for an order", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockOrderLine]);

      // Act
      const result = await service.findByOrderId(100);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].orderId).toBe(100);
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId: 100 },
        order: { sequence: "ASC" },
      });
    });

    it("should return empty array when no lines found", async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByOrderId(999);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByProductId", () => {
    it("should find all order lines for a product", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockOrderLine]);

      // Act
      const result = await service.findByProductId(50);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(50);
      expect(repository.find).toHaveBeenCalledWith({
        where: { productId: 50 },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("update", () => {
    it("should update order line successfully", async () => {
      // Arrange
      const updateDto: UpdateOrderLineDto = {
        quantity: 3,
        unitPrice: 300.0,
        totalPrice: 900.0,
      };

      const updatedOrderLine = {
        ...mockOrderLine,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(mockOrderLine);
      repository.save.mockResolvedValue(updatedOrderLine as OrderLineEntity);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result.quantity).toBe(3);
      expect(result.unitPrice).toBe(300.0);
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when order line not found", async () => {
      // Arrange
      const updateDto: UpdateOrderLineDto = {
        quantity: 3,
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should update only provided fields", async () => {
      // Arrange
      const updateDto: UpdateOrderLineDto = {
        notes: "Updated notes",
      };

      repository.findOne.mockResolvedValue(mockOrderLine);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      await service.update(1, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: "Updated notes",
        }),
      );
    });

    it("should handle null productId update", async () => {
      // Arrange
      const updateDto = {
        productId: null,
      } as any;

      repository.findOne.mockResolvedValue(mockOrderLine);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      await service.update(1, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: null,
        }),
      );
    });
  });

  describe("remove", () => {
    it("should soft delete order line successfully", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockOrderLine);
      repository.softDelete.mockResolvedValue({ affected: 1, raw: [] } as any);

      // Act
      await service.remove(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when order line not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe("calculateOrderTotal", () => {
    it("should calculate total for order lines", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getRawOne = jest
        .fn()
        .mockResolvedValue({ total: "1500.50" });

      // Act
      const result = await service.calculateOrderTotal(100);

      // Assert
      expect(result).toBe(1500.5);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "SUM(orderLine.totalPrice)",
        "total",
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "orderLine.orderId = :orderId",
        { orderId: 100 },
      );
    });

    it("should return 0 when no order lines found", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getRawOne = jest.fn().mockResolvedValue(null);

      // Act
      const result = await service.calculateOrderTotal(999);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("resequence", () => {
    it("should resequence order lines successfully", async () => {
      // Arrange
      const orderLines = [
        { ...mockOrderLine, id: 1, sequence: 0 },
        { ...mockOrderLine, id: 2, sequence: 1 },
      ];

      repository.find.mockResolvedValue(orderLines as OrderLineEntity[]);
      repository.save.mockResolvedValue(mockOrderLine);

      // Act
      const result = await service.resequence(100, [2, 1]);

      // Assert
      expect(repository.save).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it("should throw BadRequestException when line IDs do not match", async () => {
      // Arrange
      const orderLines = [{ ...mockOrderLine, id: 1 }];

      repository.find.mockResolvedValue(orderLines as OrderLineEntity[]);

      // Act & Assert
      await expect(service.resequence(100, [1, 2, 3])).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("bulkCreate", () => {
    it("should bulk create order lines successfully", async () => {
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

      const orderLines = [
        { ...mockOrderLine, id: 1 },
        { ...mockOrderLine, id: 2 },
      ];

      repository.create.mockImplementation((dto) => dto as OrderLineEntity);
      repository.save.mockResolvedValue(orderLines as any);

      // Act
      const result = await service.bulkCreate(createDtos);

      // Assert
      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ orderId: 100 }),
          expect.objectContaining({ orderId: 100 }),
        ]),
      );
    });

    it("should handle empty array", async () => {
      // Arrange
      repository.save.mockResolvedValue([] as any);

      // Act
      const result = await service.bulkCreate([]);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).toHaveBeenCalledWith([]);
    });
  });
});
