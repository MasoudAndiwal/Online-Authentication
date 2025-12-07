/**
 * CacheService
 * In-memory caching layer for all dashboard data with intelligent invalidation
 * Implements typed methods for cache operations with TTL management
 */

// In-memory cache storage
const memoryCache = new Map<string, { value: string; expiry: number }>();

/**
 * CacheService
 * Centralized caching layer using in-memory storage
 */
export class CacheService {
  constructor() {
    // In-memory cache - no external dependencies
  }

  /**
   * Get cached data with automatic deserialization
   * @param key - Cache key
   * @returns Parsed data or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.value) as T;
      }
      memoryCache.delete(key);
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
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
      memoryCache.set(key, { value: serialized, expiry: Date.now() + (ttl * 1000) });
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete specific cache key
   * @param key - Cache key to delete
   * @returns Number of keys deleted (0 or 1)
   */
  async delete(key: string): Promise<number> {
    const existed = memoryCache.has(key);
    memoryCache.delete(key);
    return existed ? 1 : 0;
  }

  /**
   * Delete multiple keys matching pattern
   * @param pattern - Key pattern (e.g., "user:*")
   * @returns Number of keys deleted
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      let deletedCount = 0;
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          memoryCache.delete(key);
          deletedCount++;
        }
      }
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
    const cached = memoryCache.get(key);
    return cached !== undefined && cached.expiry > Date.now();
  }

  /**
   * Get remaining TTL for key
   * @param key - Cache key
   * @returns Remaining TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    const cached = memoryCache.get(key);
    if (!cached) return -2;
    const remaining = Math.floor((cached.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  /**
   * Atomic increment (for counters)
   * @param key - Cache key
   * @param amount - Amount to increment by (default: 1)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const cached = memoryCache.get(key);
    let currentValue = 0;
    let expiry = Date.now() + 3600000; // Default 1 hour expiry
    
    if (cached && cached.expiry > Date.now()) {
      try {
        currentValue = parseInt(cached.value, 10) || 0;
        expiry = cached.expiry;
      } catch {
        currentValue = 0;
      }
    }
    
    const newValue = currentValue + amount;
    memoryCache.set(key, { value: String(newValue), expiry });
    return newValue;
  }

  /**
   * Atomic decrement (for counters)
   * @param key - Cache key
   * @param amount - Amount to decrement by (default: 1)
   * @returns New value after decrement
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Get multiple keys at once
   * @param keys - Array of cache keys
   * @returns Array of parsed values (null for missing keys)
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return keys.map(key => {
      const cached = memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        try { return JSON.parse(cached.value) as T; } catch { return null; }
      }
      return null;
    });
  }

  /**
   * Set multiple keys at once with same TTL
   * @param entries - Array of [key, value] tuples
   * @param ttl - Time to live in seconds
   */
  async mset<T>(entries: [string, T][], ttl: number): Promise<void> {
    for (const [key, value] of entries) {
      const serialized = JSON.stringify(value);
      memoryCache.set(key, { value: serialized, expiry: Date.now() + (ttl * 1000) });
    }
  }

  /**
   * Set key with expiry at specific timestamp
   * @param key - Cache key
   * @param value - Data to cache
   * @param expiryTimestamp - Unix timestamp (seconds) when key should expire
   */
  async setWithExpiry<T>(key: string, value: T, expiryTimestamp: number): Promise<void> {
    const serialized = JSON.stringify(value);
    memoryCache.set(key, { value: serialized, expiry: expiryTimestamp * 1000 });
  }

  /**
   * Refresh TTL for existing key without changing value
   * @param key - Cache key
   * @param ttl - New TTL in seconds
   * @returns True if key exists and TTL was updated
   */
  async refreshTTL(key: string, ttl: number): Promise<boolean> {
    const cached = memoryCache.get(key);
    if (cached) {
      cached.expiry = Date.now() + (ttl * 1000);
      return true;
    }
    return false;
  }

  /**
   * Get all keys matching a pattern
   * @param pattern - Key pattern
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      const allKeys: string[] = [];
      for (const key of memoryCache.keys()) {
        if (regex.test(key)) {
          allKeys.push(key);
        }
      }
      return allKeys;
    } catch (error) {
      console.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Clear all cache
   * @returns True if successful
   */
  async clear(): Promise<boolean> {
    memoryCache.clear();
    return true;
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
    return {
      usedMemory: 'in-memory',
      totalKeys: memoryCache.size,
    };
  }

  /**
   * Ping to check connection - always returns true for in-memory
   * @returns True
   */
  async ping(): Promise<boolean> {
    return true;
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
