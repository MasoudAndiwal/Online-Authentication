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

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, { timestamps: number[] }>();

/**
 * RateLimiterService
 * Implements in-memory rate limiting with sliding window algorithm
 * Protects API endpoints from abuse with configurable rate limits
 */
export class RateLimiterService {
  constructor() {
    // In-memory rate limiting - no external dependencies
  }

  /**
   * Generate key for rate limiting
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

    // Get or create entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      rateLimitStore.set(key, entry);
    }

    // Remove old entries outside the current window
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    // Count requests in current window
    const requestCount = entry.timestamps.length;

    // Check if limit exceeded
    const allowed = requestCount < config.requests;

    // Calculate remaining requests
    const remaining = Math.max(0, config.requests - requestCount);

    // Calculate reset time (end of current window)
    const oldestTimestamp = entry.timestamps.length > 0 ? entry.timestamps[0] : now;
    const resetAt = new Date(oldestTimestamp + (config.window * 1000));

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

    // Get or create entry
    let entry = rateLimitStore.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      rateLimitStore.set(key, entry);
    }

    // Remove old entries
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    // Add current request
    entry.timestamps.push(now);
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

    const entry = rateLimitStore.get(key);
    if (!entry) {
      return {
        requests: 0,
        limit: config.requests,
        windowStart: new Date(windowStart),
        windowEnd: new Date(now + config.window * 1000),
      };
    }

    // Remove old entries
    entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

    const actualWindowStart = entry.timestamps.length > 0 ? entry.timestamps[0] : now;

    return {
      requests: entry.timestamps.length,
      limit: config.requests,
      windowStart: new Date(actualWindowStart),
      windowEnd: new Date(actualWindowStart + config.window * 1000),
    };
  }

  /**
   * Reset limits for user (admin function)
   * Clears all rate limit data for a specific user
   * 
   * @param userId - User identifier
   * @returns Number of keys deleted
   */
  async resetLimits(userId: string): Promise<number> {
    let deletedCount = 0;
    const prefix = `ratelimit:`;
    const suffix = `:${userId}`;
    
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        rateLimitStore.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Reset limits for specific endpoint (admin function)
   * 
   * @param userId - User identifier
   * @param endpoint - API endpoint name
   * @returns True if key was deleted
   */
  async resetEndpointLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = this.getRateLimitKey(userId, endpoint);
    return rateLimitStore.delete(key);
  }

  /**
   * Get all active rate limits for monitoring
   * 
   * @returns Array of active rate limit keys
   */
  async getActiveRateLimits(): Promise<string[]> {
    return Array.from(rateLimitStore.keys());
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
