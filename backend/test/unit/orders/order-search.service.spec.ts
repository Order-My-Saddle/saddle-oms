import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderSearchService } from "../../../src/orders/order-search.service";
import { OrderEntity } from "../../../src/orders/infrastructure/persistence/relational/entities/order.entity";
import { OrderMapper as DtoMapper } from "../../../src/orders/mappers/order-dto.mapper";
import { OrderMapper } from "../../../src/orders/infrastructure/persistence/relational/mappers/order.mapper";

describe("OrderSearchService", () => {
  let service: OrderSearchService;
  let repository: jest.Mocked<Repository<OrderEntity>>;
  let dtoMapper: jest.Mocked<DtoMapper>;
  let domainMapper: jest.Mocked<OrderMapper>;

  const mockOrderEntity = {
    id: 1,
    orderNumber: "ORD-001",
    customerId: 10,
    customerName: "John Doe",
    saddleId: 5,
    fitterId: 3,
    factoryId: 2,
    status: "pending",
    priority: "high",
    isUrgent: true,
    totalAmount: 1500.0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  } as OrderEntity;

  const mockDomainOrder = {
    id: 1,
    orderNumber: "ORD-001",
    customerName: "John Doe",
  };

  const mockOrderDto = {
    id: 1,
    orderNumber: "ORD-001",
    customerName: "John Doe",
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(10),
      getMany: jest.fn().mockResolvedValue([mockOrderEntity]),
      clone: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ average: "1500.00" }),
      limit: jest.fn().mockReturnThis(),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const mockDtoMapper = {
      toDto: jest.fn().mockReturnValue(mockOrderDto),
    };

    const mockDomainMapper = {
      toDomain: jest.fn().mockReturnValue(mockDomainOrder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderSearchService,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: mockRepository,
        },
        {
          provide: DtoMapper,
          useValue: mockDtoMapper,
        },
        {
          provide: OrderMapper,
          useValue: mockDomainMapper,
        },
      ],
    }).compile();

    service = module.get<OrderSearchService>(OrderSearchService);
    repository = module.get(getRepositoryToken(OrderEntity));
    dtoMapper = module.get(DtoMapper);
    domainMapper = module.get(OrderMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchOrders", () => {
    it("should search orders with pagination", async () => {
      // Arrange
      const searchDto = {
        page: 1,
        limit: 20,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
        sortBy: "createdAt",
        sortOrder: "DESC" as const,
      };

      // Act
      const result = await service.searchOrders(searchDto as any);

      // Assert
      expect(result).toBeDefined();
      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it("should filter by customer name", async () => {
      // Arrange
      const searchDto = {
        customer: "John",
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.customerName ILIKE :customerName",
        { customerName: "%John%" },
      );
    });

    it("should filter by order ID", async () => {
      // Arrange
      const searchDto = {
        orderId: 123,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "CAST(order.id AS VARCHAR) = :orderIdStr",
        { orderIdStr: "123" },
      );
    });

    it("should filter by order number", async () => {
      // Arrange
      const searchDto = {
        orderNumber: "ORD-001",
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.orderNumber = :orderNumber",
        { orderNumber: "ORD-001" },
      );
    });

    it("should filter by urgency flag", async () => {
      // Arrange
      const searchDto = {
        isUrgent: true,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.isUrgent = :isUrgent",
        { isUrgent: true },
      );
    });

    it("should filter by saddle ID", async () => {
      // Arrange
      const searchDto = {
        saddleId: 5,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.saddleId = :saddleId",
        { saddleId: 5 },
      );
    });

    it("should filter by fitter ID", async () => {
      // Arrange
      const searchDto = {
        fitterId: 3,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.fitterId = :fitterId",
        { fitterId: 3 },
      );
    });

    it("should filter by factory ID", async () => {
      // Arrange
      const searchDto = {
        factoryId: 2,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.factoryId = :factoryId",
        { factoryId: 2 },
      );
    });

    it("should filter by customer ID", async () => {
      // Arrange
      const searchDto = {
        customerId: 10,
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.customerId = :customerId",
        { customerId: 10 },
      );
    });

    it("should filter by status", async () => {
      // Arrange
      const searchDto = {
        status: "pending",
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.status = :status",
        { status: "pending" },
      );
    });

    it("should filter by priority", async () => {
      // Arrange
      const searchDto = {
        priority: "high",
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.priority = :priority",
        { priority: "high" },
      );
    });

    it("should filter by date range", async () => {
      // Arrange
      const searchDto = {
        dateFrom: "2024-01-01",
        dateTo: "2024-12-31",
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      await service.searchOrders(searchDto as any);

      // Assert
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.createdAt >= :dateFrom",
        { dateFrom: new Date("2024-01-01") },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.createdAt <= :dateTo",
        { dateTo: new Date("2024-12-31") },
      );
    });

    it("should calculate hasNext correctly", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getCount = jest.fn().mockResolvedValue(100);

      const searchDto = {
        page: 1,
        getOffset: jest.fn().mockReturnValue(0),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      const result = await service.searchOrders(searchDto as any);

      // Assert
      expect(result.hasNext).toBe(true);
    });

    it("should calculate hasPrev correctly", async () => {
      // Arrange
      const searchDto = {
        page: 2,
        getOffset: jest.fn().mockReturnValue(20),
        getLimit: jest.fn().mockReturnValue(20),
      };

      // Act
      const result = await service.searchOrders(searchDto as any);

      // Assert
      expect(result.hasPrev).toBe(true);
    });
  });

  describe("getSearchSuggestions", () => {
    it("should return customer name suggestions", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getRawMany = jest
        .fn()
        .mockResolvedValue([
          { suggestion: "John Doe" },
          { suggestion: "Jane Doe" },
        ]);

      // Act
      const result = await service.getSearchSuggestions("customer", "Doe", 10);

      // Assert
      expect(result).toEqual(["John Doe", "Jane Doe"]);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "DISTINCT order.customerName",
        "suggestion",
      );
    });

    it("should return order number suggestions", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getRawMany = jest
        .fn()
        .mockResolvedValue([
          { suggestion: "ORD-001" },
          { suggestion: "ORD-002" },
        ]);

      // Act
      const result = await service.getSearchSuggestions(
        "orderNumber",
        "ORD",
        10,
      );

      // Assert
      expect(result).toEqual(["ORD-001", "ORD-002"]);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "DISTINCT order.orderNumber",
        "suggestion",
      );
    });

    it("should return empty array for short query", async () => {
      // Arrange

      // Act
      const result = await service.getSearchSuggestions("customer", "J", 10);

      // Assert
      expect(result).toEqual([]);
    });

    it("should filter out null suggestions", async () => {
      // Arrange
      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getRawMany = jest
        .fn()
        .mockResolvedValue([
          { suggestion: "John Doe" },
          { suggestion: null },
          { suggestion: "Jane Doe" },
        ]);

      // Act
      const result = await service.getSearchSuggestions("customer", "Doe", 10);

      // Assert
      expect(result).toEqual(["John Doe", "Jane Doe"]);
    });
  });

  describe("getSearchStats", () => {
    it("should return search statistics", async () => {
      // Arrange
      const searchDto = {
        status: "pending",
        getOffset: jest.fn(),
        getLimit: jest.fn(),
      };

      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getCount = jest
        .fn()
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(20);
      mockQueryBuilder.getRawMany = jest.fn().mockResolvedValue([
        { status: "pending", count: "60" },
        { status: "completed", count: "40" },
      ]);
      mockQueryBuilder.getRawOne = jest
        .fn()
        .mockResolvedValue({ average: "1500.50" });

      // Act
      const result = await service.getSearchStats(searchDto as any);

      // Assert
      expect(result).toEqual({
        totalMatching: 100,
        urgentCount: 20,
        statusBreakdown: {
          pending: 60,
          completed: 40,
        },
        averageValue: 1500.5,
      });
    });

    it("should handle empty status breakdown", async () => {
      // Arrange
      const searchDto = {
        getOffset: jest.fn(),
        getLimit: jest.fn(),
      };

      const mockQueryBuilder = repository.createQueryBuilder();
      mockQueryBuilder.getCount = jest
        .fn()
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      mockQueryBuilder.getRawMany = jest.fn().mockResolvedValue([]);
      mockQueryBuilder.getRawOne = jest.fn().mockResolvedValue(null);

      // Act
      const result = await service.getSearchStats(searchDto as any);

      // Assert
      expect(result.totalMatching).toBe(0);
      expect(result.statusBreakdown).toEqual({});
      expect(result.averageValue).toBe(0);
    });
  });
});
