# Design Document

## Overview

This design document outlines the enhanced backend architecture for the student dashboard system. The solution implements enterprise-grade features including Redis caching, real-time updates via Server-Sent Events, materialized database views, rate limiting, audit logging, offline support, secure file storage, and automated notifications.

The architecture follows a layered approach with clear separation of concerns:
- **API Layer**: Next.js API routes with middleware for authentication, rate limiting, and validation
- **Service Layer**: Business logic encapsulated in reusable service classes
- **Data Layer**: PostgreSQL with Supabase, Redis cache, and Supabase Storage
- **Background Jobs**: Asynchronous task processing for notifications and cache management
- **Real-time Layer**: SSE connections for live attendance updates

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React Query  │  │ SSE Client   │  │ LocalStorage │      │
│  │ (State Mgmt) │  │ (Real-time)  │  │ (Offline)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes                                   │   │
│  │  - /api/students/dashboard (GET)                      │   │
│  │  - /api/students/attendance/weekly (GET)              │   │
│  │  - /api/students/notifications/sse (GET)              │   │
│  │  - /api/students/files/upload (POST)                  │   │
│  │  - /api/students/export (GET)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                     │   │
│  │  1. Authentication (JWT/Session validation)           │   │
│  │  2. Rate Limiting (Redis-based)                       │   │
│  │  3. Request Validation (Zod schemas)                  │   │
│  │  4. Error Handling (Structured responses)             │   │
│  │  5. Audit Logging (Critical actions)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Service Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Cache Service   │  │ Dashboard       │  │ Notification│ │
│  │ - Get/Set       │  │ Service         │  │ Service     │ │
│  │ - Invalidate    │  │ - Metrics calc  │  │ - Send      │ │
│  │ - TTL mgmt      │  │ - Stats agg     │  │ - Queue     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ File Service    │  │ SSE Service     │  │ Audit       │ │
│  │ - Upload        │  │ - Connections   │  │ Service     │ │
│  │ - Scan          │  │ - Broadcast     │  │ - Log       │ │
│  │ - Generate URLs │  │ - Cleanup       │  │ - Archive   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                  │
┌───────▼──────────┐            ┌─────────▼────────┐
│  Redis Cache     │            │  Service Layer   │
│  ┌────────────┐  │            │  ┌────────────┐  │
│  │ Metrics    │  │            │  │ Rate Limit │  │
│  │ Rankings   │  │            │  │ Counters   │  │
│  │ Sessions   │  │            │  │ SSE Subs   │  │
│  └────────────┘  │            │  └────────────┘  │
│                  │            │                  │
│  TTL: 2-10 min   │            │  Distributed     │
└──────────────────┘            └──────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────┐
│              Data Persistence Layer                       │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ Supabase         │  │ Supabase Storage │             │
│  │ PostgreSQL       │  │                  │             │
│  │                  │  │ ┌──────────────┐ │             │
│  │ Tables:          │  │ │ Medical      │ │             │
│  │ - students       │  │ │ Certificates │ │             │
│  │ - attendance_*   │  │ └──────────────┘ │             │
│  │ - audit_logs     │  │                  │             │
│  │ - notifications  │  │ Virus Scanning   │             │
│  │                  │  │ Signed URLs      │             │
│  │ Materialized     │  │ CDN Delivery     │             │
│  │ Views:           │  │                  │             │
│  │ - class_stats    │  └──────────────────┘             │
│  │ - student_ranks  │                                    │
│  └──────────────────┘                                    │
└───────────────────────────────────────────────────────────┘
        │
        │
┌───────▼──────────────────────────────────────────────────┐
│           Background Job Processor                        │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ Notification Job │  │ Cache Refresh    │             │
│  │ - Check          │  │ - Materialized   │             │
│  │   thresholds     │  │   views          │             │
│  │ - Queue emails   │  │ - Warm cache     │             │
│  │ - Send in-app    │  │ - Cleanup old    │             │
│  │   alerts         │  │   data           │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
│  Cron Schedule:                                           │
│  - Every 1 hour: Check attendance thresholds              │
│  - Every 10 min: Refresh materialized views               │
│  - Every 5 min: Warm frequently accessed cache            │
│  - Daily: Archive old audit logs                          │
└───────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js 18+ with Next.js 14
- **Database**: PostgreSQL 15+ (via Supabase)
- **Cache**: Redis 7+ (Upstash or self-hosted)
- **Storage**: Supabase Storage with CDN
- **Real-time**: Server-Sent Events (native)
- **Background Jobs**: Node-cron or BullMQ
- **Validation**: Zod schemas
- **Testing**: Vitest with fast-check for property-based testing

## Components and Interfaces

### 1. Cache Service

**Purpose**: Centralized caching layer for all dashboard data with intelligent invalidation.

```typescript
interface CacheService {
  // Get cached data with automatic deserialization
  get<T>(key: string): Promise<T | null>
  
  // Set cache with TTL (time-to-live in seconds)
  set<T>(key: string, value: T, ttl: number): Promise<void>
  
  // Delete specific cache key
  delete(key: string): Promise<void>
  
  // Delete multiple keys matching pattern
  deletePattern(pattern: string): Promise<number>
  
  // Check if key exists
  exists(key: string): Promise<boolean>
  
  // Get remaining TTL for key
  ttl(key: string): Promise<number>
  
  // Atomic increment (for counters)
  increment(key: string, amount?: number): Promise<number>
  
  // Get multiple keys at once
  mget<T>(keys: string[]): Promise<(T | null)[]>
}

// Cache key patterns
const CACHE_KEYS = {
  STUDENT_METRICS: (studentId: string) => `metrics:student:${studentId}`,
  CLASS_AVERAGE: (classId: string) => `metrics:class:${classId}:average`,
  STUDENT_RANKING: (classId: string, studentId: string) => 
    `metrics:class:${classId}:rank:${studentId}`,
  WEEKLY_ATTENDANCE: (studentId: string, week: number) => 
    `attendance:student:${studentId}:week:${week}`,
  RATE_LIMIT: (userId: string, endpoint: string) => 
    `ratelimit:${endpoint}:${userId}`,
}

// Cache TTL configuration (in seconds)
const CACHE_TTL = {
  STUDENT_METRICS: 120,      // 2 minutes
  CLASS_AVERAGE: 300,        // 5 minutes
  WEEKLY_ATTENDANCE: 300,    // 5 minutes
  RATE_LIMIT: 60,            // 1 minute
  SESSION: 3600,             // 1 hour
}
```

### 2. Dashboard Service

**Purpose**: Business logic for calculating and aggregating student dashboard metrics.

```typescript
interface DashboardService {
  // Get complete dashboard metrics for a student
  getStudentMetrics(studentId: string): Promise<StudentDashboardMetrics>
  
  // Get class statistics and rankings
  getClassStatistics(classId: string): Promise<ClassStatistics>
  
  // Get student ranking within class
  getStudentRanking(studentId: string, classId: string): Promise<StudentRanking>
  
  // Invalidate cache when attendance is updated
  invalidateStudentCache(studentId: string): Promise<void>
  
  // Invalidate class cache when any student's attendance changes
  invalidateClassCache(classId: string): Promise<void>
  
  // Warm cache with frequently accessed data
  warmCache(studentIds: string[]): Promise<void>
}

interface StudentDashboardMetrics {
  totalClasses: number
  attendanceRate: number
  presentDays: number
  absentDays: number
  sickDays: number
  leaveDays: number
  classAverage: number
  ranking: number
  trend: 'improving' | 'declining' | 'stable'
  lastUpdated: Date
}

interface ClassStatistics {
  classId: string
  totalStudents: number
  averageAttendance: number
  medianAttendance: number
  highestAttendance: number
  lowestAttendance: number
  studentsAtRisk: number  // Below 75%
  lastCalculated: Date
}

interface StudentRanking {
  studentId: string
  rank: number
  totalStudents: number
  percentile: number
  attendanceRate: number
}
```

### 3. SSE Service

**Purpose**: Manage Server-Sent Events connections for real-time attendance updates.

```typescript
interface SSEService {
  // Create new SSE connection for a student
  createConnection(studentId: string, response: Response): SSEConnection
  
  // Send update to specific student
  sendToStudent(studentId: string, event: SSEEvent): Promise<void>
  
  // Broadcast update to all students in a class
  broadcastToClass(classId: string, event: SSEEvent): Promise<void>
  
  // Close connection and cleanup
  closeConnection(connectionId: string): Promise<void>
  
  // Get active connection count
  getActiveConnections(): Promise<number>
  
  // Cleanup stale connections
  cleanupStaleConnections(): Promise<number>
}

interface SSEConnection {
  id: string
  studentId: string
  createdAt: Date
  lastPing: Date
  send(event: SSEEvent): void
  close(): void
}

interface SSEEvent {
  type: 'attendance_update' | 'metrics_update' | 'notification' | 'ping'
  data: any
  timestamp: Date
}

// SSE event types
type AttendanceUpdateEvent = {
  type: 'attendance_update'
  data: {
    date: string
    period: number
    status: 'present' | 'absent' | 'sick' | 'leave'
    subject: string
    markedBy: string
  }
}

type MetricsUpdateEvent = {
  type: 'metrics_update'
  data: StudentDashboardMetrics
}

type NotificationEvent = {
  type: 'notification'
  data: {
    id: string
    title: string
    message: string
    severity: 'info' | 'warning' | 'error'
  }
}
```

### 4. Rate Limiter Service

**Purpose**: Protect API endpoints from abuse with configurable rate limits.

```typescript
interface RateLimiterService {
  // Check if request is allowed
  checkLimit(userId: string, endpoint: string): Promise<RateLimitResult>
  
  // Record a request
  recordRequest(userId: string, endpoint: string): Promise<void>
  
  // Get current usage for user
  getUsage(userId: string, endpoint: string): Promise<RateLimitUsage>
  
  // Reset limits for user (admin function)
  resetLimits(userId: string): Promise<void>
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  retryAfter?: number  // Seconds until next allowed request
}

interface RateLimitUsage {
  requests: number
  limit: number
  windowStart: Date
  windowEnd: Date
}

// Rate limit configuration
const RATE_LIMITS = {
  DASHBOARD: {
    requests: 100,
    window: 60,  // seconds
  },
  EXPORT: {
    requests: 5,
    window: 3600,  // 1 hour
  },
  UPLOAD: {
    requests: 10,
    window: 3600,  // 1 hour
  },
  SSE: {
    requests: 10,
    window: 60,  // connections per minute
  },
}
```

### 5. File Storage Service

**Purpose**: Secure file upload, storage, and retrieval for medical certificates.

```typescript
interface FileStorageService {
  // Upload file with validation and virus scanning
  uploadFile(file: File, studentId: string, metadata: FileMetadata): Promise<UploadResult>
  
  // Generate signed URL for file access
  getSignedUrl(fileId: string, expiresIn: number): Promise<string>
  
  // Delete file
  deleteFile(fileId: string): Promise<void>
  
  // Get file metadata
  getFileMetadata(fileId: string): Promise<StoredFileMetadata>
  
  // List files for student
  listStudentFiles(studentId: string): Promise<StoredFileMetadata[]>
  
  // Update file status (after review)
  updateFileStatus(fileId: string, status: FileStatus, reason?: string): Promise<void>
}

interface FileMetadata {
  fileName: string
  fileType: string
  fileSize: number
  description?: string
}

interface UploadResult {
  fileId: string
  fileName: string
  fileSize: number
  uploadedAt: Date
  status: 'pending' | 'scanning' | 'approved' | 'rejected'
  signedUrl: string
}

interface StoredFileMetadata extends FileMetadata {
  fileId: string
  studentId: string
  uploadedAt: Date
  status: FileStatus
  rejectionReason?: string
  scanResult?: VirusScanResult
}

type FileStatus = 'pending' | 'scanning' | 'approved' | 'rejected' | 'quarantined'

interface VirusScanResult {
  clean: boolean
  threats: string[]
  scannedAt: Date
}

// File validation rules
const FILE_RULES = {
  MAX_SIZE: 10 * 1024 * 1024,  // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
}
```

### 6. Notification Service

**Purpose**: Send automated notifications based on attendance thresholds and events.

```typescript
interface NotificationService {
  // Send notification to student
  sendNotification(studentId: string, notification: Notification): Promise<void>
  
  // Queue notification for batch processing
  queueNotification(notification: Notification): Promise<void>
  
  // Get unread notifications for student
  getUnreadNotifications(studentId: string): Promise<Notification[]>
  
  // Mark notification as read
  markAsRead(notificationId: string): Promise<void>
  
  // Check attendance thresholds and send alerts
  checkThresholdsAndNotify(studentId: string): Promise<NotificationResult>
  
  // Get notification preferences
  getPreferences(studentId: string): Promise<NotificationPreferences>
  
  // Update notification preferences
  updatePreferences(studentId: string, preferences: NotificationPreferences): Promise<void>
}

interface Notification {
  id: string
  studentId: string
  type: NotificationType
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  createdAt: Date
  read: boolean
  actionUrl?: string
}

type NotificationType = 
  | 'attendance_warning'
  | 'mahroom_alert'
  | 'tasdiq_alert'
  | 'file_approved'
  | 'file_rejected'
  | 'system_announcement'

interface NotificationResult {
  sent: boolean
  notificationId?: string
  error?: string
}

interface NotificationPreferences {
  emailEnabled: boolean
  inAppEnabled: boolean
  attendanceAlerts: boolean
  fileUpdates: boolean
  systemAnnouncements: boolean
}

// Notification thresholds
const NOTIFICATION_THRESHOLDS = {
  WARNING: 80,      // Send warning below 80%
  MAHROOM: 75,      // Urgent alert at 75%
  TASDIQ: 85,       // Certification required at 85%
}
```

### 7. Audit Logger Service

**Purpose**: Track critical system actions for compliance and security.

```typescript
interface AuditLoggerService {
  // Log an action
  log(entry: AuditLogEntry): Promise<void>
  
  // Query audit logs
  query(filters: AuditLogFilters): Promise<AuditLogEntry[]>
  
  // Archive old logs
  archiveOldLogs(olderThan: Date): Promise<number>
  
  // Get logs for specific user
  getUserLogs(userId: string, limit?: number): Promise<AuditLogEntry[]>
}

interface AuditLogEntry {
  id: string
  userId: string
  action: AuditAction
  resource: string
  resourceId?: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
  success: boolean
  errorMessage?: string
}

type AuditAction = 
  | 'data_export'
  | 'file_upload'
  | 'file_download'
  | 'login_success'
  | 'login_failure'
  | 'password_change'
  | 'profile_update'
  | 'notification_sent'

interface AuditLogFilters {
  userId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
  success?: boolean
  limit?: number
  offset?: number
}
```

## Data Models

### Database Schema

```sql
-- Materialized view for class statistics
CREATE MATERIALIZED VIEW class_statistics AS
SELECT 
  c.id as class_id,
  c.name as class_name,
  COUNT(DISTINCT s.id) as total_students,
  AVG(
    CASE 
      WHEN ar.total_classes > 0 
      THEN (ar.present_count::float / ar.total_classes::float) * 100 
      ELSE 0 
    END
  ) as average_attendance,
  PERCENTILE_CONT(0.5) WITHIN GROUP (
    ORDER BY (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as median_attendance,
  MAX(
    (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as highest_attendance,
  MIN(
    (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100
  ) as lowest_attendance,
  COUNT(
    CASE 
      WHEN (ar.present_count::float / NULLIF(ar.total_classes, 0)::float) * 100 < 75 
      THEN 1 
    END
  ) as students_at_risk,
  NOW() as last_calculated
FROM classes c
LEFT JOIN students s ON s.class_id = c.id
LEFT JOIN LATERAL (
  SELECT 
    COUNT(*) FILTER (WHERE status != 'NOT_MARKED') as total_classes,
    COUNT(*) FILTER (WHERE status = 'PRESENT') as present_count
  FROM attendance_records ar
  WHERE ar.student_id = s.id
) ar ON true
GROUP BY c.id, c.name;

-- Index for faster queries
CREATE INDEX idx_class_statistics_class_id ON class_statistics(class_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_class_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY class_statistics;
END;
$$ LANGUAGE plpgsql;

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES students(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  
  -- Indexes for common queries
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_timestamp (timestamp DESC),
  INDEX idx_audit_logs_resource (resource, resource_id)
);

-- Partition audit logs by month for better performance
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  metadata JSONB,
  
  INDEX idx_notifications_student_id (student_id),
  INDEX idx_notifications_created_at (created_at DESC),
  INDEX idx_notifications_read (student_id, read, created_at DESC)
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  student_id UUID PRIMARY KEY REFERENCES students(id),
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  attendance_alerts BOOLEAN NOT NULL DEFAULT true,
  file_updates BOOLEAN NOT NULL DEFAULT true,
  system_announcements BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File metadata table (extends existing medical_certificates)
ALTER TABLE medical_certificates ADD COLUMN IF NOT EXISTS scan_result JSONB;
ALTER TABLE medical_certificates ADD COLUMN IF NOT EXISTS scan_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE medical_certificates ADD COLUMN IF NOT EXISTS quarantined BOOLEAN DEFAULT false;

-- SSE connections tracking (in-memory via Redis, but schema for reference)
-- Redis key: sse:connection:{connectionId}
-- Value: { studentId, classId, createdAt, lastPing }
```

### TypeScript Interfaces

```typescript
// Extended student metrics with caching metadata
interface CachedStudentMetrics extends StudentDashboardMetrics {
  cachedAt: Date
  expiresAt: Date
  source: 'cache' | 'database'
}

// Materialized view result
interface MaterializedClassStats {
  classId: string
  className: string
  totalStudents: number
  averageAttendance: number
  medianAttendance: number
  highestAttendance: number
  lowestAttendance: number
  studentsAtRisk: number
  lastCalculated: Date
}

// Redis cache entry structure
interface CacheEntry<T> {
  data: T
  cachedAt: number  // Unix timestamp
  ttl: number       // Seconds
}

// Rate limit state in Redis
interface RateLimitState {
  count: number
  windowStart: number  // Unix timestamp
  windowEnd: number    // Unix timestamp
}

// SSE connection state in Redis
interface SSEConnectionState {
  connectionId: string
  studentId: string
  classId: string
  createdAt: number
  lastPing: number
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cache Response Time

*For any* valid student ID, when requesting dashboard metrics from cache, the response time should be under 200 milliseconds.

**Validates: Requirements 1.1**

### Property 2: Cache TTL Refresh

*For any* cached entry older than its TTL (5 minutes for metrics), the system should trigger a background refresh while serving the stale data.

**Validates: Requirements 1.2**

### Property 3: Materialized View Usage

*For any* class statistics request, the system should query materialized views rather than computing aggregations on-the-fly.

**Validates: Requirements 1.3**

### Property 4: Cache Consistency

*For any* class ID, when multiple students request the same class data within the cache TTL window, all responses should be identical.

**Validates: Requirements 1.4**

### Property 5: Cache Invalidation Propagation

*For any* attendance update, all related cache keys (student metrics, class averages, rankings) should be invalidated immediately.

**Validates: Requirements 1.5**

### Property 6: SSE Update Latency

*For any* attendance marking event, connected students should receive SSE updates within 2 seconds of the event.

**Validates: Requirements 2.1**

### Property 7: SSE Connection Establishment

*For any* student connecting to the dashboard, an SSE connection should be successfully established and tracked.

**Validates: Requirements 2.2**

### Property 8: SSE Broadcast Completeness

*For any* attendance update affecting a class, all connected students in that class should receive the broadcast event.

**Validates: Requirements 2.3**

### Property 9: SSE Reconnection Backoff

*For any* SSE connection failure, reconnection attempts should follow exponential backoff pattern (1s, 2s, 4s, 8s, max 30s).

**Validates: Requirements 2.4**

### Property 10: SSE Resource Cleanup

*For any* disconnected SSE client, associated resources (memory, Redis entries) should be cleaned up within 30 seconds.

**Validates: Requirements 2.5**

### Property 11: Materialized View Freshness

*For any* class statistics query, the materialized view should have been refreshed within the last 10 minutes.

**Validates: Requirements 3.1**

### Property 12: Ranking Query Performance

*For any* class with any number of students, ranking calculations should complete in under 100 milliseconds.

**Validates: Requirements 3.2**

### Property 13: View Refresh Scheduling

*For any* attendance record update, a materialized view refresh should be scheduled within 5 minutes.

**Validates: Requirements 3.3**

### Property 14: Large Class Performance

*For any* class with 100+ students, dashboard API responses should complete in under 1 second.

**Validates: Requirements 3.4**

### Property 15: Stale Data Headers

*For any* request during materialized view refresh, responses should include cache-control headers indicating stale data.

**Validates: Requirements 3.5**

### Property 16: Dashboard Rate Limit Enforcement

*For any* student making dashboard API requests, the 101st request within a 60-second window should be rejected with HTTP 429.

**Validates: Requirements 4.1**

### Property 17: Export Rate Limit Enforcement

*For any* student making export requests, the 6th request within a 1-hour window should be rejected with HTTP 429.

**Validates: Requirements 4.2**

### Property 18: Rate Limit Response Format

*For any* rate-limited request, the response should include HTTP 429 status, retry-after header, and remaining quota information.

**Validates: Requirements 4.3**

### Property 19: Distributed Rate Limiting

*For any* student making requests across multiple server instances, rate limits should be enforced consistently using shared Redis state.

**Validates: Requirements 4.4**

### Property 20: Rate Limit Violation Logging

*For any* rate limit violation, an audit log entry should be created with timestamp, user ID, endpoint, and violation details.

**Validates: Requirements 4.5**

### Property 21: Export Audit Logging

*For any* data export action, an audit log should be created containing timestamp, user ID, export format, date range, and IP address.

**Validates: Requirements 5.1**

### Property 22: Upload Audit Logging

*For any* file upload, an audit log should be created containing file name, size, type, upload timestamp, and processing status.

**Validates: Requirements 5.2**

### Property 23: Authentication Failure Logging

*For any* failed login attempt, an audit log should be created containing username, timestamp, IP address, and failure reason.

**Validates: Requirements 5.3**

### Property 24: Audit Log Storage Isolation

*For any* audit log entry, it should be stored in the dedicated audit_logs table, not mixed with application data.

**Validates: Requirements 5.4**

### Property 25: Audit Log Archival

*For any* audit_logs table exceeding 1 million records, records older than 90 days should be automatically archived to cold storage.

**Validates: Requirements 5.5**

### Property 26: LocalStorage Caching

*For any* successful dashboard data fetch, the response should be cached in browser localStorage with timestamp.

**Validates: Requirements 6.1**

### Property 27: Offline Data Serving

*For any* request when navigator.onLine is false, cached data should be served with offline indicator UI elements.

**Validates: Requirements 6.2**

### Property 28: Staleness Warning Display

*For any* cached data older than 24 hours, the UI should display a prominent staleness warning banner.

**Validates: Requirements 6.3**

### Property 29: Online Sync Behavior

*For any* transition from offline to online (navigator.onLine becomes true), the system should immediately fetch fresh data and update cache.

**Validates: Requirements 6.4**

### Property 30: Offline Feature Disabling

*For any* offline state, data modification features (file upload, preference changes) should be disabled in the UI.

**Validates: Requirements 6.5**

### Property 31: File Upload and Scanning

*For any* uploaded medical certificate, the file should be stored in Supabase Storage and queued for virus scanning.

**Validates: Requirements 7.1**

### Property 32: Signed URL Generation

*For any* successfully uploaded file, a signed URL with 24-hour expiration should be generated and returned to the client.

**Validates: Requirements 7.2**

### Property 33: Attendance Warning Notifications

*For any* student whose attendance rate drops below 80%, a warning notification should be sent within 24 hours.

**Validates: Requirements 8.1**

### Property 34: Mahroom Urgent Notifications

*For any* student whose attendance rate reaches or drops below 75%, an urgent notification should be sent immediately.

**Validates: Requirements 8.2**

### Property 35: Tasdiq Certification Notifications

*For any* student whose combined absence hours (sick + leave) reach 85% threshold, a certification requirement notification should be sent.

**Validates: Requirements 8.3**

### Property 36: Notification Delivery Tracking

*For any* sent notification, the delivery status should be recorded, and failed deliveries should be retried up to 3 times with exponential backoff.

**Validates: Requirements 8.4**

### Property 37: Notification Preference Respect

*For any* notification, it should only be sent via channels (email/in-app) that the student has enabled in their preferences.

**Validates: Requirements 8.5**

### Property 38: Structured Error Responses

*For any* API error, the response should be a JSON object containing error code, user-friendly message, and optional details field.

**Validates: Requirements 9.1**

### Property 39: Database Retry Logic

*For any* database connection failure, the system should retry the operation up to 3 times with exponential backoff (1s, 2s, 4s).

**Validates: Requirements 9.2**

### Property 40: Graceful Service Degradation

*For any* external service failure (Redis, Supabase Storage), the system should continue operating with reduced functionality and return fallback responses.

**Validates: Requirements 9.3**

### Property 41: Field-Level Validation Errors

*For any* validation error, the response should include a field-specific error message indicating which field failed validation and why.

**Validates: Requirements 9.4**

### Property 42: Contextual Error Logging

*For any* critical error, a log entry should be created containing error message, stack trace, request context, user ID, and timestamp.

**Validates: Requirements 9.5**

### Property 43: High Concurrency Performance

*For any* load scenario with 500+ concurrent users, 95th percentile response times should remain under 1 second.

**Validates: Requirements 10.1**

### Property 44: Connection Pool Optimization

*For any* database query, connections should be obtained from a pool with minimum 10 and maximum 50 connections.

**Validates: Requirements 10.2**

### Property 45: Cache Eviction Policy

*For any* Redis cache exceeding 80% memory capacity, least-recently-used (LRU) entries should be evicted automatically.

**Validates: Requirements 10.3**

### Property 46: Priority Job Processing

*For any* background job queue, urgent jobs (notifications, cache invalidation) should be processed before normal priority jobs.

**Validates: Requirements 10.4**

### Property 47: Resource-Constrained Degradation

*For any* system state where CPU > 80% or memory > 85%, non-critical features (analytics, recommendations) should be temporarily disabled.

**Validates: Requirements 10.5**

## Error Handling

### Error Classification

All errors are classified into categories for consistent handling:

1. **Client Errors (4xx)**
   - `ValidationError`: Invalid input data (400)
   - `AuthenticationError`: Missing or invalid credentials (401)
   - `PermissionError`: Insufficient permissions (403)
   - `NotFoundError`: Resource not found (404)
   - `RateLimitError`: Too many requests (429)

2. **Server Errors (5xx)**
   - `DatabaseError`: Database connection or query failures (500)
   - `CacheError`: Redis connection or operation failures (500)
   - `StorageError`: File storage operation failures (500)
   - `ExternalServiceError`: Third-party service failures (502)
   - `InternalError`: Unexpected application errors (500)

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string              // Machine-readable error code
    message: string           // User-friendly error message
    details?: string          // Technical details (dev mode only)
    field?: string            // Field name for validation errors
    retryAfter?: number       // Seconds until retry allowed (rate limits)
    timestamp: string         // ISO 8601 timestamp
    requestId: string         // Unique request identifier for tracking
  }
}

// Example error responses
const validationError: ErrorResponse = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid student ID format',
    field: 'studentId',
    timestamp: '2024-01-15T10:30:00Z',
    requestId: 'req_abc123'
  }
}

const rateLimitError: ErrorResponse = {
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    retryAfter: 45,
    timestamp: '2024-01-15T10:30:00Z',
    requestId: 'req_def456'
  }
}
```

### Retry Strategies

Different operations use different retry strategies:

```typescript
// Exponential backoff for transient failures
const exponentialBackoff = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000],  // milliseconds
  shouldRetry: (error: Error) => {
    return error instanceof DatabaseError || 
           error instanceof CacheError ||
           error.message.includes('ECONNREFUSED')
  }
}

// Immediate retry for cache misses
const cacheRetry = {
  maxAttempts: 2,
  delays: [0, 100],
  shouldRetry: (error: Error) => {
    return error instanceof CacheError && 
           error.message.includes('CACHE_MISS')
  }
}

// No retry for client errors
const noRetry = {
  maxAttempts: 1,
  shouldRetry: () => false
}
```

### Circuit Breaker Pattern

For external services, implement circuit breaker to prevent cascading failures:

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number      // Open circuit after N failures
  successThreshold: number       // Close circuit after N successes
  timeout: number                // Milliseconds before attempting reset
  monitoringPeriod: number       // Time window for failure counting
}

const redisCircuitBreaker: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
  monitoringPeriod: 60000
}

// Circuit states: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (testing)
```

### Graceful Degradation

When services fail, provide degraded functionality:

| Service Failure | Degradation Strategy |
|----------------|---------------------|
| Redis Cache | Serve from database (slower but functional) |
| Supabase Storage | Disable file uploads, show cached file list |
| SSE Service | Fall back to polling every 30 seconds |
| Notification Service | Queue notifications for later delivery |
| Materialized Views | Use real-time aggregation (slower) |

### Error Logging and Monitoring

```typescript
interface ErrorLog {
  level: 'error' | 'warn' | 'info'
  errorCode: string
  message: string
  stack?: string
  context: {
    userId?: string
    requestId: string
    endpoint: string
    method: string
    statusCode: number
    duration: number
    userAgent?: string
    ipAddress?: string
  }
  timestamp: Date
}

// Log to console in development, external service in production
function logError(error: Error, context: RequestContext): void {
  const errorLog: ErrorLog = {
    level: 'error',
    errorCode: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    context: {
      userId: context.userId,
      requestId: context.requestId,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: context.statusCode,
      duration: context.duration,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress
    },
    timestamp: new Date()
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry)
    sendToErrorTracking(errorLog)
  } else {
    console.error(errorLog)
  }
}
```

## Testing Strategy

### Unit Testing

Unit tests verify individual functions and components in isolation:

**Coverage Areas:**
- Service layer methods (cache operations, calculations, validations)
- Utility functions (date formatting, data transformations)
- Middleware (authentication, rate limiting, validation)
- Error handling and classification
- Data model transformations

**Testing Framework:** Vitest with TypeScript support

**Example Unit Tests:**
```typescript
describe('CacheService', () => {
  it('should set and retrieve cached values', async () => {
    const cache = new CacheService(mockRedis)
    await cache.set('test-key', { data: 'value' }, 300)
    const result = await cache.get('test-key')
    expect(result).toEqual({ data: 'value' })
  })
  
  it('should return null for expired cache entries', async () => {
    const cache = new CacheService(mockRedis)
    await cache.set('test-key', { data: 'value' }, 1)
    await sleep(1100) // Wait for expiration
    const result = await cache.get('test-key')
    expect(result).toBeNull()
  })
})

describe('RateLimiterService', () => {
  it('should allow requests within limit', async () => {
    const limiter = new RateLimiterService(mockRedis)
    for (let i = 0; i < 100; i++) {
      const result = await limiter.checkLimit('user123', 'dashboard')
      expect(result.allowed).toBe(true)
    }
  })
  
  it('should block requests exceeding limit', async () => {
    const limiter = new RateLimiterService(mockRedis)
    // Make 100 allowed requests
    for (let i = 0; i < 100; i++) {
      await limiter.recordRequest('user123', 'dashboard')
    }
    // 101st request should be blocked
    const result = await limiter.checkLimit('user123', 'dashboard')
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })
})
```

### Property-Based Testing

Property-based tests verify universal properties across many randomly generated inputs using **fast-check** library.

**Testing Framework:** Vitest + fast-check

**Key Properties to Test:**

1. **Cache Consistency**: Multiple reads of the same key return identical values
2. **Rate Limit Fairness**: All users are subject to the same limits
3. **Notification Delivery**: All threshold breaches trigger notifications
4. **Error Response Format**: All errors return valid ErrorResponse structure
5. **Cache Invalidation**: Updates always invalidate related cache entries

**Example Property Tests:**

```typescript
import fc from 'fast-check'

describe('Property: Cache Response Time', () => {
  it('should return cached data within 200ms for any valid student ID', async () => {
    // **Feature: enhanced-student-dashboard-backend, Property 1: Cache Response Time**
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Generate random student IDs
        async (studentId) => {
          // Pre-populate cache
          await cacheService.set(
            CACHE_KEYS.STUDENT_METRICS(studentId),
            mockMetrics,
            CACHE_TTL.STUDENT_METRICS
          )
          
          const startTime = performance.now()
          const result = await dashboardService.getStudentMetrics(studentId)
          const duration = performance.now() - startTime
          
          expect(result).toBeDefined()
          expect(duration).toBeLessThan(200)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property: Cache Invalidation Propagation', () => {
  it('should invalidate all related cache keys for any attendance update', async () => {
    // **Feature: enhanced-student-dashboard-backend, Property 5: Cache Invalidation Propagation**
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.uuid(),
          classId: fc.uuid(),
          date: fc.date(),
          status: fc.constantFrom('present', 'absent', 'sick', 'leave')
        }),
        async (attendanceUpdate) => {
          // Pre-populate related caches
          await cacheService.set(
            CACHE_KEYS.STUDENT_METRICS(attendanceUpdate.studentId),
            mockMetrics,
            300
          )
          await cacheService.set(
            CACHE_KEYS.CLASS_AVERAGE(attendanceUpdate.classId),
            mockAverage,
            300
          )
          
          // Update attendance
          await dashboardService.updateAttendance(attendanceUpdate)
          
          // Verify caches are invalidated
          const studentCache = await cacheService.get(
            CACHE_KEYS.STUDENT_METRICS(attendanceUpdate.studentId)
          )
          const classCache = await cacheService.get(
            CACHE_KEYS.CLASS_AVERAGE(attendanceUpdate.classId)
          )
          
          expect(studentCache).toBeNull()
          expect(classCache).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property: Rate Limit Enforcement', () => {
  it('should block the 101st request within 60 seconds for any user', async () => {
    // **Feature: enhanced-student-dashboard-backend, Property 16: Dashboard Rate Limit Enforcement**
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Random user ID
        async (userId) => {
          const limiter = new RateLimiterService(redis)
          
          // Make 100 requests (should all succeed)
          for (let i = 0; i < 100; i++) {
            await limiter.recordRequest(userId, 'dashboard')
          }
          
          // 101st request should be blocked
          const result = await limiter.checkLimit(userId, 'dashboard')
          
          expect(result.allowed).toBe(false)
          expect(result.remaining).toBe(0)
          expect(result.retryAfter).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('Property: Structured Error Responses', () => {
  it('should return valid ErrorResponse structure for any error type', async () => {
    // **Feature: enhanced-student-dashboard-backend, Property 38: Structured Error Responses**
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(new ValidationError('Invalid input')),
          fc.constant(new AuthenticationError('Not authenticated')),
          fc.constant(new RateLimitError('Too many requests')),
          fc.constant(new DatabaseError('Connection failed'))
        ),
        async (error) => {
          const response = formatErrorResponse(error, 'req_test123')
          
          expect(response).toHaveProperty('error')
          expect(response.error).toHaveProperty('code')
          expect(response.error).toHaveProperty('message')
          expect(response.error).toHaveProperty('timestamp')
          expect(response.error).toHaveProperty('requestId')
          expect(typeof response.error.code).toBe('string')
          expect(typeof response.error.message).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property: Notification Threshold Triggering', () => {
  it('should send warning notification for any student below 80% attendance', async () => {
    // **Feature: enhanced-student-dashboard-backend, Property 33: Attendance Warning Notifications**
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          studentId: fc.uuid(),
          attendanceRate: fc.float({ min: 0, max: 79.9 })
        }),
        async ({ studentId, attendanceRate }) => {
          const notificationService = new NotificationService(db, redis)
          
          const result = await notificationService.checkThresholdsAndNotify(
            studentId,
            attendanceRate
          )
          
          expect(result.sent).toBe(true)
          expect(result.notificationId).toBeDefined()
          
          // Verify notification was created
          const notifications = await notificationService.getUnreadNotifications(studentId)
          const warningNotification = notifications.find(
            n => n.type === 'attendance_warning'
          )
          expect(warningNotification).toBeDefined()
        }
      ),
      { numRuns: 50 }
    )
  })
})
```

### Integration Testing

Integration tests verify that components work together correctly:

**Coverage Areas:**
- API endpoints with middleware stack
- Service layer interactions with database and cache
- SSE connection lifecycle
- Background job execution
- File upload and storage workflow

**Example Integration Tests:**
```typescript
describe('Dashboard API Integration', () => {
  it('should return cached metrics on second request', async () => {
    const studentId = 'test-student-123'
    
    // First request (cache miss)
    const response1 = await request(app)
      .get(`/api/students/dashboard?studentId=${studentId}`)
      .expect(200)
    
    // Second request (cache hit)
    const startTime = performance.now()
    const response2 = await request(app)
      .get(`/api/students/dashboard?studentId=${studentId}`)
      .expect(200)
    const duration = performance.now() - startTime
    
    expect(response2.body.data).toEqual(response1.body.data)
    expect(duration).toBeLessThan(200)
  })
  
  it('should enforce rate limits across requests', async () => {
    const studentId = 'test-student-456'
    
    // Make 100 successful requests
    for (let i = 0; i < 100; i++) {
      await request(app)
        .get(`/api/students/dashboard?studentId=${studentId}`)
        .expect(200)
    }
    
    // 101st request should be rate limited
    const response = await request(app)
      .get(`/api/students/dashboard?studentId=${studentId}`)
      .expect(429)
    
    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(response.headers['retry-after']).toBeDefined()
  })
})
```

### Performance Testing

Performance tests verify system behavior under load:

**Tools:** Artillery or k6 for load testing

**Test Scenarios:**
1. **Baseline**: 100 concurrent users, 5-minute duration
2. **Peak Load**: 500 concurrent users, 10-minute duration
3. **Stress Test**: Gradually increase to 1000 users
4. **Spike Test**: Sudden jump from 100 to 500 users
5. **Endurance**: 200 users for 1 hour

**Success Criteria:**
- 95th percentile response time < 1 second
- Error rate < 0.1%
- No memory leaks over 1-hour test
- Cache hit rate > 80%

### End-to-End Testing

E2E tests verify complete user workflows:

**Coverage Areas:**
- Student logs in and views dashboard
- Real-time attendance update appears
- File upload and approval workflow
- Notification delivery and reading
- Offline mode and sync

**Framework:** Playwright for browser automation

