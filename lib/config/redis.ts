/**
 * Redis Configuration Stub
 * Redis has been removed from this project.
 * All caching now uses in-memory fallback.
 */

/**
 * Get Redis client - always throws to trigger fallback
 * @throws Always throws to use in-memory fallback
 */
export function getRedisClient(): never {
  throw new Error('Redis is not available - using in-memory cache fallback');
}

/**
 * Close Redis connection - no-op since Redis is removed
 */
export async function closeRedisConnection(): Promise<void> {
  // No-op - Redis is not used
}

/**
 * Check if Redis is connected - always returns false
 */
export function isRedisConnected(): boolean {
  return false;
}

/**
 * Ping Redis - always returns false
 */
export async function pingRedis(): Promise<boolean> {
  return false;
}

// Export the client getter as default
export default getRedisClient;
