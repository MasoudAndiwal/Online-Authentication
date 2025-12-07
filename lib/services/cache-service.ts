import Redis from 'ioredis';
import { getRedisClient } from '../config/redis';

// In-memory fallback cache when Redis is not available
const memoryCache = new Map<string, { value: string; expiry: number }>();

/**
 * CacheService
 * Centralized caching layer for all dashboard data with intelligent invalidation
 * Implements typed methods for cache operations with TTL management
 * Falls back to in-memory cache when Redis is not available
 */
export class CacheService {
  private redis: Redis | null = null;
  private useMemoryFallback: boolean = false;

  constructor(redisClient?: Redis) {
    try {
      this.redis = redisClient || getRedisClient();
    } catch {
      console.warn('Redis not available, using in-memory cache fallback');
      this.useMemoryFallback = true;
    }
  }

  /**
   * Get cached data with automatic deserialization
   * @param key - Cache key
   * @returns Parsed data or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        const cached = memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          return JSON.parse(cached.value) as T;
        }
        memoryCache.delete(key);
        return null;
      }

      const value = await this.redis.get(key);
      
      if (!value) {
        return null;
      }
      
      // Parse JSON data
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      // Fall back to memory cache on Redis error
      this.useMemoryFallback = true;
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.value) as T;
      }
      return null;
    }
  }

  /**
   * Set cache with TTL (time-to-live in seconds)
   * @param key - Cache key
   * @param value - Data to cache (will be JSON serialized)
   * @param ttl - Time to live in seconds
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        memoryCache.set(key, { value: serialized, expiry: Date.now() + (ttl * 1000) });
        return;
      }

      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      // Fall back to memory cache on Redis error
      this.useMemoryFallback = true;
      const serialized = JSON.stringify(value);
      memoryCache.set(key, { value: serialized, expiry: Date.now() + (ttl * 1000) });
    }
  }

  /**
   * Delete specific cache key
   * @param key - Cache key to delete
   * @returns Number of keys deleted (0 or 1)
   */
  async delete(key: string): Promise<number> {
    try {
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        const existed = memoryCache.has(key);
        memoryCache.delete(key);
        return existed ? 1 : 0;
      }
      return await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      memoryCache.delete(key);
      return 0;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * Uses SCAN for safe pattern matching without blocking
   * @param pattern - Redis key pattern (e.g., "user:*")
   * @returns Number of keys deleted
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let deletedCount = 0;
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            memoryCache.delete(key);
            deletedCount++;
          }
        }
        return deletedCount;
      }

      let cursor = '0';
      let deletedCount = 0;
      
      do {
        // Use SCAN to iterate through keys matching pattern
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        
        cursor = nextCursor;
        
        // Delete found keys in batch
        if (keys.length > 0) {
          const deleted = await this.redis.del(...keys);
          deletedCount += deleted;
        }
      } while (cursor !== '0');
      
      return deletedCount;
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param key - Cache key
   * @returns True if key exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    try {
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        const cached = memoryCache.get(key);
        return cached !== undefined && cached.expiry > Date.now();
      }
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   * @param key - Cache key
   * @returns Remaining TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      // Use memory fallback if Redis is not available
      if (this.useMemoryFallback || !this.redis) {
        const cached = memoryCache.get(key);
        if (!cached) return -2;
        const remaining = Math.floor((cached.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
      }
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache ttl error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Atomic increment (for counters)
   * @param key - Cache key
   * @param amount - Amount to increment by (default: 1)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        throw new Error('Increment not supported in memory fallback mode');
      }
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Atomic decrement (for counters)
   * @param key - Cache key
   * @param amount - Amount to decrement by (default: 1)
   * @returns New value after decrement
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        throw new Error('Decrement not supported in memory fallback mode');
      }
      return await this.redis.decrby(key, amount);
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple keys at once
   * @param keys - Array of cache keys
   * @returns Array of parsed values (null for missing keys)
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) {
        return [];
      }
      
      if (this.useMemoryFallback || !this.redis) {
        return keys.map(key => {
          const cached = memoryCache.get(key);
          if (cached && cached.expiry > Date.now()) {
            try { return JSON.parse(cached.value) as T; } catch { return null; }
          }
          return null;
        });
      }
      
      const values = await this.redis.mget(...keys);
      
      return values.map(value => {
        if (!value) {
          return null;
        }
        
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error(`Cache mget error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once with same TTL
   * @param entries - Array of [key, value] tuples
   * @param ttl - Time to live in seconds
   */
  async mset<T>(entries: [string, T][], ttl: number): Promise<void> {
    try {
      if (entries.length === 0) {
        return;
      }
      
      if (this.useMemoryFallback || !this.redis) {
        for (const [key, value] of entries) {
          const serialized = JSON.stringify(value);
          memoryCache.set(key, { value: serialized, expiry: Date.now() + (ttl * 1000) });
        }
        return;
      }
      
      // Use pipeline for batch operations
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of entries) {
        const serialized = JSON.stringify(value);
        pipeline.setex(key, ttl, serialized);
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error(`Cache mset error:`, error);
      throw error;
    }
  }

  /**
   * Set key with expiry at specific timestamp
   * @param key - Cache key
   * @param value - Data to cache
   * @param expiryTimestamp - Unix timestamp (seconds) when key should expire
   */
  async setWithExpiry<T>(key: string, value: T, expiryTimestamp: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (this.useMemoryFallback || !this.redis) {
        memoryCache.set(key, { value: serialized, expiry: expiryTimestamp * 1000 });
        return;
      }
      await this.redis.set(key, serialized, 'EXAT', expiryTimestamp);
    } catch (error) {
      console.error(`Cache setWithExpiry error for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Refresh TTL for existing key without changing value
   * @param key - Cache key
   * @param ttl - New TTL in seconds
   * @returns True if key exists and TTL was updated
   */
  async refreshTTL(key: string, ttl: number): Promise<boolean> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        const cached = memoryCache.get(key);
        if (cached) {
          cached.expiry = Date.now() + (ttl * 1000);
          return true;
        }
        return false;
      }
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error(`Cache refreshTTL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - Redis key pattern
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const allKeys: string[] = [];
        for (const key of memoryCache.keys()) {
          if (regex.test(key)) {
            allKeys.push(key);
          }
        }
        return allKeys;
      }

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
      console.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Clear all cache (use with caution!)
   * @returns True if successful
   */
  async clear(): Promise<boolean> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        memoryCache.clear();
        return true;
      }
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error(`Cache clear error:`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns Object with cache info
   */
  async getStats(): Promise<{
    usedMemory: string;
    totalKeys: number;
    hitRate?: number;
  }> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        return {
          usedMemory: 'in-memory',
          totalKeys: memoryCache.size,
        };
      }

      const memory = await this.redis.info('memory');
      
      // Parse used memory
      const memoryMatch = memory.match(/used_memory_human:(.+)/);
      const usedMemory = memoryMatch ? memoryMatch[1].trim() : 'unknown';
      
      // Get total keys
      const dbsize = await this.redis.dbsize();
      
      return {
        usedMemory,
        totalKeys: dbsize,
      };
    } catch (error) {
      console.error(`Cache getStats error:`, error);
      return {
        usedMemory: 'unknown',
        totalKeys: 0,
      };
    }
  }

  /**
   * Ping Redis to check connection
   * @returns True if connected
   */
  async ping(): Promise<boolean> {
    try {
      if (this.useMemoryFallback || !this.redis) {
        return true; // Memory fallback is always "connected"
      }
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      console.error(`Cache ping error:`, error);
      return false;
    }
  }
}

// Export singleton instance
let cacheServiceInstance: CacheService | null = null;

export function getCacheService(): CacheService {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new CacheService();
  }
  return cacheServiceInstance;
}

export default CacheService;
