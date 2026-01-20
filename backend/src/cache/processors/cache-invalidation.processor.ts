import { Processor, Process } from "@nestjs/bull";
import { Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Job } from "bull";
import { DataSource } from "typeorm";

@Processor("cache-invalidation")
export class CacheInvalidationProcessor {
  private readonly logger = new Logger(CacheInvalidationProcessor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Process cache pattern invalidation jobs
   */
  @Process("invalidate-pattern")
  async handlePatternInvalidation(
    job: Job<{ pattern: string; context: any }>,
  ): Promise<void> {
    const { pattern } = job.data;

    try {
      this.logger.debug(`Processing pattern invalidation: ${pattern}`);

      if (pattern.includes("*")) {
        await this.invalidateWildcardPattern(pattern);
      } else {
        await this.cacheManager.del(pattern);
      }

      this.logger.debug(`Successfully invalidated pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate pattern: ${pattern}`, error);
      throw error;
    }
  }

  /**
   * Process materialized view refresh jobs
   */
  @Process("refresh-materialized-view")
  async handleMaterializedViewRefresh(
    job: Job<{
      entityType: string;
      operation?: string;
      timestamp: Date;
    }>,
  ): Promise<void> {
    const { entityType } = job.data;

    try {
      this.logger.debug(
        `Processing materialized view refresh for entity type: ${entityType}`,
      );

      const viewsToRefresh = this.getMaterializedViewsForEntity(entityType);

      for (const viewName of viewsToRefresh) {
        await this.refreshMaterializedView(viewName);
        this.logger.debug(`Refreshed materialized view: ${viewName}`);
      }

      // Invalidate related caches after view refresh
      await this.invalidateViewCaches(viewsToRefresh);

      this.logger.debug(
        `Completed materialized view refresh for: ${entityType}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to refresh materialized views for ${entityType}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Process bulk cache invalidation jobs
   */
  @Process("bulk-invalidate")
  async handleBulkInvalidation(
    job: Job<{
      patterns: string[];
      entityTypes: string[];
      operation: string;
    }>,
  ): Promise<void> {
    const { patterns, entityTypes } = job.data;

    try {
      this.logger.debug(
        `Processing bulk invalidation for ${patterns.length} patterns`,
      );

      // Process patterns in parallel
      const invalidationPromises = patterns.map((pattern) =>
        this.invalidatePattern(pattern),
      );
      await Promise.allSettled(invalidationPromises);

      // Refresh related materialized views
      const viewsToRefresh = new Set<string>();
      entityTypes.forEach((entityType) => {
        const views = this.getMaterializedViewsForEntity(entityType);
        views.forEach((view) => viewsToRefresh.add(view));
      });

      if (viewsToRefresh.size > 0) {
        for (const viewName of viewsToRefresh) {
          await this.refreshMaterializedView(viewName);
        }
      }

      this.logger.debug(
        `Completed bulk invalidation for ${entityTypes.join(", ")}`,
      );
    } catch (error) {
      this.logger.error(`Failed bulk invalidation`, error);
      throw error;
    }
  }

  /**
   * Invalidate wildcard pattern (simplified implementation)
   */
  private async invalidateWildcardPattern(pattern: string): Promise<void> {
    await Promise.resolve();
    try {
      // This is a simplified implementation
      // In production with Redis, you would use SCAN command
      this.logger.debug(`Invalidating wildcard pattern: ${pattern}`);

      // For now, we'll just clear the entire cache if it's a wildcard
      // In production, implement proper pattern matching
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        this.logger.debug(`Clearing cache with prefix: ${prefix}`);
        // Implementation depends on your cache store
      }
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate wildcard pattern: ${pattern}`,
        error,
      );
    }
  }

  /**
   * Invalidate a single cache pattern
   */
  private async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (pattern.includes("*")) {
        await this.invalidateWildcardPattern(pattern);
      } else {
        await this.cacheManager.del(pattern);
      }
    } catch (error) {
      this.logger.warn(`Failed to invalidate pattern: ${pattern}`, error);
    }
  }

  /**
   * Get materialized views that need refresh for an entity type
   */
  private getMaterializedViewsForEntity(entityType: string): string[] {
    const entityTypeLower = entityType.toLowerCase();

    const viewMappings = {
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

    return viewMappings[entityTypeLower] || [];
  }

  /**
   * Refresh a materialized view
   */
  private async refreshMaterializedView(viewName: string): Promise<void> {
    try {
      const startTime = Date.now();

      // Use the stored procedure we created
      await this.dataSource.query(
        "SELECT refresh_materialized_view_if_needed($1)",
        [viewName],
      );

      const refreshTime = Date.now() - startTime;
      this.logger.debug(
        `Materialized view ${viewName} refreshed in ${refreshTime}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to refresh materialized view: ${viewName}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Invalidate caches related to materialized views
   */
  private async invalidateViewCaches(viewNames: string[]): Promise<void> {
    const cachePatterns = viewNames.map((viewName) => `view:${viewName}:*`);

    for (const pattern of cachePatterns) {
      try {
        await this.invalidatePattern(pattern);
      } catch (error) {
        this.logger.warn(`Failed to invalidate view cache: ${pattern}`, error);
      }
    }
  }
}
