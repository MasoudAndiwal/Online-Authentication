import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis Configuration
 * Implements connection pooling and error handling for Redis cache
 */

// Check if Redis is enabled via environment variable
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

// Redis connection options with pooling and error handling
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  
  // Connection pooling configuration
  maxRetriesPerRequest: 1, // Reduced to fail fast
  enableReadyCheck: true,
  enableOfflineQueue: false, // Don't queue commands when offline
  
  // Reconnection strategy - stop after 3 attempts if Redis is not available
  retryStrategy(times: number) {
    if (times > 3) {
      console.warn('Redis not available after 3 attempts, using in-memory cache fallback');
      return null; // Stop reconnecting
    }
    const delay = Math.min(times * 500, 2000);
    console.log(`Redis reconnection attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  
  // Connection timeout - reduced for faster fallback
  connectTimeout: 3000,
  
  // Keep-alive
  keepAlive: 30000,
  
  // Lazy connect - don't connect until first command
  lazyConnect: true, // Changed to true to avoid connection on startup
};

// Create Redis client instance
let redisClient: Redis | null = null;

// Track if Redis has failed to connect
let redisConnectionFailed = false;

/**
 * Get or create Redis client instance (singleton pattern)
 * Throws error if Redis is not available (caller should handle fallback)
 */
export function getRedisClient(): Redis {
  // If Redis has already failed, throw immediately to use fallback
  if (redisConnectionFailed) {
    throw new Error('Redis connection previously failed, using fallback');
  }

  // If Redis is explicitly disabled, throw to use fallback
  if (!REDIS_ENABLED) {
    throw new Error('Redis is disabled via REDIS_ENABLED environment variable');
  }

  if (!redisClient) {
    redisClient = new Redis(redisOptions);
    
    // Event handlers for connection monitoring (reduced logging)
    redisClient.on('connect', () => {
      console.log('Redis client connected');
      redisConnectionFailed = false;
    });
    
    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });
    
    redisClient.on('error', (error: Error & { code?: string }) => {
      // Only log once, not on every reconnection attempt
      if (!redisConnectionFailed) {
        console.warn('Redis connection error, falling back to in-memory cache:', error.code || error.message);
        redisConnectionFailed = true;
      }
    });
    
    redisClient.on('end', () => {
      console.log('Redis client connection ended');
      redisConnectionFailed = true;
    });
  }
  
  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed gracefully');
  }
}

/**
 * Check if Redis is connected and ready
 */
export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}

/**
 * Ping Redis to check connection health
 */
export async function pingRedis(): Promise<boolean> {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis ping failed:', error);
    return false;
  }
}

// Export the client getter as default
export default getRedisClient;
