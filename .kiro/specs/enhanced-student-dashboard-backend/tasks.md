# Implementation Plan

- [x] 1. Set up Redis cache infrastructure and core caching service




- [x] 1.1 Install and configure Redis client (ioredis or upstash-redis)


  - Add Redis connection configuration with environment variables
  - Implement connection pooling and error handling
  - _Requirements: 1.1, 1.2, 1.4_


- [x] 1.2 Implement CacheService with get, set, delete, and pattern operations

  - Create cache service class with typed methods
  - Implement TTL management and key pattern utilities
  - Add cache key constants and TTL configuration
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [ ]* 1.3 Write property test for cache response time
  - **Property 1: Cache Response Time**
  - **Validates: Requirements 1.1**

- [ ]* 1.4 Write property test for cache consistency
  - **Property 4: Cache Consistency**
  - **Validates: Requirements 1.4**
-

- [ ] 2. Create materialized views for class statistics

- [ ] 2.1 Write SQL migration for class_statistics materialized view
  - Create materialized view with aggregated class metrics
  - Add indexes for performance optimization
  - Create refresh function for scheduled updates
  - _Requirements: 1.3, 3.1, 3.3_

- [ ] 2.2 Implement database refresh scheduling with node-cron
  - Set up cron job to refresh views every 10 minutes
  - Add logging for refresh operations
  - _Requirements: 3.1, 3.3_

- [ ]* 2.3 Write property test for materialized view usage
  - **Property 3: Materialized View Usage**
  - **Validates: Requirements 1.3**

- [ ]* 2.4 Write property test for view refresh scheduling
  - **Property 13: View Refresh Scheduling**
  - **Validates: Requirements 3.3**

- [ ] 3. Implement DashboardService with caching integration
- [ ] 3.1 Create DashboardService class with metrics calculation methods
  - Implement getStudentMetrics with cache-first strategy
  - Implement getClassStatistics using materialized views
  - Implement getStudentRanking with optimized queries
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [ ] 3.2 Add cache invalidation logic for attendance updates
  - Implement invalidateStudentCache method
  - Implement invalidateClassCache method
  - Add pattern-based cache clearing for related keys
  - _Requirements: 1.5_

- [ ] 3.3 Implement background cache refresh for stale data
  - Add TTL checking and background refresh triggers
  - Serve stale data while refreshing in background
  - _Requirements: 1.2, 3.5_

- [ ]* 3.4 Write property test for cache invalidation propagation
  - **Property 5: Cache Invalidation Propagation**
  - **Validates: Requirements 1.5**

- [ ]* 3.5 Write property test for ranking query performance
  - **Property 12: Ranking Query Performance**
  - **Validates: Requirements 3.2**

- [ ] 4. Build rate limiting middleware with Redis
- [ ] 4.1 Implement RateLimiterService with distributed rate limiting
  - Create rate limiter service using Redis counters
  - Implement checkLimit and recordRequest methods
  - Add sliding window algorithm for accurate rate limiting
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 4.2 Create rate limiting middleware for API routes
  - Build Next.js middleware for rate limit enforcement
  - Add HTTP 429 responses with retry-after headers
  - Configure different limits for different endpoints
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 4.3 Add rate limit violation logging
  - Log violations to audit_logs table
  - Include user ID, endpoint, timestamp, and IP address
  - _Requirements: 4.5_

- [ ]* 4.4 Write property test for dashboard rate limit enforcement
  - **Property 16: Dashboard Rate Limit Enforcement**
  - **Validates: Requirements 4.1**

- [ ]* 4.5 Write property test for export rate limit enforcement
  - **Property 17: Export Rate Limit Enforcement**
  - **Validates: Requirements 4.2**

- [ ]* 4.6 Write property test for rate limit response format
  - **Property 18: Rate Limit Response Format**
  - **Validates: Requirements 4.3**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Server-Sent Events (SSE) service for real-time updates
- [ ] 6.1 Create SSEService class with connection management
  - Implement createConnection method with response streaming
  - Add connection tracking in Redis with TTL
  - Implement sendToStudent and broadcastToClass methods
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 6.2 Add SSE connection cleanup and heartbeat mechanism
  - Implement periodic ping events to keep connections alive
  - Add cleanup for stale connections (30-second timeout)
  - Implement closeConnection method with resource cleanup
  - _Requirements: 2.5_

- [ ] 6.3 Create SSE API endpoint for student connections
  - Build /api/students/notifications/sse endpoint
  - Add authentication and rate limiting
  - Implement automatic reconnection with exponential backoff on client
  - _Requirements: 2.2, 2.4_

- [ ] 6.4 Integrate SSE broadcasts with attendance update events
  - Trigger SSE events when attendance is marked
  - Send metrics updates to affected students
  - Broadcast to all students in affected class
  - _Requirements: 2.1, 2.3_

- [ ]* 6.5 Write property test for SSE update latency
  - **Property 6: SSE Update Latency**
  - **Validates: Requirements 2.1**

- [ ]* 6.6 Write property test for SSE broadcast completeness
  - **Property 8: SSE Broadcast Completeness**
  - **Validates: Requirements 2.3**

- [ ]* 6.7 Write property test for SSE resource cleanup
  - **Property 10: SSE Resource Cleanup**
  - **Validates: Requirements 2.5**

- [ ] 7. Create audit logging system
- [ ] 7.1 Write SQL migration for audit_logs table
  - Create audit_logs table with partitioning by month
  - Add indexes for common query patterns
  - _Requirements: 5.4_

- [ ] 7.2 Implement AuditLoggerService class
  - Create log method for recording audit entries
  - Implement query method with filtering
  - Add getUserLogs method for user-specific queries
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7.3 Add audit logging to critical operations
  - Log data exports with scope and timestamp
  - Log file uploads with metadata
  - Log authentication failures with IP addresses
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7.4 Implement automatic audit log archival
  - Create background job to archive logs older than 90 days
  - Trigger archival when table exceeds 1 million records
  - _Requirements: 5.5_

- [ ]* 7.5 Write property test for export audit logging
  - **Property 21: Export Audit Logging**
  - **Validates: Requirements 5.1**

- [ ]* 7.6 Write property test for upload audit logging
  - **Property 22: Upload Audit Logging**
  - **Validates: Requirements 5.2**

- [ ]* 7.7 Write property test for authentication failure logging
  - **Property 23: Authentication Failure Logging**
  - **Validates: Requirements 5.3**

- [ ] 8. Build file storage service for medical certificates
- [ ] 8.1 Implement FileStorageService with Supabase Storage integration
  - Create uploadFile method with validation
  - Implement file size and type validation (10MB limit, PDF/images only)
  - Add getSignedUrl method with 24-hour expiration
  - _Requirements: 7.1, 7.2_

- [ ] 8.2 Add virus scanning integration (placeholder for future)
  - Create scan status tracking in database
  - Add quarantine functionality for flagged files
  - Update medical_certificates table with scan fields
  - _Requirements: 7.1, 7.5_

- [ ] 8.3 Create file upload API endpoint
  - Build /api/students/files/upload endpoint
  - Add multipart form data handling
  - Implement rate limiting for uploads
  - Return signed URL in response
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8.4 Implement file listing and metadata retrieval
  - Add listStudentFiles method
  - Add getFileMetadata method
  - Create API endpoint for file listing
  - _Requirements: 7.1_

- [ ]* 8.5 Write property test for file upload and scanning
  - **Property 31: File Upload and Scanning**
  - **Validates: Requirements 7.1**

- [ ]* 8.6 Write property test for signed URL generation
  - **Property 32: Signed URL Generation**
  - **Validates: Requirements 7.2**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement notification system with threshold monitoring
- [ ] 10.1 Write SQL migrations for notifications tables
  - Create notifications table with indexes
  - Create notification_preferences table
  - Add default preferences for all students
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 10.2 Implement NotificationService class
  - Create sendNotification method
  - Implement queueNotification for batch processing
  - Add getUnreadNotifications method
  - Implement markAsRead method
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10.3 Implement threshold checking logic
  - Create checkThresholdsAndNotify method
  - Check 80% warning threshold
  - Check 75% mahroom urgent threshold
  - Check 85% tasdiq certification threshold
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10.4 Add notification preference management
  - Implement getPreferences method
  - Implement updatePreferences method
  - Respect email/in-app channel preferences
  - _Requirements: 8.5_

- [ ] 10.5 Create background job for threshold monitoring
  - Set up hourly cron job to check all student attendance rates
  - Queue notifications for students below thresholds
  - Implement retry logic for failed deliveries (3 attempts with backoff)
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 10.6 Write property test for attendance warning notifications
  - **Property 33: Attendance Warning Notifications**
  - **Validates: Requirements 8.1**

- [ ]* 10.7 Write property test for mahroom urgent notifications
  - **Property 34: Mahroom Urgent Notifications**
  - **Validates: Requirements 8.2**

- [ ]* 10.8 Write property test for notification preference respect
  - **Property 37: Notification Preference Respect**
  - **Validates: Requirements 8.5**

- [ ] 11. Implement offline support with localStorage caching
- [ ] 11.1 Create client-side caching utilities
  - Implement localStorage wrapper with timestamp tracking
  - Add cache expiration checking (24-hour threshold)
  - Create offline detection utilities
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.2 Add offline indicators and staleness warnings to UI
  - Display offline banner when navigator.onLine is false
  - Show staleness warning for data older than 24 hours
  - Disable modification features in offline mode
  - _Requirements: 6.2, 6.3, 6.5_

- [ ] 11.3 Implement automatic sync on reconnection
  - Listen for online event
  - Fetch fresh data when connection restored
  - Update localStorage cache with new data
  - _Requirements: 6.4_

- [ ]* 11.4 Write property test for localStorage caching
  - **Property 26: LocalStorage Caching**
  - **Validates: Requirements 6.1**

- [ ]* 11.5 Write property test for offline data serving
  - **Property 27: Offline Data Serving**
  - **Validates: Requirements 6.2**

- [ ]* 11.6 Write property test for online sync behavior
  - **Property 29: Online Sync Behavior**
  - **Validates: Requirements 6.4**

- [ ] 12. Build comprehensive error handling system
- [ ] 12.1 Create custom error classes for all error types
  - Implement ValidationError, AuthenticationError, PermissionError
  - Implement RateLimitError, DatabaseError, CacheError
  - Implement StorageError, ExternalServiceError, InternalError
  - _Requirements: 9.1, 9.4_

- [ ] 12.2 Implement error response formatter
  - Create formatErrorResponse function
  - Generate structured ErrorResponse objects
  - Include error codes, messages, and request IDs
  - _Requirements: 9.1, 9.4_

- [ ] 12.3 Add retry logic with exponential backoff
  - Implement retry wrapper for database operations
  - Add retry logic for cache operations
  - Configure retry strategies per operation type
  - _Requirements: 9.2_

- [ ] 12.4 Implement circuit breaker for external services
  - Create circuit breaker for Redis connections
  - Add circuit breaker for Supabase Storage
  - Configure failure thresholds and timeout periods
  - _Requirements: 9.3_

- [ ] 12.5 Add graceful degradation strategies
  - Fall back to database when Redis fails
  - Disable uploads when storage fails
  - Fall back to polling when SSE fails
  - _Requirements: 9.3_

- [ ] 12.6 Implement contextual error logging
  - Create error logging utility with full context
  - Log stack traces, request context, and user info
  - Integrate with error tracking service (Sentry placeholder)
  - _Requirements: 9.5_

- [ ]* 12.7 Write property test for structured error responses
  - **Property 38: Structured Error Responses**
  - **Validates: Requirements 9.1**

- [ ]* 12.8 Write property test for database retry logic
  - **Property 39: Database Retry Logic**
  - **Validates: Requirements 9.2**

- [ ]* 12.9 Write property test for field-level validation errors
  - **Property 41: Field-Level Validation Errors**
  - **Validates: Requirements 9.4**

- [ ] 13. Optimize for high concurrency and performance
- [ ] 13.1 Configure database connection pooling
  - Set up connection pool with min 10, max 50 connections
  - Add connection timeout and idle timeout configuration
  - Implement connection health checks
  - _Requirements: 10.2_

- [ ] 13.2 Implement cache eviction policies
  - Configure Redis LRU eviction policy
  - Set memory limit and eviction threshold (80%)
  - Monitor cache hit rates
  - _Requirements: 10.3_

- [ ] 13.3 Add priority queue for background jobs
  - Implement job priority system (urgent, normal, low)
  - Process urgent jobs (notifications, cache invalidation) first
  - Add job monitoring and failure handling
  - _Requirements: 10.4_

- [ ] 13.4 Implement resource-based degradation
  - Monitor CPU and memory usage
  - Disable non-critical features when resources constrained
  - Add health check endpoint with resource metrics
  - _Requirements: 10.5_

- [ ]* 13.5 Write property test for high concurrency performance
  - **Property 43: High Concurrency Performance**
  - **Validates: Requirements 10.1**

- [ ]* 13.6 Write property test for cache eviction policy
  - **Property 45: Cache Eviction Policy**
  - **Validates: Requirements 10.3**

- [ ] 14. Create API endpoints with full middleware stack
- [ ] 14.1 Build /api/students/dashboard endpoint
  - Implement GET handler with authentication
  - Add rate limiting middleware
  - Integrate DashboardService with caching
  - Return cached metrics with appropriate headers
  - _Requirements: 1.1, 1.2, 4.1_

- [ ] 14.2 Build /api/students/attendance/weekly endpoint
  - Implement GET handler with date range parameters
  - Add caching for weekly attendance data
  - Return formatted attendance records
  - _Requirements: 1.1, 1.2_

- [ ] 14.3 Build /api/students/export endpoint
  - Implement GET handler with format parameter (CSV, PDF)
  - Add strict rate limiting (5 per hour)
  - Add audit logging for all exports
  - _Requirements: 4.2, 5.1_

- [ ] 14.4 Build /api/students/notifications endpoint
  - Implement GET handler for unread notifications
  - Implement POST handler for marking as read
  - Add pagination support
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 14.5 Build /api/students/preferences endpoint
  - Implement GET handler for notification preferences
  - Implement PUT handler for updating preferences
  - Validate preference updates
  - _Requirements: 8.5_

- [ ]* 14.6 Write integration tests for API endpoints
  - Test authentication middleware
  - Test rate limiting across requests
  - Test cache hit/miss behavior
  - Test error response formats

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
