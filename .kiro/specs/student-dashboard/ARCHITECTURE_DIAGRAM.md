# Student Dashboard Data Architecture

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Student Dashboard Page                        │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    React Components                         │   │
│  │  - DashboardView                                            │   │
│  │  - AttendanceCalendar                                       │   │
│  │  - ClassInfo                                                │   │
│  │  - MessagingInterface                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              ↓ ↑                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   Custom Hooks Layer                        │   │
│  │                                                             │   │
│  │  ┌──────────────────┐  ┌──────────────────┐               │   │
│  │  │  Data Fetching   │  │  State Mgmt      │               │   │
│  │  │  (React Query)   │  │  (Zustand)       │               │   │
│  │  │                  │  │                  │               │   │
│  │  │ • Dashboard      │  │ • UI State       │               │   │
│  │  │ • Attendance     │  │ • Preferences    │               │   │
│  │  │ • Class Info     │  │ • Filters        │               │   │
│  │  │ • Messages       │  │ • Notifications  │               │   │
│  │  └──────────────────┘  └──────────────────┘               │   │
│  │                                                             │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │         Real-time Updates (WebSocket)                 │ │   │
│  │  │  • Attendance marked events                           │ │   │
│  │  │  • Message received events                            │ │   │
│  │  │  • Status changed events                              │ │   │
│  │  │  • Optimistic updates                                 │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              ↓ ↑                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    API Layer                                │   │
│  │  • REST API endpoints                                       │   │
│  │  • WebSocket connection                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              ↓ ↑                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Backend Services                         │   │
│  │  • Supabase Database                                        │   │
│  │  • Authentication                                           │   │
│  │  • File Storage                                             │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Flow                                    │
│                                                                      │
│  User Action                                                         │
│      ↓                                                               │
│  Component                                                           │
│      ↓                                                               │
│  Custom Hook                                                         │
│      ↓                                                               │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                                                          │       │
│  │  React Query          Zustand Store      WebSocket      │       │
│  │  (Server State)       (Client State)     (Real-time)    │       │
│  │       ↓                    ↓                  ↓          │       │
│  │   API Call            Local Update       Event Listen   │       │
│  │       ↓                    ↓                  ↓          │       │
│  │   Response            State Change       Event Received │       │
│  │       ↓                    ↓                  ↓          │       │
│  │   Cache Update        Re-render         Query Invalidate│       │
│  │                                                          │       │
│  └─────────────────────────────────────────────────────────┘       │
│      ↓                                                               │
│  Component Re-render                                                 │
│      ↓                                                               │
│  UI Update                                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Hook Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Hook Dependencies                               │
│                                                                      │
│  useStudentDashboardMetrics                                          │
│      ↓                                                               │
│  React Query                                                         │
│      ↓                                                               │
│  GET /api/students/dashboard                                         │
│                                                                      │
│  ─────────────────────────────────────────────────────────          │
│                                                                      │
│  useStudentAttendance                                                │
│      ↓                                                               │
│  React Query + useStudentDashboardStore (weekOffset)                 │
│      ↓                                                               │
│  GET /api/students/attendance/weekly                                 │
│                                                                      │
│  ─────────────────────────────────────────────────────────          │
│                                                                      │
│  useStudentRealtime                                                  │
│      ↓                                                               │
│  WebSocket + React Query + useStudentDashboardStore                  │
│      ↓                                                               │
│  WS /api/ws/student                                                  │
│      ↓                                                               │
│  Event → Query Invalidation → Re-fetch → UI Update                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    State Management Flow                             │
│                                                                      │
│  Server State (React Query)                                          │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  • Dashboard metrics                                    │        │
│  │  • Attendance records                                   │        │
│  │  • Class information                                    │        │
│  │  • Messages                                             │        │
│  │  • Academic status                                      │        │
│  │                                                         │        │
│  │  Cached with stale time                                 │        │
│  │  Automatically refetched on window focus                │        │
│  │  Invalidated by WebSocket events                        │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  Client State (Zustand)                                              │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  • UI state (sidebar, modals, active view)              │        │
│  │  • Filters (attendance, messages)                       │        │
│  │  • Notifications                                        │        │
│  │  • User preferences                                     │        │
│  │                                                         │        │
│  │  Persisted to localStorage                              │        │
│  │  Immediately updated                                    │        │
│  │  No network calls                                       │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
│  Real-time State (WebSocket)                                         │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  • Live attendance updates                              │        │
│  │  • New message notifications                            │        │
│  │  • Status change alerts                                 │        │
│  │  • Schedule updates                                     │        │
│  │                                                         │        │
│  │  Triggers query invalidation                            │        │
│  │  Creates notifications                                  │        │
│  │  Optimistic updates                                     │        │
│  └────────────────────────────────────────────────────────┘        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Real-time Update Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Real-time Update Flow                             │
│                                                                      │
│  1. Teacher marks attendance                                         │
│      ↓                                                               │
│  2. Backend sends WebSocket event                                    │
│      ↓                                                               │
│  3. useStudentRealtime receives event                                │
│      ↓                                                               │
│  4. Event handler processes event                                    │
│      ↓                                                               │
│  5. ┌─────────────────────────────────────────────────┐            │
│     │                                                  │            │
│     │  Invalidate Queries    Add Notification         │            │
│     │        ↓                      ↓                  │            │
│     │  React Query           Zustand Store            │            │
│     │  refetches data        updates notifications    │            │
│     │        ↓                      ↓                  │            │
│     │  Component             Component                │            │
│     │  re-renders            re-renders               │            │
│     │                                                  │            │
│     └─────────────────────────────────────────────────┘            │
│      ↓                                                               │
│  6. UI shows updated data + notification                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Optimistic Update Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Optimistic Update Flow                             │
│                                                                      │
│  1. User marks message as read                                       │
│      ↓                                                               │
│  2. useOptimisticUpdates.markMessageReadOptimistically()             │
│      ↓                                                               │
│  3. Immediately update React Query cache                             │
│      ↓                                                               │
│  4. UI updates instantly (message shows as read)                     │
│      ↓                                                               │
│  5. Send API request to server                                       │
│      ↓                                                               │
│  6. ┌─────────────────────────────────────────────────┐            │
│     │                                                  │            │
│     │  Success              Error                     │            │
│     │     ↓                    ↓                       │            │
│     │  Keep update        Rollback cache              │            │
│     │  (do nothing)       Show error message          │            │
│     │                     Restore previous state      │            │
│     │                                                  │            │
│     └─────────────────────────────────────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
hooks/
├── student/
│   ├── index.ts                    # Centralized exports
│   ├── README.md                   # Documentation
│   └── EXAMPLE_USAGE.tsx           # Usage examples
├── use-student-dashboard.ts        # Data fetching hooks
├── use-student-messages.ts         # Messaging hooks
└── use-student-realtime.ts         # Real-time hooks

lib/
└── stores/
    └── student-dashboard-store.ts  # Zustand store

.kiro/specs/student-dashboard/
├── requirements.md
├── design.md
├── tasks.md
├── IMPLEMENTATION_SUMMARY_TASK_12.md
└── ARCHITECTURE_DIAGRAM.md         # This file
```

## Key Design Decisions

### 1. Separation of Concerns
- **Server State**: React Query (data from API)
- **Client State**: Zustand (UI state, preferences)
- **Real-time**: WebSocket (live updates)

### 2. Caching Strategy
- Different stale times based on data volatility
- Automatic refetch on window focus for critical data
- Query invalidation on WebSocket events

### 3. Type Safety
- Comprehensive TypeScript interfaces
- Type-safe actions and state
- Proper error handling

### 4. Performance
- Optimistic updates for instant feedback
- Efficient query invalidation
- Partial state persistence
- Respect reduced motion preferences

### 5. Developer Experience
- Centralized exports
- Comprehensive documentation
- Example usage
- JSDoc comments with requirements

## Integration Points

### With Components
```typescript
// Components import from centralized location
import { useStudentDashboardMetrics } from "@/hooks/student";

// Use in component
const { data, isLoading } = useStudentDashboardMetrics(studentId);
```

### With API
```typescript
// Hooks make API calls
const response = await fetch(`/api/students/dashboard?studentId=${studentId}`);
```

### With WebSocket
```typescript
// Real-time hook connects to WebSocket
const ws = new WebSocket(`wss://host/api/ws/student?studentId=${studentId}`);
```

### With Store
```typescript
// Components access store
const { sidebarCollapsed, toggleSidebar } = useStudentDashboardStore();
```

## Testing Strategy

### Unit Tests
- Test individual hook functions
- Mock API responses
- Test state updates

### Integration Tests
- Test hook interactions
- Test WebSocket events
- Test optimistic updates

### E2E Tests
- Test complete user flows
- Test real-time updates
- Test error scenarios

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Type-safe data flow
- ✅ Efficient caching and updates
- ✅ Real-time capabilities
- ✅ Optimistic UI updates
- ✅ Developer-friendly API
- ✅ Comprehensive documentation
