import Redis, { RedisOptions } from 'ioredis';

/**
 * Redis Configuration
 * Implements connection pooling and error handling for Redis cache
 */

// Redis connection options with pooling and error handling
const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  
  // Connection pooling configuration
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  
  // Reconnection strategy
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    console.log(`Redis reconnection attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  
  // Connection timeout
  connectTimeout: 10000,
  
  // Keep-alive
  keepAlive: 30000,
  
  // Lazy connect - don't connect until first command
  lazyConnect: false,
};

// Create Redis client instance
let redisClient: Redis | null = null;

/**
 * Get or create Redis client instance (singleton pattern)
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisOptions);
    
    // Event handlers for connection monitoring
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis client error:', error);
    });
    
    redisClient.on('close', () => {
      console.log('Redis client connection closed');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting');
    });
    
    redisClient.on('end', () => {
      console.log('Redis client connection ended');
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
