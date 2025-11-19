import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../cache-service';
import Redis from 'ioredis';

/**
 * Unit tests for CacheService
 * Tests basic cache operations with mocked Redis client
 */

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: any;

  beforeEach(() => {
    // Create a mock Redis client
    mockRedis = {
      get: vi.fn(),
      setex: vi.fn(),
      del: vi.fn(),
      scan: vi.fn(),
      exists: vi.fn(),
      ttl: vi.fn(),
      incrby: vi.fn(),
      decrby: vi.fn(),
      mget: vi.fn(),
      pipeline: vi.fn(() => ({
        setex: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      })),
      set: vi.fn(),
      expire: vi.fn(),
      flushdb: vi.fn(),
      info: vi.fn(),
      dbsize: vi.fn(),
      ping: vi.fn(),
    };

    cacheService = new CacheService(mockRedis as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve and parse cached data', async () => {
      const testData = { name: 'test', value: 123 };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on parse error', async () => {
      mockRedis.get.mockResolvedValue('invalid json');

      const result = await cacheService.get('invalid-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should serialize and cache data with TTL', async () => {
      const testData = { name: 'test', value: 123 };
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, 300);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        300,
        JSON.stringify(testData)
      );
    });
  });

  describe('delete', () => {
    it('should delete a cache key', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cacheService.delete('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
      expect(result).toBe(1);
    });

    it('should return 0 if key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await cacheService.delete('non-existent');

      expect(result).toBe(0);
    });
  });

  describe('deletePattern', () => {
    it('should delete all keys matching pattern', async () => {
      // Mock SCAN to return keys in batches
      mockRedis.scan
        .mockResolvedValueOnce(['1', ['key1', 'key2']])
        .mockResolvedValueOnce(['0', ['key3']]);
      
      mockRedis.del.mockResolvedValue(2).mockResolvedValueOnce(1);

      const result = await cacheService.deletePattern('test:*');

      expect(mockRedis.scan).toHaveBeenCalledTimes(2);
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
      expect(mockRedis.del).toHaveBeenCalledWith('key3');
      expect(result).toBe(3);
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return remaining TTL', async () => {
      mockRedis.ttl.mockResolvedValue(120);

      const result = await cacheService.ttl('test-key');

      expect(result).toBe(120);
    });

    it('should return -2 for non-existent key', async () => {
      mockRedis.ttl.mockResolvedValue(-2);

      const result = await cacheService.ttl('non-existent');

      expect(result).toBe(-2);
    });
  });

  describe('increment', () => {
    it('should increment counter by specified amount', async () => {
      mockRedis.incrby.mockResolvedValue(5);

      const result = await cacheService.increment('counter', 5);

      expect(mockRedis.incrby).toHaveBeenCalledWith('counter', 5);
      expect(result).toBe(5);
    });

    it('should increment by 1 by default', async () => {
      mockRedis.incrby.mockResolvedValue(1);

      const result = await cacheService.increment('counter');

      expect(mockRedis.incrby).toHaveBeenCalledWith('counter', 1);
      expect(result).toBe(1);
    });
  });

  describe('mget', () => {
    it('should retrieve multiple keys at once', async () => {
      const data1 = { id: 1 };
      const data2 = { id: 2 };
      mockRedis.mget.mockResolvedValue([
        JSON.stringify(data1),
        JSON.stringify(data2),
        null,
      ]);

      const result = await cacheService.mget(['key1', 'key2', 'key3']);

      expect(result).toEqual([data1, data2, null]);
    });

    it('should return empty array for empty input', async () => {
      const result = await cacheService.mget([]);

      expect(result).toEqual([]);
      expect(mockRedis.mget).not.toHaveBeenCalled();
    });
  });

  describe('ping', () => {
    it('should return true when Redis responds with PONG', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const result = await cacheService.ping();

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const result = await cacheService.ping();

      expect(result).toBe(false);
    });
  });
});
