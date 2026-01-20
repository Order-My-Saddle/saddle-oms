import { Injectable } from "@nestjs/common";
import { register, Counter, Histogram, Gauge } from "prom-client";

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly databaseConnectionsActive: Gauge<string>;
  private readonly migrationProgress: Gauge<string>;

  // Advanced query and performance metrics for Phase 2
  private readonly queryDuration: Histogram<string>;
  private readonly queryComplexity: Histogram<string>;
  private readonly cacheOperations: Counter<string>;
  private readonly cacheHitRate: Gauge<string>;
  private readonly materializedViewRefresh: Counter<string>;
  private readonly materializedViewRefreshDuration: Histogram<string>;
  private readonly databaseQueryDuration: Histogram<string>;
  private readonly databaseSlowQueries: Counter<string>;
  private readonly entityValidationErrors: Counter<string>;
  private readonly bulkOperationsSize: Histogram<string>;

  constructor() {
    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
    });

    this.httpRequestDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route"],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // Database Metrics
    this.databaseConnectionsActive = new Gauge({
      name: "database_connections_active",
      help: "Number of active database connections",
      labelNames: ["database"],
    });

    // Migration Metrics
    this.migrationProgress = new Gauge({
      name: "migration_progress_percentage",
      help: "Migration progress as percentage",
      labelNames: ["phase"],
    });

    // Phase 2: Query Metrics
    this.queryDuration = new Histogram({
      name: "query_duration_seconds",
      help: "Query execution duration in seconds",
      labelNames: ["entity_type", "has_filters", "has_sorting", "cache_hit"],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    });

    this.queryComplexity = new Histogram({
      name: "query_complexity_score",
      help: "Query complexity score based on filters and joins",
      labelNames: ["entity_type"],
      buckets: [1, 2, 5, 10, 20, 50, 100],
    });

    // Phase 2: Cache Metrics
    this.cacheOperations = new Counter({
      name: "cache_operations_total",
      help: "Total number of cache operations",
      labelNames: ["operation", "result", "entity_type"],
    });

    this.cacheHitRate = new Gauge({
      name: "cache_hit_rate",
      help: "Cache hit rate percentage by entity type",
      labelNames: ["entity_type", "cache_type"],
    });

    // Phase 2: Materialized View Metrics
    this.materializedViewRefresh = new Counter({
      name: "materialized_view_refresh_total",
      help: "Total number of materialized view refreshes",
      labelNames: ["view_name", "trigger_type", "status"],
    });

    this.materializedViewRefreshDuration = new Histogram({
      name: "materialized_view_refresh_duration_seconds",
      help: "Materialized view refresh duration in seconds",
      labelNames: ["view_name"],
      buckets: [1, 5, 10, 30, 60, 120, 300, 600],
    });

    // Phase 2: Database Performance Metrics
    this.databaseQueryDuration = new Histogram({
      name: "database_query_duration_seconds",
      help: "Database query execution duration in seconds",
      labelNames: ["query_type", "entity_type", "operation"],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10],
    });

    this.databaseSlowQueries = new Counter({
      name: "database_slow_queries_total",
      help: "Total number of slow database queries (>1s)",
      labelNames: ["query_type", "entity_type", "duration_range"],
    });

    // Phase 2: Entity Validation Metrics
    this.entityValidationErrors = new Counter({
      name: "entity_validation_errors_total",
      help: "Total number of entity validation errors",
      labelNames: ["entity_type", "error_type", "field"],
    });

    // Phase 2: Bulk Operations Metrics
    this.bulkOperationsSize = new Histogram({
      name: "bulk_operations_size",
      help: "Size of bulk operations (number of entities)",
      labelNames: ["operation_type", "entity_type"],
      buckets: [1, 10, 50, 100, 500, 1000, 5000, 10000],
    });

    // Register all metrics
    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.databaseConnectionsActive);
    register.registerMetric(this.migrationProgress);

    // Register Phase 2 metrics
    register.registerMetric(this.queryDuration);
    register.registerMetric(this.queryComplexity);
    register.registerMetric(this.cacheOperations);
    register.registerMetric(this.cacheHitRate);
    register.registerMetric(this.materializedViewRefresh);
    register.registerMetric(this.materializedViewRefreshDuration);
    register.registerMetric(this.databaseQueryDuration);
    register.registerMetric(this.databaseSlowQueries);
    register.registerMetric(this.entityValidationErrors);
    register.registerMetric(this.bulkOperationsSize);
  }

  incrementHttpRequests(
    method: string,
    route: string,
    statusCode: number,
  ): void {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  observeHttpDuration(method: string, route: string, duration: number): void {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setDatabaseConnections(database: string, count: number): void {
    this.databaseConnectionsActive.set({ database }, count);
  }

  setMigrationProgress(phase: string, percentage: number): void {
    this.migrationProgress.set({ phase }, percentage);
  }

  // Phase 2: Bulk Operations Metrics (replacing SaveBundle)

  // Phase 2: Query Metrics
  observeQueryDuration(
    entityType: string,
    duration: number,
    hasFilters: boolean,
    hasSorting: boolean,
    cacheHit: boolean,
  ): void {
    this.queryDuration.observe(
      {
        entity_type: entityType,
        has_filters: hasFilters.toString(),
        has_sorting: hasSorting.toString(),
        cache_hit: cacheHit.toString(),
      },
      duration,
    );
  }

  observeQueryComplexity(entityType: string, complexityScore: number): void {
    this.queryComplexity.observe({ entity_type: entityType }, complexityScore);
  }

  // Phase 2: Cache Metrics
  incrementCacheOperations(
    operation: string,
    result: string,
    entityType?: string,
  ): void {
    this.cacheOperations.inc({
      operation,
      result,
      entity_type: entityType || "unknown",
    });
  }

  setCacheHitRate(
    entityType: string,
    cacheType: string,
    hitRate: number,
  ): void {
    this.cacheHitRate.set(
      { entity_type: entityType, cache_type: cacheType },
      hitRate,
    );
  }

  // Phase 2: Materialized View Metrics
  incrementMaterializedViewRefresh(
    viewName: string,
    triggerType: string,
    status: string,
  ): void {
    this.materializedViewRefresh.inc({
      view_name: viewName,
      trigger_type: triggerType,
      status,
    });
  }

  observeMaterializedViewRefreshDuration(
    viewName: string,
    duration: number,
  ): void {
    this.materializedViewRefreshDuration.observe(
      { view_name: viewName },
      duration,
    );
  }

  // Phase 2: Database Performance Metrics
  observeDatabaseQueryDuration(
    queryType: string,
    entityType: string,
    operation: string,
    duration: number,
  ): void {
    this.databaseQueryDuration.observe(
      { query_type: queryType, entity_type: entityType, operation },
      duration,
    );

    // Track slow queries (>1 second)
    if (duration > 1) {
      const durationRange = this.getDurationRange(duration);
      this.databaseSlowQueries.inc({
        query_type: queryType,
        entity_type: entityType,
        duration_range: durationRange,
      });
    }
  }

  // Phase 2: Entity Validation Metrics
  incrementEntityValidationErrors(
    entityType: string,
    errorType: string,
    field?: string,
  ): void {
    this.entityValidationErrors.inc({
      entity_type: entityType,
      error_type: errorType,
      field: field || "unknown",
    });
  }

  // Phase 2: Bulk Operations Metrics
  observeBulkOperationSize(
    operationType: string,
    entityType: string,
    size: number,
  ): void {
    this.bulkOperationsSize.observe(
      { operation_type: operationType, entity_type: entityType },
      size,
    );
  }

  // Helper methods
  private getEntityCountRange(count: number): string {
    if (count <= 1) return "1";
    if (count <= 10) return "2-10";
    if (count <= 50) return "11-50";
    if (count <= 100) return "51-100";
    if (count <= 500) return "101-500";
    return "500+";
  }

  private getDurationRange(duration: number): string {
    if (duration <= 2) return "1-2s";
    if (duration <= 5) return "2-5s";
    if (duration <= 10) return "5-10s";
    if (duration <= 30) return "10-30s";
    return "30s+";
  }

  // Performance monitoring methods
  async recordBulkOperationMetrics(
    operationType: string,
    entityType: string,
    entityCount: number,
    duration: number,
    success: boolean,
  ): Promise<void> {
    await Promise.resolve();
    const _status = success ? "success" : "failed";
    void _status;
    this.observeBulkOperationSize(operationType, entityType, entityCount);
    this.observeDatabaseQueryDuration(
      "bulk",
      entityType,
      operationType,
      duration,
    );
  }

  async recordQueryPerformance(
    entityType: string,
    queryDuration: number,
    hasFilters: boolean,
    hasSorting: boolean,
    cacheHit: boolean,
    complexityScore: number,
  ): Promise<void> {
    await Promise.resolve();
    this.observeQueryDuration(
      entityType,
      queryDuration,
      hasFilters,
      hasSorting,
      cacheHit,
    );
    this.observeQueryComplexity(entityType, complexityScore);

    // Record database query metrics
    this.observeDatabaseQueryDuration(
      "query",
      entityType,
      "select",
      queryDuration,
    );
  }

  async recordCacheMetrics(
    operation: "get" | "set" | "delete",
    hit: boolean,
    entityType: string,
  ): Promise<void> {
    await Promise.resolve();
    const result = hit ? "hit" : "miss";
    this.incrementCacheOperations(operation, result, entityType);
  }

  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  async updateMetrics(): Promise<void> {
    await Promise.resolve();
    // This method would be called periodically to update metrics
    // Implementation would depend on your specific monitoring needs
    // This method can be extended to update metrics periodically
  }
}
