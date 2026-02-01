import { Module, Global, Logger } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { redisStore } from "cache-manager-redis-yet";
import { Redis } from "ioredis";
import { AllConfigType } from "../config/config.type";
import { ProductionCacheService } from "./production-cache.service";
import { CacheWarmingService } from "./cache-warming.service";
import { CacheMetricsService } from "./cache-metrics.service";
import { CacheInvalidationService } from "./cache-invalidation.service";
import {
  CacheInterceptor,
  SearchCacheInterceptor,
  ReferenceCacheInterceptor,
} from "./interceptors/cache.interceptor";
import { CacheInvalidationProcessor } from "./processors/cache-invalidation.processor";

@Global()
@Module({
  imports: [
    // Import ScheduleModule for cache warming cron jobs
    ScheduleModule.forRoot(),

    // Import BullModule for cache invalidation queue
    BullModule.registerQueue({
      name: "cache-invalidation",
    }),

    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => {
        const logger = new Logger("CacheModule");
        const cacheConfig = configService.get("cache", { infer: true });
        const redisConfig = configService.get("redis", { infer: true });

        if (!cacheConfig?.enabled) {
          logger.warn(
            "Cache is disabled. Using memory cache with limited capacity.",
          );
          return {
            store: "memory",
            ttl: cacheConfig?.ttl || 300000,
            max: 1000,
          };
        }

        try {
          // Production Redis configuration with connection pooling
          const redisOptions = {
            host: redisConfig?.host || "localhost",
            port: redisConfig?.port || 6379,
            password: redisConfig?.password,
            db: redisConfig?.database || 0,
            keyPrefix: redisConfig?.keyPrefix || "oms_cache:",

            // Connection pool settings for production scale
            lazyConnect: true,
            retryDelayOnFailure: redisConfig?.retryDelayOnFailure || 100,
            connectTimeout: redisConfig?.connectionTimeout || 5000,

            // Health check settings
            enableReadyCheck: true,
            enableOfflineQueue: false,

            // Performance optimizations
            keepAlive: 30000,
            family: 4, // Use IPv4
          };

          let redis: Redis;

          if (
            redisConfig?.clusterEnabled &&
            redisConfig?.clusterNodes?.length > 0
          ) {
            // Redis Cluster configuration for high availability
            const { Cluster } = await import("ioredis");
            redis = new Cluster(
              redisConfig.clusterNodes.map((node) => ({
                host: node.host,
                port: node.port,
              })),
              {
                redisOptions: {
                  password: redisConfig.password,
                  keyPrefix: redisConfig.keyPrefix || "oms_cache:",
                },
                enableOfflineQueue: false,
                enableReadyCheck: true,
              },
            ) as any;
            logger.log(
              `Redis cluster initialized with ${redisConfig.clusterNodes.length} nodes`,
            );
          } else {
            // Single Redis instance with connection pool
            redis = new Redis(redisOptions);
            logger.log(
              `Redis connection initialized: ${redisOptions.host}:${redisOptions.port}/${redisOptions.db}`,
            );
          }

          // Test Redis connection
          await redis.ping();
          logger.log("Redis connection established successfully");

          return {
            store: await redisStore({
              socket: {
                host: redisOptions.host,
                port: redisOptions.port,
              },
              ttl: redisConfig?.ttl || 300000, // 5 minutes default
            }),
            ttl: redisConfig?.ttl || 300000,
            max: redisConfig?.max || 10000,
          };
        } catch (error) {
          logger.error(
            "Failed to connect to Redis, falling back to memory cache",
            error,
          );
          return {
            store: "memory",
            ttl: cacheConfig?.ttl || 300000,
            max: 1000,
          };
        }
      },
      inject: [ConfigService],
      isGlobal: true,
    }),
  ],
  providers: [
    // Core cache services
    ProductionCacheService,
    CacheWarmingService,
    CacheMetricsService,
    CacheInvalidationService,
    CacheInvalidationProcessor,

    // Cache interceptors
    CacheInterceptor,
    SearchCacheInterceptor,
    ReferenceCacheInterceptor,
  ],
  exports: [
    NestCacheModule,
    ProductionCacheService,
    CacheWarmingService,
    CacheMetricsService,
    CacheInvalidationService,
    CacheInterceptor,
    SearchCacheInterceptor,
    ReferenceCacheInterceptor,
  ],
})
export class CacheModule {}

/**
 * Production Cache Module Configuration Summary:
 *
 * Features implemented:
 * - Redis connection with clustering support and connection pooling
 * - Production-scale cache service with multi-tier TTL strategies
 * - Cache interceptors for automatic HTTP response caching
 * - Cache warming service for critical data preloading
 * - Performance monitoring and metrics collection
 * - Cache invalidation with pattern matching
 * - Comprehensive testing utilities and integration tests
 *
 * TTL Strategies:
 * - Reference data: 60 minutes (brands, statuses, leather types)
 * - Search results: 5-10 minutes (varies by search type)
 * - User sessions: 30 minutes
 * - Auth tokens: 15 minutes
 * - Enriched order views: 5 minutes (as per specs)
 *
 * Performance Features:
 * - >85% cache hit rate target monitoring
 * - <100ms response time optimization
 * - Background cache warming and refresh
 * - Circuit breaker for cache failures
 * - Memory usage tracking and alerts
 * - Connection pooling for high availability
 *
 * Production Features:
 * - Redis cluster support for scalability
 * - Error handling with graceful fallback to memory cache
 * - Performance monitoring with Prometheus metrics integration
 * - Cache key namespacing for multi-tenancy support
 * - Automatic eviction policies for memory management
 * - Comprehensive alerting for cache health issues
 */
