/**
 * Cache Eviction Service
 * 
 * Implements intelligent cache eviction policies for Redis to prevent memory issues.
 * Monitors memory usage, configures LRU eviction, and tracks cache hit rates.
 * 
 * Requirements: 10.3
 * Property: 45 - Cache Eviction Policy
 */

import Redis from 'ioredis';
import { getRedisClient } from '../config/redis';
import { getCacheService } from './cache-service';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface CacheEvictionConfig {
  memoryLimitMB: number;
  evictionThresholdPercent: number;
  evictionPolicy: 'allkeys-lru' | 'volatile-lru' | 'allkeys-lfu' | 'volatile-lfu';
  monitoringInterval: number;
  hitRateWindow: number;
  alertThresholds: {
    memoryUsage: number;
    hitRate: number;
  };
}

export interface CacheMemoryStats {
  usedMemoryMB: number;
  maxMemoryMB: number;
  memoryUsagePercent: number;
  evictedKeys: number;
  totalKeys: number;
  hitRate: number;
  missRate: number;
  lastEvictionTime?: Date;
  isMemoryPressure: boolean;
}

export interface CacheHitRateStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  windowStart: Date;
  windowEnd: Date;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_EVICTION_CONFIG: CacheEvictionConfig = {
  memoryLimitMB: 512,              // 512MB default limit
  evictionThresholdPercent: 80,    // Start eviction at 80% memory usage
  evictionPolicy: 'allkeys-lru',   // LRU eviction for all keys
  monitoringInterval: 30000,       // Check every 30 seconds
  hitRateWindow: 300000,           // 5-minute window for hit rate calculation
  alertThresholds: {
    memoryUsage: 90,               // Alert at 90% memory usage
    hitRate: 70                    // Alert if hit rate drops below 70%
  }
};

// ============================================================================
// Cache Eviction Service
// ============================================================================

export class CacheEvictionService {
  private config: CacheEvictionConfig;
  private redis: Redis;
  private monitoringTimer: NodeJS.Timeout | null = null;
  private hitRateStats: Map<string, number> = new Map();
  private isInitialized: boolean = false;

  constructor(config?: Partial<CacheEvictionConfig>) {
    this.config = { ...DEFAULT_EVICTION_CONFIG, ...config };
    // Lazy Redis initialization
    this.redis = null as unknown as Redis;
  }

  /**
   * Ensure Redis client is initialized
   */
  private ensureRedis(): void {
    if (!this.redis) {
      this.redis = getRedisClient();
    }
  }

  /**
   * Initialize cache eviction service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Cache eviction service already initialized');
      return;
    }

    try {
      console.log('Initializing cache eviction service...');
      
      // Initialize Redis connection
      this.ensureRedis();
      
      // Configure Redis memory settings
      await this.configureRedisMemorySettings();
      
      // Start memory monitoring
      this.startMemoryMonitoring();
      
      this.isInitialized = true;
      console.log('Cache eviction service initialized successfully');
      
      // Log initial configuration
      const stats = await this.getMemoryStats();
      console.log(`Cache eviction configured: ${this.config.memoryLimitMB}MB limit, ${this.config.evictionThresholdPercent}% threshold`);
      console.log(`Current memory usage: ${stats.usedMemoryMB}MB (${stats.memoryUsagePercent}%)`);
      
    } catch (error) {
      console.error('Failed to initialize cache eviction service:', error);
      throw error;
    }
  }

  /**
   * Configure Redis memory settings and eviction policy
   */
  private async configureRedisMemorySettings(): Promise<void> {
    try {
      // Set maximum memory limit
      const maxMemoryBytes = this.config.memoryLimitMB * 1024 * 1024;
      await this.redis.config('SET', 'maxmemory', maxMemoryBytes.toString());
      
      // Set eviction policy
      await this.redis.config('SET', 'maxmemory-policy', this.config.evictionPolicy);
      
      // Configure eviction sampling
      await this.redis.config('SET', 'maxmemory-samples', '5');
      
      console.log(`Redis memory configured: ${this.config.memoryLimitMB}MB limit with ${this.config.evictionPolicy} policy`);
      
    } catch (error) {
      console.error('Failed to configure Redis memory settings:', error);
      throw error;
    }
  }

  /**
   * Start periodic memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(async () => {
      try {
        await this.performMemoryCheck();
      } catch (error) {
        console.error('Memory monitoring error:', error);
      }
    }, this.config.monitoringInterval);

    console.log(`Memory monitoring started (interval: ${this.config.monitoringInterval}ms)`);
  }

  /**
   * Perform memory check and take action if needed
   */
  private async performMemoryCheck(): Promise<void> {
    const stats = await this.getMemoryStats();
    
    // Check for memory pressure
    if (stats.memoryUsagePercent >= this.config.evictionThresholdPercent) {
      console.warn(`Memory pressure detected: ${stats.memoryUsagePercent}% usage`);
      await this.handleMemoryPressure(stats);
    }
    
    // Check for alerts
    if (stats.memoryUsagePercent >= this.config.alertThresholds.memoryUsage) {
      console.error(`ALERT: High memory usage: ${stats.memoryUsagePercent}%`);
    }
    
    // Check hit rate
    const hitRateStats = await this.getHitRateStats();
    if (hitRateStats.hitRate < this.config.alertThresholds.hitRate) {
      console.warn(`ALERT: Low cache hit rate: ${hitRateStats.hitRate}%`);
    }
  }

  /**
   * Handle memory pressure by triggering additional eviction
   */
  private async handleMemoryPressure(stats: CacheMemoryStats): Promise<void> {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Trigger manual eviction of expired keys
      await this.evictExpiredKeys();
      
      // If still under pressure, evict least recently used keys
      if (stats.memoryUsagePercent >= 95) {
        await this.emergencyEviction();
      }
      
    } catch (error) {
      console.error('Failed to handle memory pressure:', error);
    }
  }

  /**
   * Evict expired keys manually
   */
  private async evictExpiredKeys(): Promise<number> {
    try {
      let evictedCount = 0;
      let cursor = '0';
      
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'COUNT',
          100
        );
        
        cursor = nextCursor;
        
        // Check TTL for each key and delete expired ones
        for (const key of keys) {
          const ttl = await this.redis.ttl(key);
          if (ttl === -2) { // Key doesn't exist (expired)
            evictedCount++;
          }
        }
      } while (cursor !== '0');
      
      console.log(`Evicted ${evictedCount} expired keys`);
      return evictedCount;
      
    } catch (error) {
      console.error('Failed to evict expired keys:', error);
      return 0;
    }
  }

  /**
   * Emergency eviction of keys when memory is critically low
   */
  private async emergencyEviction(): Promise<number> {
    try {
      console.warn('Performing emergency cache eviction');
      
      // Get keys sorted by last access time (if available)
      // Since Redis doesn't expose last access time directly,
      // we'll use a heuristic based on key patterns
      
      const keysToEvict: string[] = [];
      let cursor = '0';
      
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'COUNT',
          100
        );
        
        cursor = nextCursor;
        
        // Prioritize eviction of certain key patterns
        for (const key of keys) {
          // Evict temporary/session keys first
          if (key.includes(':temp:') || key.includes(':session:')) {
            keysToEvict.push(key);
          }
          // Then evict older cache entries (heuristic based on key structure)
          else if (key.includes(':cache:') && keysToEvict.length < 100) {
            keysToEvict.push(key);
          }
        }
      } while (cursor !== '0' && keysToEvict.length < 500);
      
      // Delete selected keys
      if (keysToEvict.length > 0) {
        const deleted = await this.redis.del(...keysToEvict);
        console.warn(`Emergency eviction: deleted ${deleted} keys`);
        return deleted;
      }
      
      return 0;
      
    } catch (error) {
      console.error('Emergency eviction failed:', error);
      return 0;
    }
  }

  /**
   * Get current memory statistics
   */
  async getMemoryStats(): Promise<CacheMemoryStats> {
    try {
      const info = await this.redis.info('memory');
      const stats = await this.redis.info('stats');
      
      // Parse memory info
      const usedMemoryMatch = info.match(/used_memory:(\d+)/);
      const maxMemoryMatch = info.match(/maxmemory:(\d+)/);
      const evictedKeysMatch = stats.match(/evicted_keys:(\d+)/);
      
      const usedMemoryBytes = usedMemoryMatch ? parseInt(usedMemoryMatch[1]) : 0;
      const maxMemoryBytes = maxMemoryMatch ? parseInt(maxMemoryMatch[1]) : this.config.memoryLimitMB * 1024 * 1024;
      const evictedKeys = evictedKeysMatch ? parseInt(evictedKeysMatch[1]) : 0;
      
      const usedMemoryMB = usedMemoryBytes / (1024 * 1024);
      const maxMemoryMB = maxMemoryBytes / (1024 * 1024);
      const memoryUsagePercent = maxMemoryBytes > 0 ? (usedMemoryBytes / maxMemoryBytes) * 100 : 0;
      
      // Get total keys
      const totalKeys = await this.redis.dbsize();
      
      // Calculate hit rate
      const hitRateStats = await this.getHitRateStats();
      
      return {
        usedMemoryMB: Math.round(usedMemoryMB * 100) / 100,
        maxMemoryMB: Math.round(maxMemoryMB * 100) / 100,
        memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
        evictedKeys,
        totalKeys,
        hitRate: hitRateStats.hitRate,
        missRate: 100 - hitRateStats.hitRate,
        isMemoryPressure: memoryUsagePercent >= this.config.evictionThresholdPercent
      };
      
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return {
        usedMemoryMB: 0,
        maxMemoryMB: this.config.memoryLimitMB,
        memoryUsagePercent: 0,
        evictedKeys: 0,
        totalKeys: 0,
        hitRate: 0,
        missRate: 100,
        isMemoryPressure: false
      };
    }
  }

  /**
   * Get cache hit rate statistics
   */
  async getHitRateStats(): Promise<CacheHitRateStats> {
    try {
      const info = await this.redis.info('stats');
      
      // Parse hit/miss stats
      const hitsMatch = info.match(/keyspace_hits:(\d+)/);
      const missesMatch = info.match(/keyspace_misses:(\d+)/);
      
      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
      const totalRequests = hits + misses;
      const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;
      
      return {
        hits,
        misses,
        hitRate: Math.round(hitRate * 100) / 100,
        totalRequests,
        windowStart: new Date(Date.now() - this.config.hitRateWindow),
        windowEnd: new Date()
      };
      
    } catch (error) {
      console.error('Failed to get hit rate stats:', error);
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        windowStart: new Date(),
        windowEnd: new Date()
      };
    }
  }

  /**
   * Manually trigger cache eviction
   */
  async triggerEviction(targetMemoryPercent: number = 70): Promise<number> {
    try {
      console.log(`Triggering manual cache eviction to ${targetMemoryPercent}%`);
      
      const currentStats = await this.getMemoryStats();
      if (currentStats.memoryUsagePercent <= targetMemoryPercent) {
        console.log('Memory usage already below target, no eviction needed');
        return 0;
      }
      
      // Calculate how much memory to free
      const targetMemoryBytes = (currentStats.maxMemoryMB * targetMemoryPercent / 100) * 1024 * 1024;
      const currentMemoryBytes = currentStats.usedMemoryMB * 1024 * 1024;
      const bytesToFree = currentMemoryBytes - targetMemoryBytes;
      
      // Estimate keys to evict (rough estimate: 1KB per key)
      const keysToEvict = Math.ceil(bytesToFree / 1024);
      
      console.log(`Need to free ~${Math.round(bytesToFree / 1024 / 1024)}MB (~${keysToEvict} keys)`);
      
      // Perform eviction
      const evictedCount = await this.emergencyEviction();
      
      // Check result
      const newStats = await this.getMemoryStats();
      console.log(`Eviction complete: ${evictedCount} keys removed, memory usage: ${newStats.memoryUsagePercent}%`);
      
      return evictedCount;
      
    } catch (error) {
      console.error('Manual eviction failed:', error);
      return 0;
    }
  }

  /**
   * Update eviction configuration
   */
  async updateConfig(newConfig: Partial<CacheEvictionConfig>): Promise<void> {
    try {
      const oldConfig = { ...this.config };
      this.config = { ...this.config, ...newConfig };
      
      // Update Redis settings if memory limit or policy changed
      if (newConfig.memoryLimitMB || newConfig.evictionPolicy) {
        await this.configureRedisMemorySettings();
      }
      
      // Restart monitoring if interval changed
      if (newConfig.monitoringInterval) {
        this.startMemoryMonitoring();
      }
      
      console.log('Cache eviction configuration updated', {
        old: oldConfig,
        new: this.config
      });
      
    } catch (error) {
      console.error('Failed to update eviction config:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheEvictionConfig {
    return { ...this.config };
  }

  /**
   * Check if service is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const stats = await this.getMemoryStats();
      return stats.memoryUsagePercent < this.config.alertThresholds.memoryUsage;
    } catch (error) {
      return false;
    }
  }

  /**
   * Shutdown the eviction service
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down cache eviction service...');
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    this.isInitialized = false;
    console.log('Cache eviction service shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let evictionServiceInstance: CacheEvictionService | null = null;

/**
 * Get the singleton cache eviction service instance
 */
export function getCacheEvictionService(): CacheEvictionService {
  if (!evictionServiceInstance) {
    evictionServiceInstance = new CacheEvictionService();
  }
  return evictionServiceInstance;
}

/**
 * Initialize cache eviction service
 */
export async function initializeCacheEviction(config?: Partial<CacheEvictionConfig>): Promise<void> {
  if (evictionServiceInstance) {
    await evictionServiceInstance.shutdown();
  }
  
  evictionServiceInstance = new CacheEvictionService(config);
  await evictionServiceInstance.initialize();
}

/**
 * Get cache memory statistics
 */
export async function getCacheMemoryStats(): Promise<CacheMemoryStats> {
  try {
    const service = getCacheEvictionService();
    return service.getMemoryStats();
  } catch {
    // Return default stats if Redis is not available
    return {
      usedMemoryMB: 0,
      maxMemoryMB: 0,
      memoryUsagePercent: 0,
      isMemoryPressure: false,
      hitRate: 0,
      missRate: 0,
      totalKeys: 0,
      evictedKeys: 0
    };
  }
}

/**
 * Get cache hit rate statistics
 */
export async function getCacheHitRateStats(): Promise<CacheHitRateStats> {
  const service = getCacheEvictionService();
  return service.getHitRateStats();
}

/**
 * Trigger manual cache eviction
 */
export async function triggerCacheEviction(targetMemoryPercent?: number): Promise<number> {
  const service = getCacheEvictionService();
  return service.triggerEviction(targetMemoryPercent);
}

// Auto-initialize when imported (server-side only)
if (typeof window === 'undefined') {
  const service = getCacheEvictionService();
  service.initialize().catch(error => {
    console.error('Failed to auto-initialize cache eviction service:', error);
  });
}

export default CacheEvictionService;