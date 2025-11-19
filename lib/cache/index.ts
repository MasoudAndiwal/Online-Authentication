/**
 * Cache Module
 * Exports all cache-related functionality
 */

// Export cache service
export { CacheService, getCacheService } from '../services/cache-service';

// Export cache configuration
export { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS, CACHE_INVALIDATION_GROUPS } from '../config/cache-config';

// Export Redis client utilities
export { 
  getRedisClient, 
  closeRedisConnection, 
  isRedisConnected, 
  pingRedis 
} from '../config/redis';
