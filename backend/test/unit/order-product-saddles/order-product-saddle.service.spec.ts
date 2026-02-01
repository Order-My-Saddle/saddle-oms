import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { OrderProductSaddleService } from "../../../src/order-product-saddles/order-product-saddle.service";
import { OrderProductSaddleEntity } from "../../../src/order-product-saddles/infrastructure/persistence/relational/entities/order-product-saddle.entity";
import { CreateOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/create-order-product-saddle.dto";
import { UpdateOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/update-order-product-saddle.dto";
import { QueryOrderProductSaddleDto } from "../../../src/order-product-saddles/dto/query-order-product-saddle.dto";

describe("OrderProductSaddleService", () => {
  let service: OrderProductSaddleService;
  let repository: jest.Mocked<Repository<OrderProductSaddleEntity>>;

  const mockOrderProductSaddleEntity: OrderProductSaddleEntity = {
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
  } as OrderProductSaddleEntity;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProductSaddleService,
        {
          provide: getRepositoryToken(OrderProductSaddleEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrderProductSaddleService>(OrderProductSaddleService);
    repository = module.get(getRepositoryToken(OrderProductSaddleEntity));
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
        configuration: { color: "brown" } as Record<string, any>,
        quantity: 2,
        notes: "Special order",
        sequence: 1,
      };

      repository.create.mockReturnValue(mockOrderProductSaddleEntity);
      repository.save.mockResolvedValue(mockOrderProductSaddleEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        orderId: 1001,
        productId: 500,
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 1001,
          productId: 500,
          quantity: 2,
        }),
      );
      expect(repository.save).toHaveBeenCalledWith(
        mockOrderProductSaddleEntity,
      );
    });

    it("should create with default values", async () => {
      // Arrange
      const createDto: CreateOrderProductSaddleDto = {
        orderId: 1001,
        productId: 500,
      };

      repository.create.mockReturnValue(mockOrderProductSaddleEntity);
      repository.save.mockResolvedValue(mockOrderProductSaddleEntity);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          serial: null,
          configuration: null,
          quantity: 1,
          notes: null,
          sequence: 0,
        }),
      );
    });

    it("should throw BadRequestException when orderId is missing", async () => {
      // Arrange
      const createDto: CreateOrderProductSaddleDto = {
        productId: 500,
      } as CreateOrderProductSaddleDto;

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when productId is missing", async () => {
      // Arrange
      const createDto: CreateOrderProductSaddleDto = {
        orderId: 1001,
      } as CreateOrderProductSaddleDto;

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return all relationships with query filters", async () => {
      // Arrange
      const queryDto = new QueryOrderProductSaddleDto();
      queryDto.orderId = 1001;
      queryDto.page = 1;
      queryDto.limit = 10;

      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderId: 1001,
      });
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ orderId: 1001 }),
          order: { sequence: "ASC" },
          skip: 0,
          take: 10,
        }),
      );
    });

    it("should filter by productId", async () => {
      // Arrange
      const queryDto = new QueryOrderProductSaddleDto();
      queryDto.productId = 500;

      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ productId: 500 }),
        }),
      );
    });

    it("should filter by serial", async () => {
      // Arrange
      const queryDto = new QueryOrderProductSaddleDto();
      queryDto.serial = "SN-2024-001";

      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ serial: "SN-2024-001" }),
        }),
      );
    });

    it("should use getSortBy and getSortOrder from queryDto", async () => {
      // Arrange
      const queryDto = new QueryOrderProductSaddleDto();
      queryDto.sortBy = "createdAt";
      queryDto.sortOrder = "DESC";

      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: "DESC" },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should find relationship by ID", async () => {
      // Arrange
      const id = 1;
      repository.findOne.mockResolvedValue(mockOrderProductSaddleEntity);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        orderId: 1001,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it("should throw NotFoundException when relationship not found", async () => {
      // Arrange
      const id = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByOrderId", () => {
    it("should find all products for a specific order", async () => {
      // Arrange
      const orderId = 1001;
      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      const result = await service.findByOrderId(orderId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        orderId: 1001,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId },
        order: { sequence: "ASC" },
      });
    });

    it("should return empty array when no products found", async () => {
      // Arrange
      const orderId = 999;
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByOrderId(orderId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByProductId", () => {
    it("should find all orders for a specific product", async () => {
      // Arrange
      const productId = 500;
      repository.find.mockResolvedValue([mockOrderProductSaddleEntity]);

      // Act
      const result = await service.findByProductId(productId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        productId: 500,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { productId },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("update", () => {
    it("should update relationship successfully", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateOrderProductSaddleDto = {
        quantity: 5,
        notes: "Updated notes",
        sequence: 3,
      };

      const updatedEntity = {
        ...mockOrderProductSaddleEntity,
        quantity: 5,
        notes: "Updated notes",
        sequence: 3,
      };

      repository.findOne.mockResolvedValue(mockOrderProductSaddleEntity);
      repository.save.mockResolvedValue(
        updatedEntity as OrderProductSaddleEntity,
      );

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(result).toMatchObject({
        quantity: 5,
        notes: "Updated notes",
        sequence: 3,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when relationship not found", async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateOrderProductSaddleDto = { quantity: 5 };
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should soft delete relationship successfully", async () => {
      // Arrange
      const id = 1;
      repository.findOne.mockResolvedValue(mockOrderProductSaddleEntity);
      repository.softDelete.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      // Act
      await service.remove(id);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(repository.softDelete).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when relationship not found", async () => {
      // Arrange
      const id = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe("countByOrderId", () => {
    it("should count products for an order", async () => {
      // Arrange
      const orderId = 1001;
      repository.count.mockResolvedValue(3);

      // Act
      const result = await service.countByOrderId(orderId);

      // Assert
      expect(result).toBe(3);
      expect(repository.count).toHaveBeenCalledWith({
        where: { orderId },
      });
    });
  });

  describe("getTotalQuantityByOrderId", () => {
    it("should calculate total quantity for an order", async () => {
      // Arrange
      const orderId = 1001;
      const entities = [
        { ...mockOrderProductSaddleEntity, quantity: 2 },
        { ...mockOrderProductSaddleEntity, quantity: 3 },
        { ...mockOrderProductSaddleEntity, quantity: 5 },
      ];
      repository.find.mockResolvedValue(entities as OrderProductSaddleEntity[]);

      // Act
      const result = await service.getTotalQuantityByOrderId(orderId);

      // Assert
      expect(result).toBe(10);
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId },
      });
    });

    it("should return 0 when no products found", async () => {
      // Arrange
      const orderId = 999;
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.getTotalQuantityByOrderId(orderId);

      // Assert
      expect(result).toBe(0);
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

      const entities = [
        mockOrderProductSaddleEntity,
        { ...mockOrderProductSaddleEntity, id: 2, productId: 501 },
      ];

      repository.create.mockImplementation(
        (data) => data as OrderProductSaddleEntity,
      );
      repository.save.mockResolvedValue(entities as any);

      // Act
      const result = await service.bulkCreate(createDtos);

      // Assert
      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            orderId: 1001,
            productId: 500,
          }),
          expect.objectContaining({
            orderId: 1001,
            productId: 501,
          }),
        ]),
      );
    });
  });
});
