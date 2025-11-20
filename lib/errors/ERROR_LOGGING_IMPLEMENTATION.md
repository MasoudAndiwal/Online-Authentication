# Contextual Error Logging Implementation

This document describes the comprehensive contextual error logging system implemented for the enhanced student dashboard backend, fulfilling **Requirement 9.5**: "WHEN critical errors happen THEN the Student_Dashboard_System SHALL log errors with full context for debugging."

## Overview

The error logging system provides:

- **Full Context Logging**: Request details, user information, performance metrics
- **Stack Traces**: Complete error stack traces for debugging
- **Error Tracking Integration**: Sentry integration for production monitoring
- **Structured Logging**: Consistent log format across all components
- **Performance Monitoring**: Automatic detection of slow operations
- **Graceful Degradation**: System continues operating even if logging fails

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Request                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Error Logging Middleware                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Capture Request Context                          │   │
│  │    - Headers, Query Params, Body                    │   │
│  │    - User Info, Session Data                        │   │
│  │    - Performance Metrics                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. Execute Handler                                  │   │
│  │    - Wrap with try/catch                            │   │
│  │    - Monitor performance                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3. Log Errors with Full Context                     │   │
│  │    - Stack traces                                   │   │
│  │    - Request context                                │   │
│  │    - User information                               │   │
│  │    - Performance data                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Error Logger Service                          │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Console Logger  │  │ Sentry Logger   │                  │
│  │ (Development)   │  │ (Production)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Error Logger Service (`lib/errors/error-logger.ts`)

Core service that handles error logging with full context:

```typescript
import { errorLogger, logError } from '@/lib/errors/error-logger';

// Log error with full context
await logError(
  error,
  {
    requestId: 'req_123',
    userId: 'user_456',
    endpoint: '/api/students/dashboard',
    method: 'GET',
    timestamp: new Date()
  },
  {
    operation: 'getStudentMetrics',
    feature: 'dashboard'
  },
  ['api-error', 'dashboard']
);
```

### 2. Error Logging Middleware (`lib/middleware/error-logging-middleware.ts`)

Middleware that automatically captures context and logs errors:

```typescript
import { withErrorLogging } from '@/lib/middleware/error-logging-middleware';

export const GET = withErrorLogging(
  async (req: NextRequest) => {
    // Your API logic here
    return NextResponse.json({ data: 'success' });
  },
  {
    feature: 'student-dashboard',
    operation: 'get-metrics',
    logSuccessfulRequests: true
  }
);
```

### 3. API Middleware Stack (`lib/middleware/api-middleware-stack.ts`)

Complete middleware stack with authentication, rate limiting, and error logging:

```typescript
import { withStudentDashboardMiddleware } from '@/lib/middleware/api-middleware-stack';

export const GET = withStudentDashboardMiddleware(
  async (req: EnhancedRequest) => {
    // Handler with full middleware protection
    return NextResponse.json({ data: 'success' });
  },
  'get-dashboard-metrics'
);
```

## Usage Examples

### 1. API Route with Error Logging

```typescript
// app/api/students/dashboard/route.ts
import { withStudentDashboardMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError, NotFoundError } from '@/lib/errors/custom-errors';

export const GET = withStudentDashboardMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }
    
    // Your business logic here
    const metrics = await dashboardService.getStudentMetrics(studentId);
    
    return NextResponse.json({
      success: true,
      data: metrics,
      requestId: req.requestId
    });
  },
  'get-dashboard-metrics'
);
```

### 2. Service Layer with Error Logging

```typescript
// lib/services/dashboard-service.ts
import { withDatabaseErrorLogging, logError } from '@/lib/errors';

class DashboardService {
  async getStudentMetrics(studentId: string): Promise<StudentMetrics> {
    try {
      // Database operation with error logging
      const metrics = await withDatabaseErrorLogging(
        () => this.db.query('SELECT * FROM student_metrics WHERE id = ?', [studentId]),
        'getStudentMetrics',
        'student_metrics'
      )();
      
      return metrics;
    } catch (error) {
      // Additional context logging
      await logError(
        error as Error,
        {
          requestId: `service_${Date.now()}`,
          timestamp: new Date()
        },
        {
          operation: 'getStudentMetrics',
          studentId,
          service: 'DashboardService'
        },
        ['service-error', 'dashboard']
      );
      
      throw error;
    }
  }
}
```

### 3. Cache Operations with Error Logging

```typescript
import { withCacheErrorLogging } from '@/lib/errors';

class CacheService {
  async get(key: string): Promise<any> {
    return withCacheErrorLogging(
      () => this.redis.get(key),
      'cacheGet',
      key
    )();
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    return withCacheErrorLogging(
      () => this.redis.setex(key, ttl, JSON.stringify(value)),
      'cacheSet',
      key
    )();
  }
}
```

## Error Context Structure

Every error log includes comprehensive context:

```typescript
interface ErrorLogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error: {
    name: string;           // Error class name
    message: string;        // Error message
    code: string;          // Error code (e.g., 'VALIDATION_ERROR')
    statusCode: number;    // HTTP status code
    stack?: string;        // Stack trace
    cause?: Error;         // Underlying cause
  };
  context: {
    requestId: string;     // Unique request identifier
    userId?: string;       // Authenticated user ID
    sessionId?: string;    // Session identifier
    endpoint?: string;     // API endpoint
    method?: string;       // HTTP method
    userAgent?: string;    // User agent string
    ipAddress?: string;    // Client IP address
    timestamp: Date;       // When error occurred
    duration?: number;     // Request duration (ms)
    statusCode?: number;   // Response status code
    queryParams?: object;  // Query parameters
    headers?: object;      // Request headers (sanitized)
  };
  metadata?: {
    operation: string;     // Operation being performed
    feature: string;       // Feature area
    performance: object;   // Performance metrics
    [key: string]: any;    // Additional context
  };
  tags?: string[];         // Tags for categorization
  environment: string;     // Environment (dev/staging/prod)
  service: string;         // Service name
  version?: string;        // Application version
}
```

## Setup and Configuration

### 1. Initialize Error Logging

```typescript
// app/layout.tsx or startup file
import { setupErrorLogging } from '@/lib/setup/error-logging-setup';

// Initialize during app startup
setupErrorLogging();
```

### 2. Environment Configuration

```bash
# .env.local
NODE_ENV=production
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
npm_package_version=1.0.0
```

### 3. Sentry Integration (Production)

```bash
npm install @sentry/node
```

The system automatically uses Sentry in production when `SENTRY_DSN` is configured.

## Error Types and Handling

### Custom Error Classes

```typescript
import { 
  ValidationError,
  AuthenticationError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  CacheError,
  StorageError,
  ExternalServiceError,
  InternalError
} from '@/lib/errors/custom-errors';

// Validation error
throw new ValidationError('Invalid student ID format', 'studentId');

// Database error
throw new DatabaseError('Connection timeout', 'SELECT', 'students');

// Cache error
throw new CacheError('Redis connection failed', 'GET', 'student:123');
```

### Error Response Format

All API errors return structured responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid student ID format",
    "field": "studentId",
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

## Performance Monitoring

The system automatically monitors and logs:

- **Slow Requests**: Requests taking longer than threshold (default: 1000ms)
- **Memory Usage**: High memory usage warnings
- **Database Operations**: Slow queries (>500ms)
- **Cache Operations**: Cache hit/miss rates
- **External Services**: Slow API calls (>2000ms)

## Best Practices

### 1. Use Appropriate Error Types

```typescript
// Good: Specific error type
throw new ValidationError('Invalid email format', 'email');

// Bad: Generic error
throw new Error('Invalid input');
```

### 2. Include Relevant Context

```typescript
// Good: Rich context
await logError(error, context, {
  operation: 'updateStudent',
  studentId: '123',
  changes: ['email', 'phone'],
  validationRules: appliedRules
});

// Bad: Minimal context
await logError(error, context);
```

### 3. Use Middleware Wrappers

```typescript
// Good: Use middleware for consistent logging
export const GET = withStudentDashboardMiddleware(handler, 'get-metrics');

// Bad: Manual error handling in every route
export async function GET(req: NextRequest) {
  try {
    // handler logic
  } catch (error) {
    // manual error logging
  }
}
```

### 4. Sanitize Sensitive Data

```typescript
// Automatically sanitized by the system:
// - Passwords
// - Authorization headers
// - API keys
// - Tokens

// Additional sanitization for custom fields:
const sanitizedData = {
  ...data,
  creditCard: '[REDACTED]',
  ssn: '[REDACTED]'
};
```

## Monitoring and Alerting

### Development

- Errors logged to console with full context
- Stack traces included
- Request bodies logged for debugging

### Production

- Errors sent to Sentry with sampling
- Sensitive data automatically redacted
- Performance metrics tracked
- Alerts configured for error rate thresholds

## Testing Error Logging

```typescript
import { testErrorLogging } from '@/lib/setup/error-logging-setup';

// Test the error logging system
await testErrorLogging();
```

## Troubleshooting

### Common Issues

1. **Sentry not receiving errors**
   - Check `SENTRY_DSN` environment variable
   - Verify network connectivity
   - Check error sampling rate

2. **Missing context in logs**
   - Ensure middleware is properly applied
   - Check request context creation
   - Verify user authentication

3. **Performance impact**
   - Adjust log levels for production
   - Configure error sampling rates
   - Monitor memory usage

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm start
```

This provides detailed information about the error logging system operation.

## Security Considerations

- **Sensitive Data**: Automatically redacted from logs
- **PII Protection**: User data sanitized before logging
- **Access Control**: Error logs contain no authentication tokens
- **Data Retention**: Configurable log retention policies
- **Encryption**: Logs encrypted in transit and at rest (Sentry)

## Compliance

The error logging system helps meet compliance requirements:

- **Audit Trails**: Complete request/error tracking
- **Data Protection**: Automatic PII redaction
- **Incident Response**: Detailed error context for investigation
- **Monitoring**: Real-time error detection and alerting