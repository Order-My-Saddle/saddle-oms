import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { OrderSearchService } from "../order-search.service";
import { OrderEntity } from "../infrastructure/persistence/relational/entities/order.entity";
import { OrderSearchDto } from "../dto/order-search.dto";
import { OrderMapper as DtoMapper } from "../mappers/order-dto.mapper";
import { OrderMapper } from "../infrastructure/persistence/relational/mappers/order.mapper";
import { Order } from "../domain/order";
import { OrderId } from "../domain/value-objects/order-id.value-object";
import { OrderStatus } from "../domain/value-objects/order-status.value-object";
import { OrderPriority } from "../domain/value-objects/order-priority.value-object";

describe("OrderSearchService", () => {
  let service: OrderSearchService;
  let _repository: Repository<OrderEntity>;
  void _repository; // Reserved for direct repository testing
  let queryBuilder: jest.Mocked<SelectQueryBuilder<OrderEntity>>;

  const mockOrderEntity: OrderEntity = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    customerId: "123e4567-e89b-12d3-a456-426614174000",
    orderNumber: "ORD-2023-001",
    status: "pending",
    priority: "normal",
    fitterId: null,
    factoryId: null,
    saddleSpecifications: { brand: "Prestige" },
    specialInstructions: null,
    estimatedDeliveryDate: new Date("2024-03-15"),
    actualDeliveryDate: null,
    totalAmount: 2500.0,
    depositPaid: 750.0,
    balanceOwing: 1750.0,
    measurements: null,
    isUrgent: false,
    // Legacy boolean flags
    rushed: false,
    repair: false,
    demo: false,
    sponsored: false,
    fitterStock: false,
    customOrder: false,
    changed: null,
    // NOTE: seatSizes removed - legacy system stores seat size in special_notes field
    customerName: "John Smith",
    saddleId: "saddle-123",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    deletedAt: null,
  } as OrderEntity;

  beforeEach(async () => {
    // Mock query builder
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      clone: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrderEntity]),
      getCount: jest.fn().mockResolvedValue(1),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ average: "2000" }),
      limit: jest.fn().mockReturnThis(),
    } as any;

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
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
          useValue: {
            toDto: jest.fn().mockReturnValue({
              id: "123e4567-e89b-12d3-a456-426614174000",
              orderNumber: "ORD-2023-001",
              customerName: "John Smith",
            }),
          },
        },
        {
          provide: OrderMapper,
          useValue: {
            toDomain: jest.fn().mockReturnValue(
              new (Order as any)(
                OrderId.fromString("123e4567-e89b-12d3-a456-426614174000"),
                "123e4567-e89b-12d3-a456-426614174000",
                "ORD-2023-001",
                OrderStatus.PENDING,
                OrderPriority.NORMAL,
                null,
                null,
                { brand: "Prestige" },
                null,
                new Date("2024-03-15"),
                null,
                2500.0,
                750.0,
                1750.0,
                null,
                false,
                new Date("2023-01-01"),
                new Date("2023-01-01"),
                // NOTE: seatSizes param removed - legacy system stores seat size in special_notes
                "John Smith",
                "saddle-123",
              ),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<OrderSearchService>(OrderSearchService);
    _repository = module.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("searchOrders", () => {
    it("should perform basic search with pagination", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.page = 1;
      searchDto.limit = 20;

      const result = await service.searchOrders(searchDto);

      expect(result).toHaveProperty("orders");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("limit", 20);
      expect(result).toHaveProperty("hasNext");
      expect(result).toHaveProperty("hasPrev");

      expect(queryBuilder.where).toHaveBeenCalledWith(
        "order.deletedAt IS NULL",
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(20);
    });

    it("should search by customer name using ILIKE", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.customer = "John";

      await service.searchOrders(searchDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.customerName ILIKE :customerName",
        { customerName: "%John%" },
      );
    });

    it("should search by order ID (UUID)", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.orderId = 12345;

      await service.searchOrders(searchDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "CAST(order.id AS VARCHAR) = :orderIdStr",
        { orderIdStr: "12345" },
      );
    });

    // NOTE: Test for seatSize search removed - legacy system stores seat size in special_notes field

    it("should search by urgency flag", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.isUrgent = true;

      await service.searchOrders(searchDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.isUrgent = :isUrgent",
        { isUrgent: true },
      );
    });

    it("should search by date range", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.dateFrom = "2023-01-01T00:00:00.000Z";
      searchDto.dateTo = "2023-12-31T23:59:59.999Z";

      await service.searchOrders(searchDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.createdAt >= :dateFrom",
        { dateFrom: new Date("2023-01-01T00:00:00.000Z") },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.createdAt <= :dateTo",
        { dateTo: new Date("2023-12-31T23:59:59.999Z") },
      );
    });

    it("should apply multiple search criteria", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.customer = "Smith";
      searchDto.isUrgent = true;
      searchDto.status = "pending";
      searchDto.fitterId = "789e0123-e45b-67c8-d901-234567890abc";

      await service.searchOrders(searchDto);

      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(4);
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.customerName ILIKE :customerName",
        { customerName: "%Smith%" },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.isUrgent = :isUrgent",
        { isUrgent: true },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.status = :status",
        { status: "pending" },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.fitterId = :fitterId",
        { fitterId: "789e0123-e45b-67c8-d901-234567890abc" },
      );
    });

    it("should handle pagination correctly", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.page = 3;
      searchDto.limit = 10;

      const result = await service.searchOrders(searchDto);

      expect(queryBuilder.skip).toHaveBeenCalledWith(20); // (3-1) * 10
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(10);
    });

    it("should enforce maximum limit of 100", async () => {
      const searchDto = new OrderSearchDto();
      searchDto.limit = 200; // Exceeds maximum

      const result = await service.searchOrders(searchDto);

      expect(queryBuilder.take).toHaveBeenCalledWith(100);
      expect(result.limit).toBe(100);
    });
  });

  describe("getSearchSuggestions", () => {
    it("should return customer name suggestions", async () => {
      queryBuilder.getRawMany.mockResolvedValue([
        { suggestion: "John Smith" },
        { suggestion: "Jane Smith" },
      ]);

      const result = await service.getSearchSuggestions("customer", "Smith");

      expect(result).toEqual(["John Smith", "Jane Smith"]);
      expect(queryBuilder.select).toHaveBeenCalledWith(
        "DISTINCT order.customerName",
        "suggestion",
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        "order.customerName ILIKE :query",
        { query: "%Smith%" },
      );
    });

    it("should return order number suggestions", async () => {
      queryBuilder.getRawMany.mockResolvedValue([
        { suggestion: "ORD-2023-001" },
        { suggestion: "ORD-2023-002" },
      ]);

      const result = await service.getSearchSuggestions(
        "orderNumber",
        "ORD-2023",
      );

      expect(result).toEqual(["ORD-2023-001", "ORD-2023-002"]);
      expect(queryBuilder.select).toHaveBeenCalledWith(
        "DISTINCT order.orderNumber",
        "suggestion",
      );
    });

    it("should return empty array for short queries", async () => {
      const result = await service.getSearchSuggestions("customer", "J");

      expect(result).toEqual([]);
    });
  });

  describe("getSearchStats", () => {
    it("should return search statistics", async () => {
      queryBuilder.getCount
        .mockResolvedValueOnce(100) // total matching
        .mockResolvedValueOnce(15); // urgent count

      queryBuilder.getRawMany.mockResolvedValue([
        { status: "pending", count: "50" },
        { status: "in_production", count: "30" },
        { status: "completed", count: "20" },
      ]);

      queryBuilder.getRawOne.mockResolvedValue({ average: "2500.50" });

      const searchDto = new OrderSearchDto();
      const result = await service.getSearchStats(searchDto);

      expect(result).toEqual({
        totalMatching: 100,
        urgentCount: 15,
        statusBreakdown: {
          pending: 50,
          in_production: 30,
          completed: 20,
        },
        averageValue: 2500.5,
      });
    });
  });

  describe("performance monitoring", () => {
    it("should log performance warnings for slow queries", async () => {
      // Mock a slow query (>100ms)
      jest
        .spyOn(Date, "now")
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1150); // end time (+150ms)

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const searchDto = new OrderSearchDto();
      await service.searchOrders(searchDto);

      // Should log performance warning since 150ms > 100ms target
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
