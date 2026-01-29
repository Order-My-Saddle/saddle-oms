import { Injectable, Logger } from "@nestjs/common";
import { ProductionCacheService, CacheStats } from "./production-cache.service";
import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "../config/config.type";
import { Cron, CronExpression } from "@nestjs/schedule";

export interface CacheMetrics {
  hitRate: number;
  hitRateTarget: number;
  hitRateStatus: "good" | "warning" | "critical";
  totalHits: number;
  totalMisses: number;
  totalOperations: number;
  averageResponseTime: number;
  memoryUsage?: number;
  keyCount?: number;
  uptime: number;
  trends: {
    hitRateChange: number; // Percentage change from previous period
    operationsChange: number;
  };
  healthChecks: {
    redis: "healthy" | "degraded" | "unhealthy";
    cache: "healthy" | "degraded" | "unhealthy";
    overall: "healthy" | "degraded" | "unhealthy";
  };
  alerts: CacheAlert[];
}

export interface CacheAlert {
  type:
    | "hit_rate_low"
    | "memory_high"
    | "connection_error"
    | "performance_degraded";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
  data?: any;
}

export interface CachePerformanceMetrics {
  endpoint: string;
  hitRate: number;
  averageResponseTime: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  lastAccessed: Date;
}

/**
 * Cache metrics and monitoring service for production performance tracking
 * Monitors cache performance, generates alerts, and provides analytics
 */
@Injectable()
export class CacheMetricsService {
  private readonly logger = new Logger(CacheMetricsService.name);
  private readonly hitRateTarget = 85; // Target hit rate percentage
  private readonly performanceMetrics = new Map<
    string,
    CachePerformanceMetrics
  >();
  private readonly alerts: CacheAlert[] = [];
  private previousStats: CacheStats | null = null;

  constructor(
    private readonly cacheService: ProductionCacheService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * Get comprehensive cache metrics
   */
  async getCacheMetrics(): Promise<CacheMetrics> {
    const stats = await this.cacheService.getCacheStats();
    const healthChecks = await this.performHealthChecks();
    const trends = this.calculateTrends(stats);

    // Update previous stats for trend calculation
    this.previousStats = stats;

    const hitRateStatus = this.getHitRateStatus(stats.hitRate);
    const recentAlerts = this.getRecentAlerts();

    return {
      hitRate: stats.hitRate,
      hitRateTarget: this.hitRateTarget,
      hitRateStatus,
      totalHits: stats.totalHits,
      totalMisses: stats.totalMisses,
      totalOperations: stats.totalOperations,
      averageResponseTime: 0, // TODO: Implement response time tracking
      memoryUsage: stats.memoryUsage,
      keyCount: stats.keyCount,
      uptime: stats.uptime,
      trends,
      healthChecks,
      alerts: recentAlerts,
    };
  }

  /**
   * Record cache operation metrics
   */
  recordCacheOperation(
    endpoint: string,
    isHit: boolean,
    responseTime: number,
  ): void {
    const existing = this.performanceMetrics.get(endpoint);

    if (existing) {
      existing.totalRequests++;
      existing.lastAccessed = new Date();
      existing.averageResponseTime =
        (existing.averageResponseTime * (existing.totalRequests - 1) +
          responseTime) /
        existing.totalRequests;

      if (isHit) {
        existing.cacheHits++;
      } else {
        existing.cacheMisses++;
      }

      existing.hitRate = (existing.cacheHits / existing.totalRequests) * 100;
    } else {
      this.performanceMetrics.set(endpoint, {
        endpoint,
        hitRate: isHit ? 100 : 0,
        averageResponseTime: responseTime,
        totalRequests: 1,
        cacheHits: isHit ? 1 : 0,
        cacheMisses: isHit ? 0 : 1,
        lastAccessed: new Date(),
      });
    }

    // Check for performance alerts
    this.checkPerformanceAlerts(endpoint);
  }

  /**
   * Get performance metrics for specific endpoints
   */
  getEndpointMetrics(): CachePerformanceMetrics[] {
    return Array.from(this.performanceMetrics.values()).sort(
      (a, b) => b.totalRequests - a.totalRequests,
    );
  }

  /**
   * Get cache health status
   */
  async getCacheHealth(): Promise<"healthy" | "degraded" | "unhealthy"> {
    try {
      const stats = await this.cacheService.getCacheStats();

      // Require minimum operations before evaluating hit rate health
      // This prevents false alerts during startup/warmup period
      const minOperationsForHealthCheck = 100;
      const hitRateHealth =
        stats.totalOperations < minOperationsForHealthCheck
          ? "healthy" // Not enough data yet, assume healthy
          : stats.hitRate >= this.hitRateTarget
            ? "healthy"
            : stats.hitRate >= this.hitRateTarget * 0.8
              ? "degraded"
              : "unhealthy";

      const memoryHealth = stats.memoryUsage
        ? stats.memoryUsage < 1000000000
          ? "healthy" // < 1GB
          : stats.memoryUsage < 2000000000
            ? "degraded"
            : "unhealthy"
        : "healthy";

      // Overall health is the worst of all indicators
      const indicators = [hitRateHealth, memoryHealth];
      if (indicators.includes("unhealthy")) return "unhealthy";
      if (indicators.includes("degraded")) return "degraded";
      return "healthy";
    } catch (error) {
      this.logger.error("Failed to check cache health", error);
      return "unhealthy";
    }
  }

  /**
   * Generate cache performance report
   */
  async generatePerformanceReport(): Promise<{
    summary: CacheMetrics;
    topEndpoints: CachePerformanceMetrics[];
    recommendations: string[];
  }> {
    const summary = await this.getCacheMetrics();
    const topEndpoints = this.getEndpointMetrics().slice(0, 10);
    const recommendations = this.generateRecommendations(summary, topEndpoints);

    return {
      summary,
      topEndpoints,
      recommendations,
    };
  }

  /**
   * Periodic metrics collection and alerting
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getCacheMetrics();

      // Log metrics for monitoring systems
      this.logger.log(
        `Cache Metrics: Hit Rate=${metrics.hitRate}%, Operations=${metrics.totalOperations}, Memory=${metrics.memoryUsage}B`,
      );

      // Check for alerts
      await this.checkAlerts(metrics);

      // Clean up old performance metrics
      this.cleanupOldMetrics();
    } catch (error) {
      this.logger.error("Failed to collect cache metrics", error);
      this.addAlert(
        "connection_error",
        "critical",
        "Failed to collect cache metrics",
        { error: error.message },
      );
    }
  }

  /**
   * Clear cache metrics and reset counters
   */
  resetMetrics(): void {
    this.performanceMetrics.clear();
    this.alerts.length = 0;
    this.previousStats = null;
    this.logger.log("Cache metrics reset");
  }

  // Private helper methods

  private getHitRateStatus(hitRate: number): "good" | "warning" | "critical" {
    if (hitRate >= this.hitRateTarget) return "good";
    if (hitRate >= this.hitRateTarget * 0.8) return "warning";
    return "critical";
  }

  private calculateTrends(currentStats: CacheStats): {
    hitRateChange: number;
    operationsChange: number;
  } {
    if (!this.previousStats) {
      return { hitRateChange: 0, operationsChange: 0 };
    }

    const hitRateChange = currentStats.hitRate - this.previousStats.hitRate;
    const operationsChange =
      currentStats.totalOperations - this.previousStats.totalOperations;

    return { hitRateChange, operationsChange };
  }

  private async performHealthChecks(): Promise<CacheMetrics["healthChecks"]> {
    const cacheHealth = await this.getCacheHealth();

    let redisHealth: "healthy" | "degraded" | "unhealthy";
    try {
      // Test Redis connection
      await this.cacheService.getFromCache("health_check");
      redisHealth = "healthy";
    } catch (error) {
      this.logger.warn("Redis health check failed", error);
      redisHealth = "unhealthy";
    }

    const overall = [cacheHealth, redisHealth].includes("unhealthy")
      ? "unhealthy"
      : [cacheHealth, redisHealth].includes("degraded")
        ? "degraded"
        : "healthy";

    return {
      redis: redisHealth,
      cache: cacheHealth,
      overall,
    };
  }

  private getRecentAlerts(): CacheAlert[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.alerts.filter((alert) => alert.timestamp >= oneHourAgo);
  }

  private async checkAlerts(metrics: CacheMetrics): Promise<void> {
    await Promise.resolve();
    // Hit rate alert - only if we have enough operations to be statistically meaningful
    const minOperationsForAlert = 100;
    if (
      metrics.totalOperations >= minOperationsForAlert &&
      metrics.hitRate < this.hitRateTarget * 0.8
    ) {
      this.addAlert(
        "hit_rate_low",
        metrics.hitRate < this.hitRateTarget * 0.6 ? "critical" : "warning",
        `Cache hit rate is ${metrics.hitRate}%, target is ${this.hitRateTarget}%`,
        { hitRate: metrics.hitRate, target: this.hitRateTarget },
      );
    }

    // Memory usage alert
    if (metrics.memoryUsage && metrics.memoryUsage > 1500000000) {
      // 1.5GB
      this.addAlert(
        "memory_high",
        metrics.memoryUsage > 2000000000 ? "critical" : "warning", // 2GB
        `Cache memory usage is ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`,
        { memoryUsage: metrics.memoryUsage },
      );
    }

    // Overall health alert - only after warmup period
    if (
      metrics.totalOperations >= minOperationsForAlert &&
      metrics.healthChecks.overall === "unhealthy"
    ) {
      this.addAlert(
        "connection_error",
        "critical",
        "Cache system is unhealthy",
        { healthChecks: metrics.healthChecks },
      );
    }
  }

  private checkPerformanceAlerts(endpoint: string): void {
    const metrics = this.performanceMetrics.get(endpoint);
    if (!metrics || metrics.totalRequests < 10) return; // Need sufficient data

    // Alert if endpoint hit rate is consistently low
    if (metrics.hitRate < 50 && metrics.totalRequests > 50) {
      this.addAlert(
        "performance_degraded",
        "warning",
        `Low cache hit rate for endpoint ${endpoint}: ${metrics.hitRate}%`,
        {
          endpoint,
          hitRate: metrics.hitRate,
          totalRequests: metrics.totalRequests,
        },
      );
    }
  }

  private addAlert(
    type: CacheAlert["type"],
    severity: CacheAlert["severity"],
    message: string,
    data?: any,
  ): void {
    // Avoid duplicate alerts
    const existingAlert = this.alerts.find(
      (alert) =>
        alert.type === type &&
        alert.message === message &&
        Date.now() - alert.timestamp.getTime() < 15 * 60 * 1000, // 15 minutes
    );

    if (!existingAlert) {
      this.alerts.push({
        type,
        severity,
        message,
        timestamp: new Date(),
        data,
      });

      // Log alert based on severity
      if (severity === "critical") {
        this.logger.error(`Cache Alert [${type}]: ${message}`, data);
      } else if (severity === "warning") {
        this.logger.warn(`Cache Alert [${type}]: ${message}`, data);
      } else {
        this.logger.log(`Cache Alert [${type}]: ${message}`);
      }

      // Keep only recent alerts
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentAlerts = this.alerts.filter(
        (alert) => alert.timestamp >= oneHourAgo,
      );
      this.alerts.length = 0;
      this.alerts.push(...recentAlerts);
    }
  }

  private generateRecommendations(
    summary: CacheMetrics,
    topEndpoints: CachePerformanceMetrics[],
  ): string[] {
    const recommendations: string[] = [];

    // Hit rate recommendations
    if (summary.hitRate < this.hitRateTarget) {
      recommendations.push(
        `Cache hit rate (${summary.hitRate}%) is below target (${this.hitRateTarget}%). Consider increasing TTL for frequently accessed data.`,
      );
    }

    // Endpoint-specific recommendations
    const lowHitRateEndpoints = topEndpoints.filter((ep) => ep.hitRate < 70);
    if (lowHitRateEndpoints.length > 0) {
      recommendations.push(
        `Endpoints with low hit rates: ${lowHitRateEndpoints.map((ep) => `${ep.endpoint} (${ep.hitRate}%)`).join(", ")}. Consider optimizing cache keys or increasing TTL.`,
      );
    }

    // Memory recommendations
    if (summary.memoryUsage && summary.memoryUsage > 1000000000) {
      recommendations.push(
        `High memory usage detected (${Math.round(summary.memoryUsage / 1024 / 1024)}MB). Consider implementing cache eviction policies or reducing TTL for large objects.`,
      );
    }

    // Performance recommendations
    if (summary.totalOperations > 10000) {
      recommendations.push(
        "High cache operation volume detected. Consider implementing cache clustering for better scalability.",
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Cache performance is optimal. No recommendations at this time.",
      );
    }

    return recommendations;
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const endpointsToDelete: string[] = [];

    this.performanceMetrics.forEach((metrics, endpoint) => {
      if (metrics.lastAccessed < oneHourAgo && metrics.totalRequests < 10) {
        endpointsToDelete.push(endpoint);
      }
    });

    endpointsToDelete.forEach((endpoint) => {
      this.performanceMetrics.delete(endpoint);
    });

    if (endpointsToDelete.length > 0) {
      this.logger.debug(
        `Cleaned up ${endpointsToDelete.length} old endpoint metrics`,
      );
    }
  }
}
