import { SetMetadata, UseInterceptors } from "@nestjs/common";
import {
  CacheInterceptor,
  SearchCacheInterceptor,
} from "../interceptors/cache.interceptor";

/**
 * Cache configuration options for decorators
 */
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  type?: "reference" | "search" | "user" | "session" | "default";
  condition?: boolean | ((request: any) => boolean);
  allowEmpty?: boolean; // Whether to cache empty responses
}

/**
 * Decorator for caching HTTP responses
 */
export function Cache(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) {
    // Set metadata for the interceptor to read
    if (options.ttl && propertyKey && descriptor) {
      SetMetadata("cache:ttl", options.ttl)(target, propertyKey, descriptor);
    }
    if (options.key && propertyKey && descriptor) {
      SetMetadata("cache:key", options.key)(target, propertyKey, descriptor);
    }
    if (options.type && propertyKey && descriptor) {
      SetMetadata("cache:type", options.type)(target, propertyKey, descriptor);
    }
    if (options.condition !== undefined && propertyKey && descriptor) {
      SetMetadata("cache:condition", options.condition)(
        target,
        propertyKey,
        descriptor,
      );
    }
    if (options.allowEmpty !== undefined && propertyKey && descriptor) {
      SetMetadata("cache:allowEmpty", options.allowEmpty)(
        target,
        propertyKey,
        descriptor,
      );
    }

    // Apply the cache interceptor
    if (propertyKey && descriptor) {
      UseInterceptors(CacheInterceptor)(target, propertyKey, descriptor);
    }
  };
}

/**
 * Decorator specifically for caching reference data (brands, statuses, etc.)
 * Uses long TTL (60 minutes) optimized for rarely changing data
 */
export function CacheReference(options: Omit<CacheOptions, "type"> = {}) {
  return Cache({
    ...options,
    type: "reference",
    ttl: options.ttl || 60 * 60 * 1000, // 1 hour default
  });
}

/**
 * Decorator specifically for caching search results
 * Uses medium TTL (5 minutes) with search-optimized interceptor
 */
export function CacheSearch(options: Omit<CacheOptions, "type"> = {}) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) {
    // Set metadata for search caching
    if (options.ttl && propertyKey && descriptor) {
      SetMetadata("cache:ttl", options.ttl)(target, propertyKey, descriptor);
    }
    if (options.key && propertyKey && descriptor) {
      SetMetadata("cache:key", options.key)(target, propertyKey, descriptor);
    }
    if (options.condition !== undefined && propertyKey && descriptor) {
      SetMetadata("cache:condition", options.condition)(
        target,
        propertyKey,
        descriptor,
      );
    }

    // Apply the search-specific cache interceptor
    if (propertyKey && descriptor) {
      UseInterceptors(SearchCacheInterceptor)(target, propertyKey, descriptor);
    }
  };
}

/**
 * Decorator specifically for caching user session data
 * Uses short TTL (30 minutes) for user-specific data
 */
export function CacheUser(options: Omit<CacheOptions, "type"> = {}) {
  return Cache({
    ...options,
    type: "user",
    ttl: options.ttl || 30 * 60 * 1000, // 30 minutes default
  });
}

/**
 * Decorator for disabling cache on specific methods
 */
export function NoCache() {
  return SetMetadata("cache:condition", false);
}

/**
 * Class decorator for applying cache settings to all methods in a controller
 */
export function CacheController(options: CacheOptions = {}) {
  return function <T extends new (...args: unknown[]) => object>(
    constructor: T,
  ) {
    // Set default cache metadata for the entire class
    if (options.ttl) {
      SetMetadata("cache:ttl", options.ttl)(constructor);
    }
    if (options.type) {
      SetMetadata("cache:type", options.type)(constructor);
    }
    if (options.condition !== undefined) {
      SetMetadata("cache:condition", options.condition)(constructor);
    }

    return constructor;
  };
}

/**
 * Decorator for cache invalidation on data modification
 */
export function InvalidateCache(patterns: string | string[]) {
  return SetMetadata(
    "cache:invalidate",
    Array.isArray(patterns) ? patterns : [patterns],
  );
}

/**
 * Decorator for conditional caching based on request parameters
 */
export function CacheWhen(
  condition: (request: any) => boolean,
  options: CacheOptions = {},
) {
  return Cache({
    ...options,
    condition,
  });
}

/**
 * Decorator for caching with custom key generation
 */
export function CacheWithKey(
  keyGenerator: string | ((request: any) => string),
  options: Omit<CacheOptions, "key"> = {},
) {
  return Cache({
    ...options,
    key: typeof keyGenerator === "string" ? keyGenerator : undefined,
  });
}

/**
 * Decorator for time-based cache invalidation
 */
export function CacheWithRefresh(
  refreshIntervalMs: number,
  options: CacheOptions = {},
) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) {
    if (propertyKey && descriptor) {
      SetMetadata("cache:refreshInterval", refreshIntervalMs)(
        target,
        propertyKey,
        descriptor,
      );
      Cache(options)(target, propertyKey, descriptor);
    }
  };
}

/**
 * Decorator for enriched orders view caching (5-minute TTL as per specs)
 */
export function CacheEnrichedOrders() {
  return Cache({
    type: "default",
    ttl: 5 * 60 * 1000, // 5 minutes as specified
    key: "enriched_orders",
  });
}
