# Student Dashboard Hooks

This directory contains all React hooks for the Student Dashboard feature, implementing data fetching, state management, and real-time updates.

## Overview

The student dashboard hooks are organized into three main categories:

1. **Data Fetching Hooks** - React Query hooks for fetching student data
2. **State Management** - Zustand store for client-side UI state
3. **Real-time Updates** - WebSocket hooks for live data updates

## Requirements Coverage

- **Requirements 1.2, 3.1, 5.1**: Dashboard metrics and class information
- **Requirements 11.1, 13.5**: Real-time updates and messaging
- **Requirements 7.1**: Client state management for UI preferences

## Installation

All hooks are exported from a single entry point:

```typescript
import {
  useStudentDashboardMetrics,
  useStudentAttendance,
  useStudentClass,
  useStudentMessages,
  useStudentRealtime,
  useStudentDashboardStore,
} from "@/hooks/student";
```

## Data Fetching Hooks

### useStudentDashboardMetrics

Fetches dashboard metrics including attendance rate, class counts, and rankings.

```typescript
import { useStudentDashboardMetrics } from "@/hooks/student";

function DashboardPage() {
  const studentId = "student-123";
  const { data, isLoading, error, refetch } = useStudentDashboardMetrics(studentId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <h1>Attendance Rate: {data.attendanceRate}%</h1>
      <p>Total Classes: {data.totalClasses}</p>
      <p>Present: {data.presentDays}</p>
      <p>Absent: {data.absentDays}</p>
    </div>
  );
}
```

**Returns:**
- `totalClasses`: Total number of classes
- `attendanceRate`: Percentage of attendance
- `presentDays`, `absentDays`, `sickDays`, `leaveDays`: Counts by status
- `classAverage`: Class average attendance rate
- `ranking`: Student's ranking in class

### useStudentAttendance

Fetches weekly attendance data with session-level details.

```typescript
import { useStudentAttendance } from "@/hooks/student";

function WeeklyCalendar() {
  const studentId = "student-123";
  const weekOffset = 0; // 0 = current week, -1 = previous, 1 = next
  const { data, isLoading } = useStudentAttendance(studentId, weekOffset);

  return (
    <div>
      {data?.map((day) => (
        <DayCard key={day.date.toISOString()}>
          <h3>{day.dayName}</h3>
          <StatusBadge status={day.status} />
          {day.sessions.map((session) => (
            <SessionDetail key={session.sessionNumber} session={session} />
          ))}
        </DayCard>
      ))}
    </div>
  );
}
```

### useAttendanceHistory

Fetches complete attendance history with filtering options.

```typescript
import { useAttendanceHistory } from "@/hooks/student";

function AttendanceHistory() {
  const studentId = "student-123";
  const [filters, setFilters] = useState({
    startDate: new Date("2024-01-01"),
    endDate: new Date(),
    statusTypes: ["absent", "sick"],
  });

  const { data, isLoading } = useAttendanceHistory(studentId, filters);

  return (
    <div>
      <FilterPanel filters={filters} onChange={setFilters} />
      <Timeline records={data} />
    </div>
  );
}
```

### useStudentClass

Fetches class information including schedule, teacher, and policies.

```typescript
import { useStudentClass } from "@/hooks/student";

function ClassInfo() {
  const studentId = "student-123";
  const { data: classInfo, isLoading } = useStudentClass(studentId);

  return (
    <div>
      <h1>{classInfo?.name}</h1>
      <p>Code: {classInfo?.code}</p>
      <TeacherCard teacher={classInfo?.teacher} />
      <ScheduleGrid schedule={classInfo?.schedule} />
      <PolicyCard policy={classInfo?.attendancePolicy} />
    </div>
  );
}
```

### useAcademicStatus

Calculates and fetches academic status based on attendance.

```typescript
import { useAcademicStatus } from "@/hooks/student";

function AcademicStatusAlert() {
  const studentId = "student-123";
  const { data: status, isLoading } = useAcademicStatus(studentId);

  return (
    <AlertCard
      type={status?.status}
      message={status?.message}
      remainingAbsences={status?.remainingAbsences}
    />
  );
}
```

### useStudentMessages

Fetches student conversations and messages.

```typescript
import { useStudentConversations, useConversationMessages } from "@/hooks/student";

function MessagingInterface() {
  const studentId = "student-123";
  const [activeConversation, setActiveConversation] = useState<string>();

  const { data: conversations } = useStudentConversations(studentId);
  const { data: messages } = useConversationMessages(activeConversation);

  return (
    <div className="flex">
      <ConversationList
        conversations={conversations}
        onSelect={setActiveConversation}
      />
      <MessageThread messages={messages} />
    </div>
  );
}
```

### useSendMessage

Mutation hook for sending messages.

```typescript
import { useSendMessage } from "@/hooks/student";

function ComposeMessage() {
  const sendMessage = useSendMessage();

  const handleSend = async () => {
    await sendMessage.mutateAsync({
      recipientId: "teacher-123",
      recipientType: "teacher",
      content: "Hello, I have a question about my attendance.",
      category: "attendance_inquiry",
      attachments: [],
    });
  };

  return (
    <form onSubmit={handleSend}>
      <textarea name="content" />
      <button type="submit" disabled={sendMessage.isPending}>
        Send
      </button>
    </form>
  );
}
```

## State Management

### useStudentDashboardStore

Zustand store for managing UI state and preferences.

```typescript
import { useStudentDashboardStore } from "@/hooks/student";

function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useStudentDashboardStore();

  return (
    <aside className={sidebarCollapsed ? "collapsed" : "expanded"}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

**Available State:**
- `sidebarCollapsed`: Boolean for sidebar state
- `activeView`: Current active view
- `notificationsPanelOpen`: Notifications panel state
- `currentWeekOffset`: Week navigation offset
- `attendanceFilters`: Filters for attendance history
- `messageFilters`: Filters for messages
- `notifications`: Array of notifications
- `preferences`: User preferences

**Available Actions:**
- `setSidebarCollapsed(collapsed)`: Set sidebar state
- `toggleSidebar()`: Toggle sidebar
- `setActiveView(view)`: Set active view
- `goToPreviousWeek()`: Navigate to previous week
- `goToNextWeek()`: Navigate to next week
- `addNotification(notification)`: Add notification
- `markNotificationAsRead(id)`: Mark notification as read
- `setPreferences(preferences)`: Update preferences

### useStudentDashboardSelectors

Hook for computed values and selectors.

```typescript
import { useStudentDashboardSelectors } from "@/hooks/student";

function NotificationBell() {
  const { unreadNotificationsCount, notifications } = useStudentDashboardSelectors();

  return (
    <button>
      <BellIcon />
      {unreadNotificationsCount > 0 && (
        <Badge>{unreadNotificationsCount}</Badge>
      )}
    </button>
  );
}
```

### useShouldAnimate

Hook to check if animations should be enabled.

```typescript
import { useShouldAnimate } from "@/hooks/student";

function AnimatedCard() {
  const shouldAnimate = useShouldAnimate();

  return (
    <motion.div
      animate={shouldAnimate ? { scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      Card Content
    </motion.div>
  );
}
```

## Real-time Updates

### useStudentRealtime

WebSocket hook for real-time updates.

```typescript
import { useStudentRealtime } from "@/hooks/student";

function Dashboard() {
  const studentId = "student-123";
  
  const { isConnected, connectionError, reconnect } = useStudentRealtime(studentId, {
    onAttendanceMarked: (event) => {
      console.log("Attendance marked:", event);
      toast.success(`Attendance marked as ${event.status}`);
    },
    onMessageReceived: (event) => {
      console.log("New message:", event);
      toast.info(`New message from ${event.senderName}`);
    },
    onStatusChanged: (event) => {
      console.log("Status changed:", event);
      toast.warning(event.reason);
    },
  });

  return (
    <div>
      <ConnectionIndicator isConnected={isConnected} error={connectionError} />
      {connectionError && <button onClick={reconnect}>Reconnect</button>}
    </div>
  );
}
```

### useOptimisticUpdates

Hook for optimistic UI updates.

```typescript
import { useOptimisticUpdates } from "@/hooks/student";

function AttendanceMarker() {
  const { updateAttendanceOptimistically } = useOptimisticUpdates();
  const studentId = "student-123";

  const handleMark = (status: string) => {
    // Update UI immediately
    updateAttendanceOptimistically(studentId, {
      status: status as any,
      date: new Date().toISOString(),
      sessionNumber: 1,
    });

    // Send to server
    markAttendance(studentId, status);
  };

  return <button onClick={() => handleMark("present")}>Mark Present</button>;
}
```

### useConnectionStatus

Hook to monitor connection status.

```typescript
import { useConnectionStatus } from "@/hooks/student";

function ConnectionIndicator() {
  const { isOnline, isConnected, status, errorMessage } = useConnectionStatus("student-123");

  return (
    <div className={`status-${status}`}>
      {status === "offline" && "You are offline"}
      {status === "connecting" && "Connecting..."}
      {status === "connected" && "Connected"}
      {status === "error" && `Error: ${errorMessage}`}
    </div>
  );
}
```

## Best Practices

### 1. Always Check Loading States

```typescript
const { data, isLoading, error } = useStudentDashboardMetrics(studentId);

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

// Render with data
```

### 2. Use Optimistic Updates for Better UX

```typescript
const { updateAttendanceOptimistically } = useOptimisticUpdates();

// Update UI immediately, then sync with server
updateAttendanceOptimistically(studentId, update);
await syncWithServer(update);
```

### 3. Handle Real-time Events Gracefully

```typescript
useStudentRealtime(studentId, {
  onAttendanceMarked: (event) => {
    // Show toast notification
    toast.success("Attendance updated");
    
    // Optionally trigger other actions
    refetchDashboard();
  },
});
```

### 4. Persist Important UI State

The Zustand store automatically persists preferences and sidebar state. Use it for:
- User preferences (theme, animations)
- UI state (sidebar collapsed, active view)
- Filters and sort preferences

### 5. Clean Up Subscriptions

Real-time hooks automatically clean up on unmount. No manual cleanup needed.

## Testing

### Testing Data Fetching Hooks

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStudentDashboardMetrics } from "@/hooks/student";

test("fetches dashboard metrics", async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useStudentDashboardMetrics("student-123"), {
    wrapper,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

### Testing State Management

```typescript
import { renderHook, act } from "@testing-library/react";
import { useStudentDashboardStore } from "@/hooks/student";

test("toggles sidebar", () => {
  const { result } = renderHook(() => useStudentDashboardStore());

  expect(result.current.sidebarCollapsed).toBe(false);

  act(() => {
    result.current.toggleSidebar();
  });

  expect(result.current.sidebarCollapsed).toBe(true);
});
```

## Troubleshooting

### WebSocket Connection Issues

If WebSocket connections fail:

1. Check that the WebSocket server is running
2. Verify the WebSocket URL is correct
3. Check browser console for connection errors
4. Ensure CORS is configured correctly

### Query Not Updating

If queries don't update after mutations:

1. Check that query keys match
2. Verify `invalidateQueries` is called
3. Check network tab for API responses
4. Ensure React Query DevTools is installed for debugging

### State Not Persisting

If Zustand state doesn't persist:

1. Check browser localStorage
2. Verify `persist` middleware is configured
3. Check `partialize` function includes the state you want to persist

## API Endpoints

The hooks expect these API endpoints to be available:

- `GET /api/students/dashboard?studentId={id}` - Dashboard metrics
- `GET /api/students/attendance/weekly?studentId={id}&startDate={date}&endDate={date}` - Weekly attendance
- `GET /api/attendance/history?studentId={id}` - Attendance history
- `GET /api/students/{id}/class` - Class information
- `GET /api/students/{id}/academic-status` - Academic status
- `GET /api/students/{id}/conversations` - Conversations
- `GET /api/conversations/{id}/messages` - Messages
- `POST /api/messages/send` - Send message
- `WS /api/ws/student?studentId={id}` - WebSocket connection

## Contributing

When adding new hooks:

1. Follow the existing patterns
2. Add TypeScript types
3. Include JSDoc comments with requirements
4. Export from `index.ts`
5. Update this README
6. Add tests

## License

Part of the University Attendance System.
