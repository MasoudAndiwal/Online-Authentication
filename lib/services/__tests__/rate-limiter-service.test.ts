import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RateLimiterService, RATE_LIMITS } from '../rate-limiter-service';
import Redis from 'ioredis';

/**
 * Unit tests for RateLimiterService
 * Tests rate limiting logic with sliding window algorithm
 */

describe('RateLimiterService', () => {
  let rateLimiter: RateLimiterService;
  let mockRedis: any;

  beforeEach(() => {
    // Create mock pipeline
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zadd: vi.fn().mockReturnThis(),
      expire: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };

    // Create a mock Redis client
    mockRedis = {
      zremrangebyscore: vi.fn().mockResolvedValue(0),
      zcard: vi.fn().mockResolvedValue(0),
      zrange: vi.fn().mockResolvedValue([]),
      zadd: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
      del: vi.fn().mockResolvedValue(1),
      scan: vi.fn().mockResolvedValue(['0', []]),
      pipeline: vi.fn(() => mockPipeline),
    };

    rateLimiter = new RateLimiterService(mockRedis as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      mockRedis.zcard.mockResolvedValue(50); // 50 requests in window
      mockRedis.zrange.mockResolvedValue([]); // No entries yet

      const result = await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(50); // 100 - 50
      expect(result.retryAfter).toBeUndefined();
    });

    it('should block requests exceeding limit', async () => {
      const now = Date.now();
      mockRedis.zcard.mockResolvedValue(100); // At limit
      mockRedis.zrange.mockResolvedValue(['entry1', now.toString()]);

      const result = await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should calculate correct remaining requests', async () => {
      mockRedis.zcard.mockResolvedValue(75);
      mockRedis.zrange.mockResolvedValue([]);

      const result = await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      expect(result.remaining).toBe(25); // 100 - 75
    });

    it('should handle different endpoints with different limits', async () => {
      mockRedis.zcard.mockResolvedValue(3);
      mockRedis.zrange.mockResolvedValue([]);

      const result = await rateLimiter.checkLimit('user-123', 'EXPORT');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 3
    });

    it('should throw error for unknown endpoint', async () => {
      await expect(
        rateLimiter.checkLimit('user-123', 'UNKNOWN' as unknown)
      ).rejects.toThrow('Unknown endpoint: UNKNOWN');
    });

    it('should fail open on Redis error', async () => {
      mockRedis.zcard.mockRejectedValue(new Error('Redis connection failed'));

      const result = await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100); // DASHBOARD limit
    });

    it('should clean up old entries before checking', async () => {
      const now = Date.now();
      const windowStart = now - (RATE_LIMITS.DASHBOARD.window * 1000);

      await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith(
        'ratelimit:DASHBOARD:user-123',
        0,
        expect.any(Number)
      );
    });
  });

  describe('recordRequest', () => {
    it('should record request with timestamp', async () => {
      const pipeline = mockRedis.pipeline();
      
      await rateLimiter.recordRequest('user-123', 'DASHBOARD');

      expect(mockRedis.pipeline).toHaveBeenCalled();
      expect(pipeline.zremrangebyscore).toHaveBeenCalled();
      expect(pipeline.zadd).toHaveBeenCalled();
      expect(pipeline.expire).toHaveBeenCalled();
      expect(pipeline.exec).toHaveBeenCalled();
    });

    it('should set expiry on rate limit key', async () => {
      const pipeline = mockRedis.pipeline();
      
      await rateLimiter.recordRequest('user-123', 'DASHBOARD');

      expect(pipeline.expire).toHaveBeenCalledWith(
        'ratelimit:DASHBOARD:user-123',
        RATE_LIMITS.DASHBOARD.window + 60
      );
    });

    it('should not throw on Redis error', async () => {
      mockRedis.pipeline.mockReturnValue({
        zremrangebyscore: vi.fn().mockReturnThis(),
        zadd: vi.fn().mockReturnThis(),
        expire: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValue(new Error('Redis error')),
      });

      await expect(
        rateLimiter.recordRequest('user-123', 'DASHBOARD')
      ).resolves.not.toThrow();
    });
  });

  describe('getUsage', () => {
    it('should return current usage information', async () => {
      const now = Date.now();
      mockRedis.zcard.mockResolvedValue(45);
      mockRedis.zrange.mockResolvedValue(['entry1', now.toString()]);

      const result = await rateLimiter.getUsage('user-123', 'DASHBOARD');

      expect(result.requests).toBe(45);
      expect(result.limit).toBe(100); // DASHBOARD limit
      expect(result.windowStart).toBeInstanceOf(Date);
      expect(result.windowEnd).toBeInstanceOf(Date);
    });

    it('should handle empty usage', async () => {
      mockRedis.zcard.mockResolvedValue(0);
      mockRedis.zrange.mockResolvedValue([]);

      const result = await rateLimiter.getUsage('user-123', 'DASHBOARD');

      expect(result.requests).toBe(0);
      expect(result.limit).toBe(100); // DASHBOARD limit
    });

    it('should return default values on error', async () => {
      mockRedis.zcard.mockRejectedValue(new Error('Redis error'));

      const result = await rateLimiter.getUsage('user-123', 'DASHBOARD');

      expect(result.requests).toBe(0);
      expect(result.limit).toBe(100); // DASHBOARD limit
    });
  });

  describe('resetLimits', () => {
    it('should delete all rate limit keys for user', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['1', ['ratelimit:DASHBOARD:user-123']])
        .mockResolvedValueOnce(['0', ['ratelimit:EXPORT:user-123']]);
      mockRedis.del.mockResolvedValue(1);

      const result = await rateLimiter.resetLimits('user-123');

      expect(result).toBe(2);
      expect(mockRedis.del).toHaveBeenCalledTimes(2);
    });

    it('should handle no matching keys', async () => {
      mockRedis.scan.mockResolvedValue(['0', []]);

      const result = await rateLimiter.resetLimits('user-123');

      expect(result).toBe(0);
    });

    it('should return 0 on error', async () => {
      mockRedis.scan.mockRejectedValue(new Error('Redis error'));

      const result = await rateLimiter.resetLimits('user-123');

      expect(result).toBe(0);
    });
  });

  describe('resetEndpointLimit', () => {
    it('should delete specific endpoint rate limit', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await rateLimiter.resetEndpointLimit('user-123', 'DASHBOARD');

      expect(mockRedis.del).toHaveBeenCalledWith('ratelimit:DASHBOARD:user-123');
      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await rateLimiter.resetEndpointLimit('user-123', 'DASHBOARD');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const result = await rateLimiter.resetEndpointLimit('user-123', 'DASHBOARD');

      expect(result).toBe(false);
    });
  });

  describe('getActiveRateLimits', () => {
    it('should return all active rate limit keys', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['1', ['ratelimit:DASHBOARD:user-1', 'ratelimit:EXPORT:user-2']])
        .mockResolvedValueOnce(['0', ['ratelimit:UPLOAD:user-3']]);

      const result = await rateLimiter.getActiveRateLimits();

      expect(result).toHaveLength(3);
      expect(result).toContain('ratelimit:DASHBOARD:user-1');
      expect(result).toContain('ratelimit:EXPORT:user-2');
      expect(result).toContain('ratelimit:UPLOAD:user-3');
    });

    it('should return empty array on error', async () => {
      mockRedis.scan.mockRejectedValue(new Error('Redis error'));

      const result = await rateLimiter.getActiveRateLimits();

      expect(result).toEqual([]);
    });
  });

  describe('sliding window algorithm', () => {
    it('should only count requests within the time window', async () => {
      const now = Date.now();
      const windowStart = now - (RATE_LIMITS.DASHBOARD.window * 1000);

      await rateLimiter.checkLimit('user-123', 'DASHBOARD');

      // Verify old entries are removed
      expect(mockRedis.zremrangebyscore).toHaveBeenCalledWith(
        'ratelimit:DASHBOARD:user-123',
        0,
        expect.any(Number)
      );
    });

    it('should use sorted set scores for accurate time-based limiting', async () => {
      const pipeline = mockRedis.pipeline();
      
      await rateLimiter.recordRequest('user-123', 'DASHBOARD');

      // Verify timestamp is used as score
      expect(pipeline.zadd).toHaveBeenCalledWith(
        'ratelimit:DASHBOARD:user-123',
        expect.any(Number), // timestamp
        expect.stringMatching(/^\d+:/) // timestamp:random
      );
    });
  });

  describe('rate limit configuration', () => {
    it('should have correct configuration for DASHBOARD endpoint', () => {
      expect(RATE_LIMITS.DASHBOARD).toEqual({
        requests: 100,
        window: 60,
      });
    });

    it('should have correct configuration for EXPORT endpoint', () => {
      expect(RATE_LIMITS.EXPORT).toEqual({
        requests: 5,
        window: 3600,
      });
    });

    it('should have correct configuration for UPLOAD endpoint', () => {
      expect(RATE_LIMITS.UPLOAD).toEqual({
        requests: 10,
        window: 3600,
      });
    });

    it('should have correct configuration for SSE endpoint', () => {
      expect(RATE_LIMITS.SSE).toEqual({
        requests: 10,
        window: 60,
      });
    });
  });
});
