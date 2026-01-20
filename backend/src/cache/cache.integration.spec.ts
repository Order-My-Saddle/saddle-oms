import { TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ProductionCacheService } from "./production-cache.service";
import { CacheWarmingService } from "./cache-warming.service";
import { CacheMetricsService } from "./cache-metrics.service";
import { CacheTestingUtilities } from "./testing/cache-testing.utilities";

describe("Cache Integration Tests", () => {
  let cacheService: ProductionCacheService;
  let warmingService: CacheWarmingService;
  let metricsService: CacheMetricsService;
  let testUtilities: CacheTestingUtilities;
  let module: TestingModule;

  beforeAll(async () => {
    const testModule = await CacheTestingUtilities.createTestModule();
    module = testModule.module;
    cacheService = testModule.cacheService;
    testUtilities = testModule.utilities;

    // Create additional services for integration testing
    warmingService = new CacheWarmingService(
      cacheService,
      null as any, // Mock DataSource
      module.get(ConfigService),
    );

    metricsService = new CacheMetricsService(
      cacheService,
      module.get(ConfigService),
    );

    await testUtilities.seedTestData();
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    testUtilities.reset();
  });

  describe("Production Cache Service Integration", () => {
    it("should handle reference data caching with correct TTL", async () => {
      const testData = [
        { id: 1, name: "Brand 1" },
        { id: 2, name: "Brand 2" },
      ];

      // Set reference data
      await cacheService.setReferenceData("BRANDS", testData);

      // Verify it's cached
      const cached = await cacheService.getReferenceData("BRANDS");
      expect(cached).toEqual(testData);

      // Verify cache operation was called with correct TTL
      testUtilities.verifyCacheOperation("set", "ref:brands:all");
    });

    it("should handle search result caching", async () => {
      const searchQuery = "test search";
      const filters = { page: 1, limit: 10 };
      const searchResults = {
        data: [{ id: 1, name: "Search Result 1" }],
        pagination: { totalItems: 1, totalPages: 1 },
      };

      // Set search results
      await cacheService.setSearchResults(
        searchQuery,
        filters,
        searchResults,
        "ORDER",
      );

      // Get search results
      const cached = await cacheService.getSearchResults(searchQuery, filters);
      expect(cached).toEqual(searchResults);
    });

    it("should handle user session caching", async () => {
      const userId = "test_user_123";
      const sessionData = {
        userId,
        roles: ["user", "customer"],
        lastActivity: new Date(),
      };

      // Set user session
      await cacheService.setUserSession(userId, sessionData);

      // Get user session
      const cached = await cacheService.getUserSession(userId);
      expect(cached).toEqual(sessionData);
    });

    it("should handle auth token caching", async () => {
      const tokenId = "test_token_123";
      const tokenData = {
        userId: "user_123",
        roles: ["user"],
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };

      // Set auth token
      await cacheService.setAuthToken(tokenId, tokenData);

      // Get auth token
      const cached = await cacheService.getAuthToken(tokenId);
      expect(cached).toEqual(tokenData);
    });

    it("should handle cache invalidation by pattern", async () => {
      // Set up test data with different patterns
      await cacheService.setInCache("order:123", { id: 123 });
      await cacheService.setInCache("order:456", { id: 456 });
      await cacheService.setInCache("customer:789", { id: 789 });

      // Invalidate order pattern
      await cacheService.invalidatePattern("order:*");

      // Verify order caches are invalidated
      const order123 = await cacheService.getFromCache("order:123");
      const order456 = await cacheService.getFromCache("order:456");
      const customer789 = await cacheService.getFromCache("customer:789");

      expect(order123).toBeNull();
      expect(order456).toBeNull();
      expect(customer789).not.toBeNull(); // Should still exist
    });

    it("should provide accurate cache statistics", async () => {
      // Perform some cache operations
      await cacheService.getReferenceData("BRANDS"); // Hit
      await cacheService.getReferenceData("NON_EXISTENT"); // Miss
      await cacheService.getReferenceData("BRANDS"); // Hit

      const stats = await cacheService.getCacheStats();

      expect(stats).toMatchObject({
        hitRate: expect.any(Number),
        totalHits: expect.any(Number),
        totalMisses: expect.any(Number),
        totalOperations: expect.any(Number),
        uptime: expect.any(Number),
      });

      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.totalOperations).toBe(stats.totalHits + stats.totalMisses);
    });
  });

  describe("Cache Performance Tests", () => {
    it("should handle concurrent cache operations", async () => {
      const concurrentRequests = 50;
      const dataSize = 100;

      const stressTestResults = await testUtilities.stressTestCache(
        cacheService,
        concurrentRequests,
        dataSize,
      );

      expect(stressTestResults.successfulOperations).toBeGreaterThan(0);
      expect(stressTestResults.failedOperations).toBe(0);
      expect(stressTestResults.averageResponseTime).toBeLessThan(100); // < 100ms
    });

    it("should maintain performance under load", async () => {
      const performanceData = testUtilities.generatePerformanceTestData(1000);

      // Load test data into cache
      const promises = Array.from(performanceData.entries()).map(
        ([key, value]) => cacheService.setInCache(key, value),
      );

      await Promise.all(promises);

      // Test read performance
      const readPerformance = await testUtilities.measureCachePerformance(
        async () => {
          const randomKey = `perf_test:${Math.floor(Math.random() * 1000)}`;
          await cacheService.getFromCache(randomKey);
        },
        100,
      );

      expect(readPerformance.averageTime).toBeLessThan(10); // < 10ms average
    });

    it("should handle cache warming efficiently", async () => {
      const startTime = Date.now();

      // Mock the data loading methods
      jest.spyOn(warmingService as any, "loadBrands").mockResolvedValue([
        { id: 1, name: "Brand 1" },
        { id: 2, name: "Brand 2" },
      ]);

      jest.spyOn(warmingService as any, "loadStatuses").mockResolvedValue([
        { id: 1, name: "Active" },
        { id: 2, name: "Inactive" },
      ]);

      await warmingService.warmupCriticalData();

      const duration = Date.now() - startTime;

      // Warmup should complete within reasonable time
      expect(duration).toBeLessThan(5000); // < 5 seconds

      // Verify critical data is cached
      const brands = await cacheService.getReferenceData("BRANDS");
      expect(brands).toBeDefined();
    });
  });

  describe("Cache Metrics Integration", () => {
    it("should track cache hit/miss rates accurately", async () => {
      await Promise.resolve();
      // Record some cache operations
      metricsService.recordCacheOperation("/api/brands", true, 10);
      metricsService.recordCacheOperation("/api/brands", true, 15);
      metricsService.recordCacheOperation("/api/brands", false, 50);

      const endpointMetrics = metricsService.getEndpointMetrics();
      const brandsMetrics = endpointMetrics.find(
        (m) => m.endpoint === "/api/brands",
      );

      expect(brandsMetrics).toBeDefined();
      expect(brandsMetrics!.hitRate).toBeCloseTo(66.67, 1); // 2/3 hits
      expect(brandsMetrics!.totalRequests).toBe(3);
    });

    it("should generate performance reports", async () => {
      const report = await metricsService.generatePerformanceReport();

      expect(report).toMatchObject({
        summary: expect.any(Object),
        topEndpoints: expect.any(Array),
        recommendations: expect.any(Array),
      });

      expect(report.summary).toHaveProperty("hitRate");
      expect(report.summary).toHaveProperty("totalOperations");
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should detect cache health issues", async () => {
      const health = await metricsService.getCacheHealth();

      expect(["healthy", "degraded", "unhealthy"]).toContain(health);
    });
  });

  describe("Cache TTL Strategy Tests", () => {
    it("should apply correct TTL for different data types", () => {
      const ttlStrategies = testUtilities.validateTTLStrategies();

      expect(ttlStrategies.referenceDataTTL).toBe(60 * 60 * 1000); // 1 hour
      expect(ttlStrategies.searchResultsTTL).toBe(5 * 60 * 1000); // 5 minutes
      expect(ttlStrategies.userSessionTTL).toBe(30 * 60 * 1000); // 30 minutes
      expect(ttlStrategies.authTokenTTL).toBe(15 * 60 * 1000); // 15 minutes
    });

    it("should handle cache expiration correctly", async () => {
      const testKey = "expiration_test";
      const shortTTL = 100; // 100ms

      const expired = await testUtilities.testCacheExpiration(
        testKey,
        shortTTL,
      );
      expect(expired).toBe(true);
    });
  });

  describe("Cache Error Handling", () => {
    it("should handle Redis connection failures gracefully", async () => {
      // Mock Redis failure
      const mockCacheManager = testUtilities.getMockCacheManager();
      (mockCacheManager.get as jest.Mock).mockRejectedValueOnce(
        new Error("Redis connection failed"),
      );

      // Should not throw, should return null
      const result = await cacheService.getFromCache("test_key");
      expect(result).toBeNull();
    });

    it("should continue operating when cache set fails", async () => {
      // Mock Redis failure
      const mockCacheManager = testUtilities.getMockCacheManager();
      (mockCacheManager.set as jest.Mock).mockRejectedValueOnce(
        new Error("Redis connection failed"),
      );

      // Should not throw
      await expect(
        cacheService.setInCache("test_key", "test_value"),
      ).resolves.not.toThrow();
    });

    it("should handle invalidation failures gracefully", async () => {
      // Mock Redis failure
      const mockCacheManager = testUtilities.getMockCacheManager();
      (mockCacheManager.del as jest.Mock).mockRejectedValueOnce(
        new Error("Redis connection failed"),
      );

      // Should not throw
      await expect(
        cacheService.invalidatePattern("test:*"),
      ).resolves.not.toThrow();
    });
  });

  describe("Load Testing", () => {
    it("should handle high-volume cache operations", async () => {
      const loadTestScenario = testUtilities.generateLoadTestScenario(1000);

      const startTime = Date.now();
      const promises = loadTestScenario.map(async (operation) => {
        switch (operation.operation) {
          case "get":
            return cacheService.getFromCache(operation.key);
          case "set":
            return cacheService.setInCache(
              operation.key,
              operation.data,
              operation.ttl,
            );
          case "invalidate":
            return cacheService.invalidatePattern(operation.key);
        }
      });

      const results = await Promise.allSettled(promises);
      const duration = Date.now() - startTime;

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      expect(successful).toBeGreaterThan(950); // > 95% success rate
      expect(failed).toBeLessThan(50); // < 5% failure rate
      expect(duration).toBeLessThan(10000); // < 10 seconds for 1000 operations
    });

    it("should maintain cache hit rate targets under load", async () => {
      // Simulate production load
      for (let i = 0; i < 100; i++) {
        const endpoint = `/api/test/${i % 10}`;
        const isHit = Math.random() > 0.15; // 85% hit rate
        const responseTime = Math.random() * 20; // 0-20ms

        metricsService.recordCacheOperation(endpoint, isHit, responseTime);
      }

      const metrics = await metricsService.getCacheMetrics();
      expect(metrics.hitRate).toBeGreaterThan(80); // > 80% hit rate
    });
  });
});

describe("Cache Integration with Real Redis (E2E)", () => {
  // Note: These tests would run against a real Redis instance
  // They are currently skipped but show how integration tests would work

  it.skip("should connect to real Redis instance", async () => {
    // This test would verify actual Redis connectivity
    // Implementation depends on test environment setup
  });

  it.skip("should handle Redis cluster failover", async () => {
    // This test would verify cluster failover scenarios
    // Implementation depends on Redis cluster setup
  });

  it.skip("should maintain data consistency across cache operations", async () => {
    // This test would verify data consistency in production scenarios
    // Implementation depends on actual data sources
  });
});
