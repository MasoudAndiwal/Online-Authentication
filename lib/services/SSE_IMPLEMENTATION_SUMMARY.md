# SSE (Server-Sent Events) Implementation Summary

## Overview

This document summarizes the implementation of the Server-Sent Events (SSE) service for real-time attendance updates in the student dashboard system.

## Implemented Components

### 1. SSEService (`lib/services/sse-service.ts`)

**Purpose**: Core SSE connection management and broadcasting service.

**Key Features**:
- Connection management with Redis tracking
- Heartbeat mechanism (15-second intervals)
- Automatic cleanup of stale connections (30-second timeout)
- Support for multiple event types (attendance_update, metrics_update, notification, ping)
- Exponential backoff for reconnection

**Key Methods**:
- `createConnection(studentId, request)` - Establishes SSE connection
- `sendToStudent(studentId, event)` - Sends event to specific student
- `broadcastToClass(classId, event)` - Broadcasts to all students in class
- `closeConnection(connectionId)` - Closes connection and cleans up resources
- `cleanupStaleConnections()` - Removes inactive connections

### 2. SSE API Endpoint (`app/api/students/notifications/sse/route.ts`)

**Purpose**: HTTP endpoint for establishing SSE connections.

**Features**:
- JWT authentication via session tokens
- Rate limiting (10 connections per minute per student)
- CORS support
- Automatic connection tracking

**Usage**:
```
GET /api/students/notifications/sse
Headers: Cookie: session-token=<jwt_token>
```

### 3. SSE Client Utility (`lib/utils/sse-client.ts`)

**Purpose**: Client-side utility for managing SSE connections with automatic reconnection.

**Features**:
- Exponential backoff reconnection (1s, 2s, 4s, 8s, max 30s)
- Event type handling (attendance_update, metrics_update, notification, ping)
- Connection state management
- React hook for easy integration

**Usage**:
```typescript
import { createStudentSSEClient, useSSE } from '@/lib/utils/sse-client';

// Basic usage
const client = createStudentSSEClient({
  onMessage: (event) => console.log('Received:', event.data),
  onReconnected: () => console.log('Reconnected!'),
});
client.connect();

// React hook usage
const { client, connectionState, isConnected } = useSSE({
  onMessage: handleSSEMessage,
});
```

### 4. Attendance Broadcast Service (`lib/services/attendance-broadcast-service.ts`)

**Purpose**: Specialized service for broadcasting attendance-related events.

**Features**:
- Attendance update broadcasting
- Bulk attendance update handling
- Metrics update integration
- Notification broadcasting
- Class statistics updates

**Key Methods**:
- `broadcastAttendanceUpdate(updateData)` - Single attendance update
- `broadcastBulkAttendanceUpdate(bulkData)` - Multiple attendance updates
- `broadcastAttendanceCorrection(updateData)` - Attendance corrections
- `broadcastClassStatisticsUpdate(classId)` - Class-wide statistics
- `broadcastNotification(studentId, notification)` - Student notifications

### 5. Enhanced Attendance API (`app/api/attendance/route.ts`)

**Purpose**: Modified attendance API with integrated SSE broadcasting.

**New Features**:
- Automatic SSE event broadcasting on attendance updates
- Cache invalidation integration
- Metrics update broadcasting
- Class-wide update notifications

### 6. Test Endpoint (`app/api/students/notifications/test/route.ts`)

**Purpose**: Testing and debugging endpoint for SSE functionality.

**Test Types**:
- `ping` - Basic connection test
- `attendance_update` - Test attendance update broadcast
- `metrics_update` - Test metrics update broadcast
- `notification` - Test notification broadcast
- `class_broadcast` - Test class-wide broadcast
- `connection_info` - Get connection status information

## Event Types

### 1. Attendance Update Events
```typescript
{
  type: 'attendance_update',
  data: {
    studentId: string,
    date: string,
    period?: number,
    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE',
    subject: string,
    markedBy: string,
    classId: string,
  }
}
```

### 2. Metrics Update Events
```typescript
{
  type: 'metrics_update',
  data: {
    studentId: string,
    attendanceRate: number,
    totalClasses: number,
    presentDays: number,
    ranking: number,
    classAverage: number,
    trend: 'improving' | 'declining' | 'stable',
  }
}
```

### 3. Notification Events
```typescript
{
  type: 'notification',
  data: {
    id: string,
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'success',
    actionUrl?: string,
  }
}
```

### 4. Ping Events (Heartbeat)
```typescript
{
  type: 'ping',
  data: {
    timestamp: number,
    connectionId: string,
  }
}
```

## Redis Integration

### Connection Tracking Keys
- `sse:connection:{connectionId}` - Individual connection state
- `sse:student:{studentId}` - Array of connection IDs for student
- `sse:class:{classId}` - Array of connection IDs for class

### TTL Configuration
- Connection state: 5 minutes
- Student connections: 5 minutes
- Class connections: 5 minutes

## Requirements Compliance

### ✅ Requirement 2.1: SSE Update Latency
- Events are sent within 2 seconds of attendance marking
- Implemented in attendance API integration

### ✅ Requirement 2.2: SSE Connection Establishment
- SSE connections are established via `/api/students/notifications/sse`
- Automatic tracking and management

### ✅ Requirement 2.3: SSE Broadcast Completeness
- Class-wide broadcasts implemented via `broadcastToClass()`
- All connected students in affected class receive updates

### ✅ Requirement 2.4: SSE Reconnection Backoff
- Exponential backoff implemented in client utility
- Pattern: 1s, 2s, 4s, 8s, max 30s

### ✅ Requirement 2.5: SSE Resource Cleanup
- Automatic cleanup every 30 seconds
- Stale connection detection and removal
- Redis state cleanup

## Testing

### Manual Testing
1. **Connection Test**:
   ```bash
   curl -H "Cookie: session-token=<token>" \
        http://localhost:3000/api/students/notifications/sse
   ```

2. **Broadcast Test**:
   ```bash
   curl -X POST \
        -H "Content-Type: application/json" \
        -H "Cookie: session-token=<token>" \
        -d '{"testType": "ping"}' \
        http://localhost:3000/api/students/notifications/test
   ```

### Integration Testing
- Test attendance marking triggers SSE events
- Verify cache invalidation works correctly
- Check metrics updates are broadcast
- Validate class-wide broadcasts reach all students

### Client-Side Testing
```typescript
// Listen for SSE events
window.addEventListener('sse-attendance-update', (event) => {
  console.log('Attendance updated:', event.detail);
});

window.addEventListener('sse-metrics-update', (event) => {
  console.log('Metrics updated:', event.detail);
});

window.addEventListener('sse-notification', (event) => {
  console.log('Notification received:', event.detail);
});
```

## Performance Considerations

### Connection Limits
- Rate limited to 10 connections per minute per student
- Automatic cleanup prevents resource leaks
- Redis-based distributed tracking

### Memory Management
- Connections stored in Map for O(1) access
- Automatic cleanup of stale connections
- TTL-based Redis cleanup

### Error Handling
- Graceful degradation when SSE fails
- Attendance operations continue even if broadcasting fails
- Automatic reconnection on client side

## Deployment Notes

### Environment Variables
Ensure Redis configuration is properly set:
```env
REDIS_URL=redis://localhost:6379
# or for Upstash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Production Considerations
1. **Load Balancing**: SSE connections are sticky - consider session affinity
2. **Redis Scaling**: Use Redis Cluster for high availability
3. **Connection Monitoring**: Monitor active connection counts
4. **Rate Limiting**: Adjust limits based on expected load

## Future Enhancements

### Potential Improvements
1. **WebSocket Fallback**: Add WebSocket support for better performance
2. **Message Queuing**: Add persistent message queue for offline students
3. **Analytics**: Track connection patterns and event delivery rates
4. **Compression**: Add event compression for large payloads
5. **Authentication Refresh**: Handle token expiration gracefully

### Monitoring
1. **Connection Metrics**: Track active connections, reconnection rates
2. **Event Delivery**: Monitor event delivery success rates
3. **Performance**: Track event latency and throughput
4. **Error Rates**: Monitor connection failures and cleanup rates

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check authentication and rate limits
2. **Events Not Received**: Verify connection is active and not stale
3. **High Memory Usage**: Check for connection leaks, verify cleanup is working
4. **Redis Errors**: Ensure Redis is accessible and properly configured

### Debug Commands
```bash
# Check connection status
curl -H "Cookie: session-token=<token>" \
     http://localhost:3000/api/students/notifications/test

# Test specific event type
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Cookie: session-token=<token>" \
     -d '{"testType": "connection_info"}' \
     http://localhost:3000/api/students/notifications/test
```