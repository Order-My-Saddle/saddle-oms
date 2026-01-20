import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

export interface CacheInvalidationContext {
  entityType: string;
  entityId?: string;
  operation: "create" | "update" | "delete";
  userId?: string;
  relatedEntities?: Array<{ type: string; id: string }>;
}

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue("cache-invalidation")
    private readonly invalidationQueue: Queue,
  ) {}

  /**
   * Invalidate caches for a specific entity with intelligent pattern matching
   */
  async invalidateEntityCaches(
    context: CacheInvalidationContext,
  ): Promise<void> {
    const {
      entityType,
      entityId,
      operation,
      userId,
      relatedEntities = [],
    } = context;

    this.logger.debug(
      `Invalidating caches for ${entityType}:${entityId} (${operation})`,
    );

    try {
      // Get invalidation patterns for the entity
      const patterns = this.getCachePatterns(entityType, entityId, operation);

      // Immediate invalidation for critical caches
      await this.invalidateImmediate(patterns.immediate);

      // Queue-based invalidation for related caches (non-blocking)
      await this.queueInvalidation(patterns.related, {
        entityType,
        entityId,
        operation,
        userId,
      });

      // Invalidate related entity caches
      for (const relatedEntity of relatedEntities) {
        await this.invalidateRelatedEntity(relatedEntity, operation);
      }

      // Schedule materialized view refresh if needed
      if (this.shouldRefreshMaterializedView(entityType, operation)) {
        await this.scheduleMaterializedViewRefresh(entityType, operation);
      }

      this.logger.debug(
        `Cache invalidation completed for ${entityType}:${entityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate caches for ${entityType}:${entityId}`,
        error,
      );
      // Don't throw - cache invalidation failure shouldn't break the main operation
    }
  }

  /**
   * Bulk invalidate caches for multiple entities (used by bulk operations)
   */
  async invalidateMultipleEntityCaches(
    contexts: CacheInvalidationContext[],
  ): Promise<void> {
    const startTime = Date.now();

    // Group contexts by entity type for batched processing
    const groupedContexts = this.groupContextsByEntityType(contexts);

    const promises: Promise<void>[] = [];

    for (const [entityType, entityContexts] of groupedContexts.entries()) {
      // Process each entity type in parallel
      promises.push(this.invalidateEntityTypeGroup(entityType, entityContexts));
    }

    await Promise.allSettled(promises);

    const processingTime = Date.now() - startTime;
    this.logger.debug(
      `Bulk cache invalidation completed for ${contexts.length} entities in ${processingTime}ms`,
    );
  }

  /**
   * Get cache patterns for entity type and operation
   */
  private getCachePatterns(
    entityType: string,
    entityId?: string,
    operation?: string,
  ): { immediate: string[]; related: string[] } {
    const baseKey = entityId ? `${entityType}:${entityId}` : `${entityType}:*`;
    const entityTypeLower = entityType.toLowerCase();

    const patterns = {
      immediate: [
        baseKey,
        `${entityTypeLower}:*`,
        `query:${entityType}:*`,
        `list:${entityType}:*`,
      ],
      related: [] as string[],
    };

    // Entity-specific cache patterns
    switch (entityTypeLower) {
      case "order":
        patterns.immediate.push(
          `customer:${entityId}:orders`,
          `order:analytics:*`,
          `dashboard:orders:*`,
        );
        patterns.related.push(
          `customer_ltv_view:*`,
          `order_analytics_view:*`,
          `fitter_performance_view:*`,
          `supplier_performance_view:*`,
          `analytics:*`,
          `dashboard:*`,
          `reports:*`,
        );
        break;

      case "customer":
        patterns.immediate.push(
          `customer:orders:*`,
          `fitter:${entityId}:customers`,
        );
        patterns.related.push(
          `customer_ltv_view:*`,
          `fitter_performance_view:*`,
          `order:*`,
        );
        break;

      case "product":
        patterns.immediate.push(
          `product:catalog:*`,
          `brand:${entityId}:products`,
        );
        patterns.related.push(
          `product_performance_view:*`,
          `inventory:*`,
          `catalog:*`,
        );
        break;

      case "user":
      case "fitter":
      case "supplier":
        patterns.immediate.push(
          `auth:user:${entityId}`,
          `session:${entityId}:*`,
          `permissions:${entityId}:*`,
        );
        patterns.related.push(
          `fitter_performance_view:*`,
          `supplier_performance_view:*`,
          `user:list:*`,
        );
        break;

      default:
        // Generic patterns for other entities
        patterns.related.push(`${entityTypeLower}:list:*`);
    }

    // Operation-specific patterns
    if (operation === "delete") {
      patterns.immediate.push(`deleted:${entityType}:*`);
    }

    return patterns;
  }

  /**
   * Immediate cache invalidation (synchronous)
   */
  private async invalidateImmediate(patterns: string[]): Promise<void> {
    const promises = patterns.map((pattern) => this.invalidatePattern(pattern));
    await Promise.allSettled(promises);
  }

  /**
   * Queue-based cache invalidation (asynchronous)
   */
  private async queueInvalidation(
    patterns: string[],
    context: {
      entityType: string;
      entityId?: string;
      operation: string;
      userId?: string;
    },
  ): Promise<void> {
    for (const pattern of patterns) {
      await this.invalidationQueue.add(
        "invalidate-pattern",
        { pattern, context },
        {
          delay: 100, // Small delay to batch related invalidations
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
        },
      );
    }
  }

  /**
   * Invalidate caches for related entities
   */
  private async invalidateRelatedEntity(
    relatedEntity: { type: string; id: string },
    operation: string,
  ): Promise<void> {
    const relatedPatterns = this.getCachePatterns(
      relatedEntity.type,
      relatedEntity.id,
      operation,
    );
    await this.invalidateImmediate(relatedPatterns.immediate);
  }

  /**
   * Check if materialized view should be refreshed
   */
  private shouldRefreshMaterializedView(
    entityType: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _operation?: string,
  ): boolean {
    const entityTypeLower = entityType.toLowerCase();

    // Views that need refresh based on entity changes
    const viewTriggers = {
      order: [
        "order_analytics_view",
        "customer_ltv_view",
        "fitter_performance_view",
        "supplier_performance_view",
      ],
      customer: ["customer_ltv_view", "fitter_performance_view"],
      product: ["product_performance_view"],
      orderline: ["order_analytics_view", "product_performance_view"],
      fitter: ["fitter_performance_view"],
      supplier: ["supplier_performance_view"],
    };

    return !!viewTriggers[entityTypeLower];
  }

  /**
   * Schedule materialized view refresh
   */
  private async scheduleMaterializedViewRefresh(
    entityType: string,
    operation?: string,
  ): Promise<void> {
    const priority = this.getRefreshPriority(entityType, operation);
    const delay = this.getRefreshDelay(entityType);

    await this.invalidationQueue.add(
      "refresh-materialized-view",
      {
        entityType,
        operation,
        timestamp: new Date(),
      },
      {
        delay,
        priority,
        attempts: 2,
        backoff: {
          type: "fixed",
          delay: 5000,
        },
      },
    );
  }

  /**
   * Get refresh priority based on entity type and operation
   */
  private getRefreshPriority(entityType: string, operation?: string): number {
    // Higher number = higher priority
    const basePriorities = {
      order: 10,
      customer: 8,
      product: 6,
      orderline: 9,
      fitter: 5,
      supplier: 5,
    };

    const operationBoost = {
      create: 2,
      update: 1,
      delete: 3,
    };

    const base = basePriorities[entityType.toLowerCase()] || 1;
    const boost = operation ? operationBoost[operation] || 0 : 0;

    return base + boost;
  }

  /**
   * Get refresh delay based on entity type
   */
  private getRefreshDelay(entityType: string): number {
    // Critical entities refresh faster
    const delays = {
      order: 30000, // 30 seconds
      customer: 60000, // 1 minute
      product: 120000, // 2 minutes
      orderline: 30000, // 30 seconds
      fitter: 300000, // 5 minutes
      supplier: 300000, // 5 minutes
    };

    return delays[entityType.toLowerCase()] || 300000; // 5 minutes default
  }

  /**
   * Group contexts by entity type for batched processing
   */
  private groupContextsByEntityType(
    contexts: CacheInvalidationContext[],
  ): Map<string, CacheInvalidationContext[]> {
    const grouped = new Map<string, CacheInvalidationContext[]>();

    for (const context of contexts) {
      const entityType = context.entityType;
      if (!grouped.has(entityType)) {
        grouped.set(entityType, []);
      }
      grouped.get(entityType)!.push(context);
    }

    return grouped;
  }

  /**
   * Process invalidation for a group of entities of the same type
   */
  private async invalidateEntityTypeGroup(
    entityType: string,
    contexts: CacheInvalidationContext[],
  ): Promise<void> {
    try {
      // Collect all patterns for this entity type
      const allPatterns = new Set<string>();
      const relatedPatterns = new Set<string>();

      for (const context of contexts) {
        const patterns = this.getCachePatterns(
          context.entityType,
          context.entityId,
          context.operation,
        );
        patterns.immediate.forEach((p) => allPatterns.add(p));
        patterns.related.forEach((p) => relatedPatterns.add(p));
      }

      // Invalidate immediate patterns
      await this.invalidateImmediate(Array.from(allPatterns));

      // Queue related patterns
      await this.queueInvalidation(Array.from(relatedPatterns), {
        entityType,
        operation: "bulk",
        userId: contexts[0]?.userId,
      });

      // Schedule single materialized view refresh for the entity type
      if (this.shouldRefreshMaterializedView(entityType)) {
        await this.scheduleMaterializedViewRefresh(entityType, "bulk");
      }
    } catch (error) {
      this.logger.error(
        `Failed to invalidate caches for entity type ${entityType}`,
        error,
      );
    }
  }

  /**
   * Invalidate a specific cache pattern
   */
  private async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (pattern.includes("*")) {
        // For wildcard patterns, we need to get all keys and delete them
        // This is simplified - in production, you might use Redis SCAN
        this.logger.debug(`Invalidating pattern: ${pattern}`);
        // Note: cache-manager doesn't support pattern deletion natively
        // You might need to implement this based on your cache store
      } else {
        await this.cacheManager.del(pattern);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate pattern: ${pattern}`, error);
    }
  }

  /**
   * Clear all caches (admin function)
   */
  async clearAllCaches(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log("All caches cleared");
    } catch (error) {
      this.logger.error("Failed to clear all caches", error);
      throw error;
    }
  }

  /**
   * Get cache invalidation statistics with queue status monitoring
   */
  async getCacheStats(): Promise<{
    queueLength: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
  }> {
    const waiting = await this.invalidationQueue.getWaiting();
    const active = await this.invalidationQueue.getActive();
    const completed = await this.invalidationQueue.getCompleted();
    const failed = await this.invalidationQueue.getFailed();

    return {
      queueLength: waiting.length,
      processingJobs: active.length,
      completedJobs: completed.length,
      failedJobs: failed.length,
    };
  }
}
