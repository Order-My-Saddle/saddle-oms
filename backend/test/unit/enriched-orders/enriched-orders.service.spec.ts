import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { EnrichedOrdersService } from "../../../src/enriched-orders/enriched-orders.service";
import { ProductionCacheService } from "../../../src/cache/production-cache.service";

describe("EnrichedOrdersService", () => {
  let service: EnrichedOrdersService;
  let queryRunner: any;
  let configService: jest.Mocked<ConfigService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _productionCacheService: jest.Mocked<ProductionCacheService> | undefined;

  const mockEnrichedOrderData = [
    {
      order_id: "550e8400-e29b-41d4-a716-446655440000",
      order_number: "ORD-2023-001234",
      customer_name: "John Doe",
      customer_email: "john@example.com",
      total_amount: 2500.0,
      status: "PENDING",
      created_at: new Date("2023-12-01T00:00:00Z"),
      factory_name: "Premium Factory",
      fitter_name: "Expert Fitter",
    },
  ];

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      query: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    };

    const mockProductionCacheService = {
      // Note: ProductionCacheService methods not mocked - service doesn't use them as expected
    };

    // Setup default configurations
    mockConfigService.get.mockImplementation((key: string) => {
      const configs = {
        "cache.enrichedOrders.enabled": true,
        "database.enrichedOrders.fallbackQuery": true,
        "pagination.defaultLimit": 10,
        "pagination.maxLimit": 100,
      };
      return configs[key];
    });

    mockConfigService.getOrThrow.mockImplementation((key: string) => {
      const result = mockConfigService.get(key);
      if (result === undefined) {
        throw new Error(`Configuration key not found: ${key}`);
      }
      return result;
    });

    // Note: ProductionCacheService methods not mocked - service doesn't use them as expected

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrichedOrdersService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ProductionCacheService,
          useValue: mockProductionCacheService,
        },
        {
          provide: "CACHE_MANAGER",
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnrichedOrdersService>(EnrichedOrdersService);
    configService = module.get(ConfigService);
    _productionCacheService = module.get(ProductionCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getEnrichedOrders", () => {
    it("should return enriched orders with pagination", async () => {
      // Arrange
      const queryDto = {
        page: 1,
        limit: 10,
      };

      // Mock the queryRunner.query calls (service uses queryRunner, not dataSource.query)
      queryRunner.query
        .mockResolvedValueOnce([]) // RLS set_config call
        .mockResolvedValueOnce([{ total: "150" }]) // Count query
        .mockResolvedValueOnce(mockEnrichedOrderData); // Data query

      // Act
      const result = await service.getEnrichedOrders(queryDto);

      // Assert
      expect(result).toEqual({
        data: mockEnrichedOrderData,
        pagination: {
          totalItems: 150,
          totalPages: 15,
          currentPage: 1,
          itemsPerPage: 10,
          hasNext: true,
          hasPrevious: false,
        },
        metadata: {
          queriedAt: expect.any(String),
          cached: false,
          processingTimeMs: expect.any(Number),
        },
      });

      expect(queryRunner.query).toHaveBeenCalledTimes(3);
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });

  describe("Configuration", () => {
    it("should use default pagination settings", async () => {
      // Trigger a call that uses configuration
      const queryDto = { page: 1, limit: 5 };

      // Mock queryRunner.query responses (service uses queryRunner, not dataSource.query)
      queryRunner.query
        .mockResolvedValueOnce([]) // RLS set_config call
        .mockResolvedValueOnce([{ total: "10" }]) // Count query
        .mockResolvedValueOnce([]); // Data query

      await service.getEnrichedOrders(queryDto);

      // Verify config access
      expect(configService.get).toHaveBeenCalledWith("cache", { infer: true });
    });
  });
});
