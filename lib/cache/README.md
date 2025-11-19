# Cache Service Documentation

## Overview

The Cache Service provides a centralized caching layer for the student dashboard system using Redis. It implements intelligent caching with TTL management, pattern-based operations, and automatic invalidation.

## Features

- **Type-safe operations**: All cache methods are fully typed with TypeScript generics
- **Automatic serialization**: JSON serialization/deserialization handled automatically
- **TTL management**: Configurable time-to-live for all cache entries
- **Pattern operations**: Bulk operations using Redis patterns
- **Connection pooling**: Efficient Redis connection management
- **Error handling**: Graceful error handling with fallbacks

## Installation

The cache service is already configured. To use it in your code:

```typescript
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

const cache = getCacheService();
```

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

For production, use a managed Redis service like Upstash:

```env
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
```

## Usage Examples

### Basic Operations

```typescript
import { getCacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

const cache = getCacheService();

// Set cache with TTL
await cache.set(
  CACHE_KEYS.STUDENT_METRICS('student-123'),
  { attendanceRate: 85, totalClasses: 100 },
  CACHE_TTL.STUDENT_METRICS
);

// Get cached data
const metrics = await cache.get(CACHE_KEYS.STUDENT_METRICS('student-123'));

// Delete cache
await cache.delete(CACHE_KEYS.STUDENT_METRICS('student-123'));
```

### Pattern-Based Operations

```typescript
import { getCacheService, CACHE_PATTERNS } from '@/lib/cache';

const cache = getCacheService();

// Delete all student-related cache
await cache.deletePattern(CACHE_PATTERNS.STUDENT_ALL('student-123'));

// Delete all metrics cache
await cache.deletePattern(CACHE_PATTERNS.METRICS_ALL());

// Get all keys matching pattern
const keys = await cache.keys('metrics:student:*');
```

### Batch Operations

```typescript
// Get multiple keys at once
const studentIds = ['student-1', 'student-2', 'student-3'];
const keys = studentIds.map(id => CACHE_KEYS.STUDENT_METRICS(id));
const metrics = await cache.mget(keys);

// Set multiple keys at once
const entries = studentIds.map(id => [
  CACHE_KEYS.STUDENT_METRICS(id),
  { attendanceRate: 85, totalClasses: 100 }
]);
await cache.mset(entries, CACHE_TTL.STUDENT_METRICS);
```

### Cache Invalidation

```typescript
import { getCacheService, CACHE_INVALIDATION_GROUPS } from '@/lib/cache';

const cache = getCacheService();

// When attendance is updated, invalidate related caches
const keysToInvalidate = CACHE_INVALIDATION_GROUPS.ATTENDANCE_UPDATE(
  'student-123',
  'class-456'
);

for (const key of keysToInvalidate) {
  await cache.delete(key);
}
```

### Counter Operations

```typescript
// Increment rate limit counter
const count = await cache.increment(
  CACHE_KEYS.RATE_LIMIT('user-123', 'dashboard'),
  1
);

// Check if limit exceeded
if (count > 100) {
  // Rate limit exceeded
}
```

### TTL Management

```typescript
// Check remaining TTL
const ttl = await cache.ttl(CACHE_KEYS.STUDENT_METRICS('student-123'));

if (ttl < 60) {
  // Cache expires in less than 1 minute, refresh it
  await cache.refreshTTL(
    CACHE_KEYS.STUDENT_METRICS('student-123'),
    CACHE_TTL.STUDENT_METRICS
  );
}
```

## Cache Keys

All cache keys are defined in `CACHE_KEYS` constant:

```typescript
CACHE_KEYS.STUDENT_METRICS(studentId)
CACHE_KEYS.CLASS_AVERAGE(classId)
CACHE_KEYS.STUDENT_RANKING(classId, studentId)
CACHE_KEYS.WEEKLY_ATTENDANCE(studentId, week)
CACHE_KEYS.RATE_LIMIT(userId, endpoint)
// ... and more
```

## Cache TTL Values

TTL values are configured in `CACHE_TTL` constant (in seconds):

```typescript
CACHE_TTL.STUDENT_METRICS = 120      // 2 minutes
CACHE_TTL.CLASS_AVERAGE = 300        // 5 minutes
CACHE_TTL.WEEKLY_ATTENDANCE = 300    // 5 minutes
CACHE_TTL.SESSION = 3600             // 1 hour
// ... and more
```

## Cache Patterns

Pattern constants for bulk operations:

```typescript
CACHE_PATTERNS.STUDENT_ALL(studentId)  // All student-related keys
CACHE_PATTERNS.CLASS_ALL(classId)      // All class-related keys
CACHE_PATTERNS.METRICS_ALL()           // All metrics keys
CACHE_PATTERNS.ATTENDANCE_ALL()        // All attendance keys
```

## Error Handling

The cache service handles errors gracefully:

- **Get operations**: Return `null` on error
- **Delete operations**: Return `0` on error
- **Set operations**: Throw error (should be caught by caller)

```typescript
try {
  await cache.set('key', data, 300);
} catch (error) {
  console.error('Cache set failed:', error);
  // Continue without cache
}

// Get operations don't throw
const data = await cache.get('key'); // Returns null on error
```

## Health Checks

```typescript
// Check if Redis is connected
const connected = await cache.ping();

if (!connected) {
  console.error('Redis is not connected');
}

// Get cache statistics
const stats = await cache.getStats();
console.log('Cache stats:', stats);
// { usedMemory: '1.5M', totalKeys: 1234 }
```

## Best Practices

1. **Always use predefined cache keys**: Use `CACHE_KEYS` constants instead of hardcoding keys
2. **Set appropriate TTL**: Use `CACHE_TTL` constants for consistency
3. **Invalidate on updates**: Always invalidate related cache when data changes
4. **Handle cache misses**: Always have fallback logic when cache returns null
5. **Use batch operations**: Use `mget`/`mset` for multiple keys to reduce round trips
6. **Monitor cache health**: Regularly check cache statistics and connection status

## Testing

The cache service includes comprehensive unit tests. Run them with:

```bash
npm test
```

For property-based tests (testing cache behavior with random inputs):

```bash
npm test -- cache-service.property.test.ts
```

## Performance Considerations

- **Cache hit rate**: Aim for >80% cache hit rate
- **Memory usage**: Monitor Redis memory usage
- **TTL tuning**: Adjust TTL values based on data update frequency
- **Pattern operations**: Use sparingly as they can be expensive on large datasets

## Troubleshooting

### Redis Connection Issues

If you see connection errors:

1. Check Redis is running: `redis-cli ping`
2. Verify environment variables in `.env`
3. Check firewall/network settings
4. For Upstash, verify credentials and region

### Cache Not Working

If cache operations fail silently:

1. Check Redis connection: `await cache.ping()`
2. Check Redis logs for errors
3. Verify TTL values are positive
4. Check Redis memory limits

### Performance Issues

If cache operations are slow:

1. Check Redis server load
2. Reduce pattern operation usage
3. Use batch operations (`mget`/`mset`)
4. Consider Redis cluster for high load

## Related Documentation

- [Redis Configuration](../config/redis.ts)
- [Cache Configuration](../config/cache-config.ts)
- [Cache Service Implementation](../services/cache-service.ts)
