import Redis from 'ioredis';
import { getRedisClient } from '../config/redis';

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  DASHBOARD: {
    requests: 100,
    window: 60, // seconds
  },
  EXPORT: {
    requests: 5,
    window: 3600, // 1 hour
  },
  UPLOAD: {
    requests: 10,
    window: 3600, // 1 hour
  },
  SSE: {
    requests: 10,
    window: 60, // connections per minute
  },
} as const;

export type RateLimitEndpoint = keyof typeof RATE_LIMITS;

/**
 * Result of rate limit check
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // Seconds until next allowed request
}

/**
 * Current usage information for a user
 */
export interface RateLimitUsage {
  requests: number;
  limit: number;
  windowStart: Date;
  windowEnd: Date;
}

/**
 * RateLimiterService
 * Implements distributed rate limiting using Redis with sliding window algorithm
 * Protects API endpoints from abuse with configurable rate limits
 */
export class RateLimiterService {
  private redis: Redis;

  constructor(redisClient?: Redis) {
    this.redis = redisClient || getRedisClient();
  }

  /**
   * Generate Redis key for rate limiting
   */
  private getRateLimitKey(userId: string, endpoint: string): string {
    return `ratelimit:${endpoint}:${userId}`;
  }

  /**
   * Check if request is allowed under rate limit
   * Uses sliding window algorithm for accurate rate limiting
   * 
   * @param userId - User identifier
   * @param endpoint - API endpoint name
   * @returns Rate limit result with allowed status and metadata
   */
  async checkLimit(userId: string, endpoint: string): Promise<RateLimitResult> {
    const config = RATE_LIMITS[endpoint as RateLimitEndpoint];
    
    if (!config) {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const key = this.getRateLimitKey(userId, endpoint);
    const now = Date.now();
    const windowStart = now - (config.window * 1000);

    try {
      // Use sliding window algorithm with sorted sets
      // Remove old entries outside the current window
      await this.redis.zremrangebyscore(key, 0, windowStart);

      // Count requests in current window
      const requestCount = await this.redis.zcard(key);

      // Check if limit exceeded
      const allowed = requestCount < config.requests;

      // Calculate remaining requests
      const remaining = Math.max(0, config.requests - requestCount);

      // Calculate reset time (end of current window)
      const oldestEntry = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const windowStartTime = oldestEntry.length >= 2
        ? parseInt(oldestEntry[1], 10) 
        : now;
      const resetAt = new Date(windowStartTime + (config.window * 1000));

      // Calculate retry after if not allowed
      let retryAfter: number | undefined;
      if (!allowed) {
        retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);
      }

      return {
        allowed,
        remaining,
        resetAt,
        retryAfter,
      };
    } catch (error) {
      console.error(`Rate limit check error for ${userId}:${endpoint}:`, error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.requests,
        resetAt: new Date(now + config.window * 1000),
      };
    }
  }

  /**
   * Record a request for rate limiting
   * Should be called after checkLimit returns allowed: true
   * 
   * @param userId - User identifier
   * @param endpoint - API endpoint name
   */
  async recordRequest(userId: string, endpoint: string): Promise<void> {
    const config = RATE_LIMITS[endpoint as RateLimitEndpoint];
    
    if (!config) {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const key = this.getRateLimitKey(userId, endpoint);
    const now = Date.now();
    const windowStart = now - (config.window * 1000);

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // Remove old entries
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Add current request with timestamp as score
      pipeline.zadd(key, now, `${now}:${Math.random()}`);

      // Set expiry on the key (window + buffer)
      pipeline.expire(key, config.window + 60);

      await pipeline.exec();
    } catch (error) {
      console.error(`Rate limit record error for ${userId}:${endpoint}:`, error);
      // Don't throw - failing to record shouldn't break the request
    }
  }

  /**
   * Get current usage for user on specific endpoint
   * 
   * @param userId - User identifier
   * @param endpoint - API endpoint name
   * @returns Current usage information
   */
  async getUsage(userId: string, endpoint: string): Promise<RateLimitUsage> {
    const config = RATE_LIMITS[endpoint as RateLimitEndpoint];
    
    if (!config) {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }

    const key = this.getRateLimitKey(userId, endpoint);
    const now = Date.now();
    const windowStart = now - (config.window * 1000);

    try {
      // Remove old entries
      await this.redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      const requestCount = await this.redis.zcard(key);

      // Get oldest entry to determine window start
      const oldestEntry = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const actualWindowStart = oldestEntry.length >= 2
        ? parseInt(oldestEntry[1], 10) 
        : now;

      return {
        requests: requestCount,
        limit: config.requests,
        windowStart: new Date(actualWindowStart),
        windowEnd: new Date(actualWindowStart + config.window * 1000),
      };
    } catch (error) {
      console.error(`Rate limit usage error for ${userId}:${endpoint}:`, error);
      return {
        requests: 0,
        limit: config.requests,
        windowStart: new Date(windowStart),
        windowEnd: new Date(now + config.window * 1000),
      };
    }
  }

  /**
   * Reset limits for user (admin function)
   * Clears all rate limit data for a specific user
   * 
   * @param userId - User identifier
   * @returns Number of keys deleted
   */
  async resetLimits(userId: string): Promise<number> {
    try {
      const pattern = `ratelimit:*:${userId}`;
      let cursor = '0';
      let deletedCount = 0;

      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );

        cursor = nextCursor;

        if (keys.length > 0) {
          const deleted = await this.redis.del(...keys);
          deletedCount += deleted;
        }
      } while (cursor !== '0');

      return deletedCount;
    } catch (error) {
      console.error(`Rate limit reset error for ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Reset limits for specific endpoint (admin function)
   * 
   * @param userId - User identifier
   * @param endpoint - API endpoint name
   * @returns True if key was deleted
   */
  async resetEndpointLimit(userId: string, endpoint: string): Promise<boolean> {
    try {
      const key = this.getRateLimitKey(userId, endpoint);
      const deleted = await this.redis.del(key);
      return deleted > 0;
    } catch (error) {
      console.error(`Rate limit endpoint reset error for ${userId}:${endpoint}:`, error);
      return false;
    }
  }

  /**
   * Get all active rate limits for monitoring
   * 
   * @returns Array of active rate limit keys
   */
  async getActiveRateLimits(): Promise<string[]> {
    try {
      const pattern = 'ratelimit:*';
      let cursor = '0';
      const allKeys: string[] = [];

      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );

        cursor = nextCursor;
        allKeys.push(...keys);
      } while (cursor !== '0');

      return allKeys;
    } catch (error) {
      console.error('Error getting active rate limits:', error);
      return [];
    }
  }
}

// Export singleton instance
let rateLimiterInstance: RateLimiterService | null = null;

export function getRateLimiterService(): RateLimiterService {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiterService();
  }
  return rateLimiterInstance;
}

export default RateLimiterService;
