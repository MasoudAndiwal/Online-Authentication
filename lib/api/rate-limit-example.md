# Rate Limiting Middleware Usage Examples

This document provides examples of how to use the rate limiting middleware in API routes.

## Basic Usage

### Example 1: Simple Rate Limiting

```typescript
// app/api/students/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/api/rate-limit-middleware';
import { authenticateRequest } from '@/lib/api/auth-middleware';

export async function GET(request: NextRequest) {
  // Authenticate user
  const { user, error } = await authenticateRequest(request);
  if (error) return error;

  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(request, 'DASHBOARD', user!.id);
  if (rateLimitResponse) {
    return rateLimitResponse; // Return 429 if rate limited
  }

  // Your API logic here
  const data = await getDashboardData(user!.id);
  
  return NextResponse.json({ data });
}
```

### Example 2: Using withRateLimit Wrapper

```typescript
// app/api/students/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/api/rate-limit-middleware';
import { authenticateRequest } from '@/lib/api/auth-middleware';

export async function GET(request: NextRequest) {
  // Authenticate user
  const { user, error } = await authenticateRequest(request);
  if (error) return error;

  // Use wrapper for cleaner code
  return withRateLimit(request, 'EXPORT', async (req, userId) => {
    const format = req.nextUrl.searchParams.get('format') || 'csv';
    const data = await exportAttendanceData(userId, format);
    
    return NextResponse.json({ 
      success: true,
      downloadUrl: data.url 
    });
  }, user!.id);
}
```

### Example 3: Custom Rate Limit Middleware

```typescript
// app/api/students/files/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitMiddleware } from '@/lib/api/rate-limit-middleware';
import { authenticateRequest } from '@/lib/api/auth-middleware';

// Create reusable middleware for this endpoint
const uploadRateLimit = createRateLimitMiddleware('UPLOAD');

export async function POST(request: NextRequest) {
  // Authenticate user
  const { user, error } = await authenticateRequest(request);
  if (error) return error;

  // Apply rate limiting
  const rateLimitResponse = await uploadRateLimit(request, user!.id);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Handle file upload
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Upload logic...
  
  return NextResponse.json({ 
    success: true,
    fileId: 'file_123' 
  });
}
```

## Rate Limit Configuration

The rate limits are configured in `lib/services/rate-limiter-service.ts`:

```typescript
export const RATE_LIMITS = {
  DASHBOARD: {
    requests: 100,
    window: 60, // seconds
  },
  EXPORT: {
    requests: 5,
    window: 3600, // 1 hour
  },
  UPLOAD: {
    requests: 10,
    window: 3600, // 1 hour
  },
  SSE: {
    requests: 10,
    window: 60, // connections per minute
  },
};
```

## Response Format

### Successful Request (200 OK)

```json
{
  "data": { ... }
}
```

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-15T10:31:00.000Z
```

### Rate Limited Request (429 Too Many Requests)

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Maximum 100 requests per 60 seconds.",
    "retryAfter": 45,
    "limit": 100,
    "remaining": 0,
    "resetAt": "2024-01-15T10:31:00.000Z",
    "timestamp": "2024-01-15T10:30:15.000Z",
    "requestId": "req_1705315815_abc123"
  }
}
```

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2024-01-15T10:31:00.000Z
Retry-After: 45
```

## Audit Logging

All rate limit violations are automatically logged with:
- User ID
- Endpoint
- IP address
- User agent
- Timestamp
- Request ID

Logs can be viewed in the console or in the audit log file (if configured).

## Bypassing Rate Limits (Admin/Internal Services)

For internal services or admin operations, you can bypass rate limits using a secret header:

```typescript
// Set environment variable
RATE_LIMIT_BYPASS_SECRET=your-secret-key

// In your request
headers: {
  'x-rate-limit-bypass': 'your-secret-key'
}
```

## Testing

To test rate limiting in development:

```bash
# Make 101 requests to trigger rate limit
for i in {1..101}; do
  curl http://localhost:3000/api/students/dashboard?studentId=test-123
done
```

## Monitoring

Get current rate limit usage:

```typescript
import { getRateLimiterService } from '@/lib/services/rate-limiter-service';

const rateLimiter = getRateLimiterService();
const usage = await rateLimiter.getUsage('user-123', 'DASHBOARD');

console.log(`Requests: ${usage.requests}/${usage.limit}`);
console.log(`Window: ${usage.windowStart} - ${usage.windowEnd}`);
```

## Admin Functions

Reset rate limits for a user:

```typescript
import { getRateLimiterService } from '@/lib/services/rate-limiter-service';

const rateLimiter = getRateLimiterService();

// Reset all limits for user
await rateLimiter.resetLimits('user-123');

// Reset specific endpoint
await rateLimiter.resetEndpointLimit('user-123', 'EXPORT');
```
