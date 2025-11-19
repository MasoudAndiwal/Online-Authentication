/**
 * Cache Key Patterns and TTL Configuration
 * Centralized configuration for all cache keys and their time-to-live values
 */

/**
 * Cache key pattern generators
 * These functions generate consistent cache keys across the application
 */
export const CACHE_KEYS = {
  // Student metrics cache keys
  STUDENT_METRICS: (studentId: string) => `metrics:student:${studentId}`,
  
  // Class statistics cache keys
  CLASS_AVERAGE: (classId: string) => `metrics:class:${classId}:average`,
  CLASS_STATISTICS: (classId: string) => `metrics:class:${classId}:stats`,
  
  // Student ranking cache keys
  STUDENT_RANKING: (classId: string, studentId: string) => 
    `metrics:class:${classId}:rank:${studentId}`,
  
  // Attendance data cache keys
  WEEKLY_ATTENDANCE: (studentId: string, week: number) => 
    `attendance:student:${studentId}:week:${week}`,
  ATTENDANCE_HISTORY: (studentId: string) => 
    `attendance:student:${studentId}:history`,
  
  // Rate limiting keys
  RATE_LIMIT: (userId: string, endpoint: string) => 
    `ratelimit:${endpoint}:${userId}`,
  
  // Session and authentication keys
  SESSION: (sessionId: string) => `session:${sessionId}`,
  USER_SESSION: (userId: string) => `session:user:${userId}`,
  
  // SSE connection tracking keys
  SSE_CONNECTION: (connectionId: string) => `sse:connection:${connectionId}`,
  SSE_STUDENT_CONNECTIONS: (studentId: string) => `sse:student:${studentId}`,
  SSE_CLASS_CONNECTIONS: (classId: string) => `sse:class:${classId}`,
  
  // Notification cache keys
  UNREAD_NOTIFICATIONS: (studentId: string) => `notifications:unread:${studentId}`,
  NOTIFICATION_PREFERENCES: (studentId: string) => `notifications:prefs:${studentId}`,
  
  // File metadata cache keys
  FILE_METADATA: (fileId: string) => `file:metadata:${fileId}`,
  STUDENT_FILES: (studentId: string) => `file:student:${studentId}`,
} as const;

/**
 * Cache TTL (Time-To-Live) configuration in seconds
 * These values determine how long data stays in cache before expiring
 */
export const CACHE_TTL = {
  // Metrics and statistics (frequently updated)
  STUDENT_METRICS: 120,           // 2 minutes
  CLASS_AVERAGE: 300,             // 5 minutes
  CLASS_STATISTICS: 300,          // 5 minutes
  STUDENT_RANKING: 300,           // 5 minutes
  
  // Attendance data (moderately updated)
  WEEKLY_ATTENDANCE: 300,         // 5 minutes
  ATTENDANCE_HISTORY: 600,        // 10 minutes
  
  // Rate limiting (short-lived)
  RATE_LIMIT: 60,                 // 1 minute
  
  // Sessions (long-lived)
  SESSION: 3600,                  // 1 hour
  USER_SESSION: 3600,             // 1 hour
  
  // SSE connections (short-lived)
  SSE_CONNECTION: 300,            // 5 minutes
  SSE_STUDENT_CONNECTIONS: 300,   // 5 minutes
  SSE_CLASS_CONNECTIONS: 300,     // 5 minutes
  
  // Notifications (moderately updated)
  UNREAD_NOTIFICATIONS: 60,       // 1 minute
  NOTIFICATION_PREFERENCES: 3600, // 1 hour
  
  // File metadata (rarely updated)
  FILE_METADATA: 1800,            // 30 minutes
  STUDENT_FILES: 600,             // 10 minutes
} as const;

/**
 * Cache key patterns for bulk operations
 * Used for pattern-based deletion and querying
 */
export const CACHE_PATTERNS = {
  // All student-related keys
  STUDENT_ALL: (studentId: string) => `*:student:${studentId}*`,
  
  // All class-related keys
  CLASS_ALL: (classId: string) => `*:class:${classId}*`,
  
  // All metrics keys
  METRICS_ALL: () => `metrics:*`,
  
  // All attendance keys
  ATTENDANCE_ALL: () => `attendance:*`,
  
  // All rate limit keys
  RATE_LIMIT_ALL: () => `ratelimit:*`,
  
  // All SSE connection keys
  SSE_ALL: () => `sse:*`,
  
  // All notification keys
  NOTIFICATIONS_ALL: () => `notifications:*`,
  
  // All file keys
  FILES_ALL: () => `file:*`,
} as const;

/**
 * Cache invalidation groups
 * Define which cache keys should be invalidated together
 */
export const CACHE_INVALIDATION_GROUPS = {
  // When attendance is updated, invalidate these keys
  ATTENDANCE_UPDATE: (studentId: string, classId: string) => [
    CACHE_KEYS.STUDENT_METRICS(studentId),
    CACHE_KEYS.CLASS_AVERAGE(classId),
    CACHE_KEYS.CLASS_STATISTICS(classId),
    CACHE_KEYS.STUDENT_RANKING(classId, studentId),
    CACHE_KEYS.ATTENDANCE_HISTORY(studentId),
  ],
  
  // When student data is updated, invalidate these keys
  STUDENT_UPDATE: (studentId: string) => [
    CACHE_KEYS.STUDENT_METRICS(studentId),
    CACHE_KEYS.ATTENDANCE_HISTORY(studentId),
    CACHE_KEYS.UNREAD_NOTIFICATIONS(studentId),
  ],
  
  // When class data is updated, invalidate these keys
  CLASS_UPDATE: (classId: string) => [
    CACHE_KEYS.CLASS_AVERAGE(classId),
    CACHE_KEYS.CLASS_STATISTICS(classId),
  ],
} as const;
