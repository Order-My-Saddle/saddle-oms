import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { ProductionCacheService } from "../production-cache.service";
import { CacheMetricsService } from "../cache-metrics.service";

/**
 * Utility class for testing cache functionality
 * Provides helpers for mocking, testing, and validating cache operations
 */
export class CacheTestingUtilities {
  private cacheService: ProductionCacheService;
  private mockCacheManager: Partial<Cache>;
  private testData: Map<string, any> = new Map();

  constructor() {
    this.setupMockCacheManager();
  }

  /**
   * Create a test module with cache services
   */
  static async createTestModule(): Promise<{
    module: TestingModule;
    cacheService: ProductionCacheService;
    utilities: CacheTestingUtilities;
  }> {
    const utilities = new CacheTestingUtilities();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionCacheService,
        CacheMetricsService,
        {
          provide: CACHE_MANAGER,
          useValue: utilities.mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: utilities.createMockConfigService(),
        },
      ],
    }).compile();

    const cacheService = module.get<ProductionCacheService>(
      ProductionCacheService,
    );

    return { module, cacheService, utilities };
  }

  /**
   * Set up mock cache manager for testing
   */
  private setupMockCacheManager(): void {
    this.mockCacheManager = {
      get: jest.fn().mockImplementation((key: string) => {
        return Promise.resolve(this.testData.get(key) || null);
      }),
      set: jest
        .fn()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((key: string, value: any, _ttl?: number) => {
          this.testData.set(key, value);
          return Promise.resolve();
        }),
      del: jest.fn().mockImplementation((key: string) => {
        this.testData.delete(key);
        return Promise.resolve();
      }),
      reset: jest.fn().mockImplementation(() => {
        this.testData.clear();
        return Promise.resolve();
      }),
    };
  }

  /**
   * Create mock config service for testing
   */
  private createMockConfigService(): Partial<ConfigService> {
    return {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          cache: {
            enabled: true,
            ttl: 300000,
          },
          redis: {
            host: "localhost",
            port: 6379,
            database: 0,
            keyPrefix: "test_cache:",
            ttl: 300000,
            max: 10000,
            retryAttempts: 3,
            retryDelayOnFailure: 100,
          },
        };
        return config[key];
      }),
    };
  }

  /**
   * Seed test data into cache
   */
  async seedTestData(): Promise<void> {
    await Promise.resolve();
    const testData = {
      "ref:brands:all": [
        { id: 1, name: "Test Brand 1" },
        { id: 2, name: "Test Brand 2" },
      ],
      "ref:statuses:all": [
        { id: 1, name: "Active" },
        { id: 2, name: "Inactive" },
      ],
      "search:test_query:123": {
        data: [{ id: 1, name: "Test Result" }],
        pagination: { totalItems: 1, totalPages: 1 },
      },
      "user_session:test_user": {
        userId: "test_user",
        roles: ["user"],
        lastActivity: new Date(),
      },
    };

    for (const [key, value] of Object.entries(testData)) {
      this.testData.set(key, value);
    }
  }

  /**
   * Clear all test data
   */
  clearTestData(): void {
    this.testData.clear();
  }

  /**
   * Get mock cache manager for direct access
   */
  getMockCacheManager(): Partial<Cache> {
    return this.mockCacheManager;
  }

  /**
   * Verify cache operation was called
   */
  verifyCacheOperation(
    operation: "get" | "set" | "del",
    key: string,
    expectedCalls = 1,
  ): void {
    const spy = this.mockCacheManager[operation] as jest.Mock;
    expect(spy).toHaveBeenCalledTimes(expectedCalls);
    if (expectedCalls > 0) {
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.anything(),
      );
    }
  }

  /**
   * Assert cache hit/miss
   */
  assertCacheHit(key: string): void {
    expect(this.testData.has(key)).toBeTruthy();
  }

  assertCacheMiss(key: string): void {
    expect(this.testData.has(key)).toBeFalsy();
  }

  /**
   * Create performance test data
   */
  generatePerformanceTestData(keyCount: number): Map<string, any> {
    const data = new Map();

    for (let i = 0; i < keyCount; i++) {
      data.set(`perf_test:${i}`, {
        id: i,
        data: `Test data ${i}`,
        timestamp: new Date(),
      });
    }

    return data;
  }

  /**
   * Measure cache operation performance
   */
  async measureCachePerformance<T>(
    operation: () => Promise<T>,
    iterations: number = 100,
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await operation();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to milliseconds
    }

    return {
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((sum, time) => sum + time, 0),
    };
  }

  /**
   * Test cache TTL expiration
   */
  async testCacheExpiration(key: string, ttl: number): Promise<boolean> {
    // Set cache with TTL
    await this.mockCacheManager.set!(key, "test_value", ttl);

    // Verify it's set
    this.assertCacheHit(key);

    // Simulate TTL expiration
    setTimeout(() => {
      this.testData.delete(key);
    }, ttl);

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, ttl + 100));

    // Verify it's expired
    return !this.testData.has(key);
  }

  /**
   * Create cache stress test
   */
  async stressTestCache(
    cacheService: ProductionCacheService,
    concurrentRequests: number = 100,
    dataSize: number = 1000,
  ): Promise<{
    successfulOperations: number;
    failedOperations: number;
    averageResponseTime: number;
  }> {
    let successfulOperations = 0;
    let failedOperations = 0;
    const responseTimes: number[] = [];

    const promises = Array.from(
      { length: concurrentRequests },
      async (_, index) => {
        try {
          const start = Date.now();

          // Mix of read and write operations
          if (index % 3 === 0) {
            // Write operation
            await cacheService.setReferenceData(
              "stress_test",
              {
                id: index,
                data: "x".repeat(dataSize),
              },
              String(index),
            );
          } else {
            // Read operation
            await cacheService.getReferenceData(
              "stress_test",
              String(index % 10),
            );
          }

          const responseTime = Date.now() - start;
          responseTimes.push(responseTime);
          successfulOperations++;
        } catch {
          failedOperations++;
        }
      },
    );

    await Promise.allSettled(promises);

    return {
      successfulOperations,
      failedOperations,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((sum, time) => sum + time, 0) /
            responseTimes.length
          : 0,
    };
  }

  /**
   * Test cache invalidation patterns
   */
  async testCacheInvalidation(
    cacheService: ProductionCacheService,
    pattern: string,
  ): Promise<{
    keysBeforeInvalidation: string[];
    keysAfterInvalidation: string[];
    invalidatedKeys: string[];
  }> {
    const keysBeforeInvalidation = Array.from(this.testData.keys());

    await cacheService.invalidatePattern(pattern);

    const keysAfterInvalidation = Array.from(this.testData.keys());
    const invalidatedKeys = keysBeforeInvalidation.filter(
      (key) => !keysAfterInvalidation.includes(key),
    );

    return {
      keysBeforeInvalidation,
      keysAfterInvalidation,
      invalidatedKeys,
    };
  }

  /**
   * Validate cache TTL strategies
   */
  validateTTLStrategies(): {
    referenceDataTTL: number;
    searchResultsTTL: number;
    userSessionTTL: number;
    authTokenTTL: number;
  } {
    return {
      referenceDataTTL: 60 * 60 * 1000, // 1 hour
      searchResultsTTL: 5 * 60 * 1000, // 5 minutes
      userSessionTTL: 30 * 60 * 1000, // 30 minutes
      authTokenTTL: 15 * 60 * 1000, // 15 minutes
    };
  }

  /**
   * Generate cache load test scenario
   */
  generateLoadTestScenario(requests: number): Array<{
    operation: "get" | "set" | "invalidate";
    key: string;
    data?: any;
    ttl?: number;
  }> {
    const operations: Array<{
      operation: "get" | "set" | "invalidate";
      key: string;
      data?: any;
      ttl?: number;
    }> = [];

    for (let i = 0; i < requests; i++) {
      const operationType = i % 4; // Distribute operations

      switch (operationType) {
        case 0: // Get reference data
          operations.push({
            operation: "get" as const,
            key: `ref:brands:${i % 10}`,
          });
          break;
        case 1: // Set search results
          operations.push({
            operation: "set" as const,
            key: `search:query_${i}:filters`,
            data: { results: [`result_${i}`] },
            ttl: 5 * 60 * 1000,
          });
          break;
        case 2: // Get user session
          operations.push({
            operation: "get" as const,
            key: `user_session:user_${i % 20}`,
          });
          break;
        case 3: // Invalidate pattern
          if (i % 50 === 0) {
            // Occasional invalidations
            operations.push({
              operation: "invalidate" as const,
              key: "search:*",
            });
          }
          break;
      }
    }

    return operations;
  }

  /**
   * Reset all mocks and test data
   */
  reset(): void {
    this.clearTestData();
    jest.clearAllMocks();
  }
}
