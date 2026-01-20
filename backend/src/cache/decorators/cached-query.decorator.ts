import { Logger } from "@nestjs/common";

export interface CachedQueryOptions {
  /**
   * Time to live in milliseconds
   */
  ttl: number;

  /**
   * Custom key generator function
   */
  keyGenerator?: (...args: any[]) => string;

  /**
   * Entity types that invalidate this cache when changed
   */
  invalidateOn?: string[];

  /**
   * Whether to cache null/undefined results
   */
  cacheNullValues?: boolean;

  /**
   * Custom cache prefix
   */
  prefix?: string;

  /**
   * Whether to refresh cache in background before expiry
   */
  refreshAhead?: {
    enabled: boolean;
    threshold: number; // Refresh when TTL remaining is less than this (in ms)
  };
}

/**
 * Decorator for caching query results with intelligent invalidation
 */
export function CachedQuery(options: CachedQueryOptions) {
  const logger = new Logger("CachedQuery");

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      // Get cache manager from the service instance
      const cacheManager = this.cacheManager;

      if (!cacheManager) {
        logger.warn(
          `No cache manager found in ${className}, executing query without caching`,
        );
        return await originalMethod.apply(this, args);
      }

      // Generate cache key
      const cacheKey = generateCacheKey(className, propertyName, args, options);

      try {
        // Try to get from cache first
        const cachedResult = await cacheManager.get(cacheKey);

        if (cachedResult !== undefined) {
          logger.debug(`Cache hit: ${cacheKey}`);

          // Check if we need to refresh ahead
          if (options.refreshAhead?.enabled) {
            await checkAndRefreshAhead(
              cacheKey,
              cachedResult,
              originalMethod,
              this,
              args,
              options,
              cacheManager,
              logger,
            );
          }

          return cachedResult;
        }

        logger.debug(`Cache miss: ${cacheKey}`);

        // Execute original method
        const result = await originalMethod.apply(this, args);

        // Check if we should cache this result
        if (shouldCacheResult(result, options)) {
          await cacheManager.set(cacheKey, result, options.ttl);
          logger.debug(`Cached result: ${cacheKey}, TTL: ${options.ttl}ms`);
        }

        return result;
      } catch (error) {
        logger.error(`Cache operation failed for ${cacheKey}`, error);
        // If cache fails, still execute the original method
        return await originalMethod.apply(this, args);
      }
    };

    // Store metadata for cache invalidation
    if (!target._cachedQueries) {
      target._cachedQueries = [];
    }

    target._cachedQueries.push({
      methodName: propertyName,
      options,
      className,
    });

    return descriptor;
  };
}

/**
 * Generate cache key for the query
 */
function generateCacheKey(
  className: string,
  methodName: string,
  args: any[],
  options: CachedQueryOptions,
): string {
  const prefix = options.prefix || "query_cache";

  if (options.keyGenerator) {
    const customKey = options.keyGenerator(...args);
    return `${prefix}:${className}:${methodName}:${customKey}`;
  }

  // Default key generation
  const argsHash = generateArgsHash(args);
  return `${prefix}:${className}:${methodName}:${argsHash}`;
}

/**
 * Generate hash from arguments
 */
function generateArgsHash(args: any[]): string {
  try {
    const argsString = JSON.stringify(args, (key, value) => {
      // Handle circular references and special objects
      if (typeof value === "object" && value !== null) {
        if (value.constructor?.name === "Object") {
          return value;
        }
        return "[object]";
      }
      return value;
    });

    // Simple hash function (not cryptographic)
    let hash = 0;
    for (let i = 0; i < argsString.length; i++) {
      const char = argsString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  } catch {
    // Fallback to timestamp if JSON.stringify fails
    return Date.now().toString(36);
  }
}

/**
 * Check if we should cache this result
 */
function shouldCacheResult(result: any, options: CachedQueryOptions): boolean {
  if (
    options.cacheNullValues === false &&
    (result === null || result === undefined)
  ) {
    return false;
  }

  return true;
}

/**
 * Check if we need to refresh cache ahead of expiration
 */
async function checkAndRefreshAhead(
  cacheKey: string,
  cachedResult: any,
  originalMethod: (...args: unknown[]) => unknown,
  context: any,
  args: any[],
  options: CachedQueryOptions,
  cacheManager: any,
  logger: Logger,
): Promise<void> {
  await Promise.resolve();
  if (!options.refreshAhead?.enabled) return;

  try {
    // Check cache TTL (this would need to be implemented based on your cache store)
    // For now, we'll use a simple timestamp-based approach
    const cacheTimestamp = cachedResult?._cacheTimestamp;

    if (cacheTimestamp) {
      const age = Date.now() - cacheTimestamp;
      const remainingTtl = options.ttl - age;

      if (remainingTtl < options.refreshAhead.threshold) {
        // Refresh in background
        logger.debug(`Refreshing cache ahead for: ${cacheKey}`);

        setImmediate(async () => {
          try {
            const freshResult = await originalMethod.apply(context, args);

            // Add timestamp for refresh-ahead tracking
            const resultWithTimestamp = {
              ...freshResult,
              _cacheTimestamp: Date.now(),
            };

            await cacheManager.set(cacheKey, resultWithTimestamp, options.ttl);
            logger.debug(`Background refresh completed for: ${cacheKey}`);
          } catch (error) {
            logger.error(`Background refresh failed for: ${cacheKey}`, error);
          }
        });
      }
    }
  } catch (error) {
    logger.warn(`Refresh-ahead check failed for: ${cacheKey}`, error);
  }
}

/**
 * Cache invalidation decorator for methods that modify data
 */
export function InvalidateCache(entityTypes: string[]) {
  const logger = new Logger("InvalidateCache");

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Invalidate caches after successful operation
      try {
        const cacheInvalidationService = this.cacheInvalidationService;

        if (cacheInvalidationService) {
          for (const entityType of entityTypes) {
            await cacheInvalidationService.invalidateEntityCaches({
              entityType,
              operation: "update", // Generic operation for cache invalidation
              userId: this.currentUser?.id,
            });
          }
        }
      } catch (error) {
        logger.error(
          `Cache invalidation failed for ${entityTypes.join(", ")}`,
          error,
        );
        // Don't throw - cache invalidation failure shouldn't break the operation
      }

      return result;
    };

    return descriptor;
  };
}
