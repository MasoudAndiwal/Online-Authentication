# Student Notification System Implementation

## Overview

The Student Notification System provides a comprehensive notification management solution for students in the University Attendance System. It features a green-themed design, fully responsive layouts, and support for multiple notification types including attendance updates, warnings, critical alerts, schedule changes, and messages.

## Features

### ✅ Notification Types

1. **Attendance Marked** (`attendance_marked`)
   - Notifies students when their attendance is marked
   - Shows session number and status (Present, Absent, Sick, Leave)
   - Green theme with UserCheck icon

2. **Warning Threshold** (`warning_threshold`)
   - Alerts when approaching 75% of maximum absences
   - Shows remaining absences count
   - Yellow theme with AlertTriangle icon

3. **Critical Alerts** (`critical_alert`)
   - **محروم (Disqualified)**: Exceeded maximum absences, not eligible for exams
   - **تصدیق طلب (Certification Required)**: Need to submit medical certificates
   - Red theme with AlertTriangle icon
   - Cannot be disabled in settings

4. **Schedule Change** (`schedule_change`)
   - Notifies about class schedule updates
   - Blue theme with Calendar icon

5. **Message Received** (`message_received`)
   - Alerts when receiving new messages from teachers/office
   - Shows sender name
   - Green theme with MessageSquare icon

### ✅ Notification Center

- **Slide-out panel** from the right side
- **Responsive widths**:
  - Mobile: Full screen
  - Tablet: Medium width (max-w-md)
  - Desktop: Standard width (max-w-lg)
- **Unread indicator**: Green vertical bar on the left
- **Mark as read**: Individual or bulk actions
- **Delete notifications**: Smooth animation on removal
- **Empty state**: Friendly message when no notifications
- **Touch-friendly**: 44px minimum touch targets on mobile

### ✅ Notification Settings

- **Notification Type Toggles**:
  - Attendance Marked
  - Warning Thresholds
  - Critical Alerts (always enabled)
  - Schedule Changes
  - Message Received

- **Delivery Methods**:
  - In-App Notifications
  - Email Notifications

- **Quiet Hours**:
  - Enable/disable quiet hours
  - Set start and end times
  - Critical alerts still delivered during quiet hours

### ✅ Responsive Design

**Mobile (375px - 767px)**:
- Full-screen notification panel
- Stacked layout for settings
- 44px minimum touch targets
- Simplified metadata display

**Tablet (768px - 1023px)**:
- Medium-width slide-out panel
- Two-column settings layout
- Optimized spacing

**Desktop (1024px+)**:
- Standard-width slide-out panel
- Multi-column settings layout
- Hover effects enabled
- Spacious layout

## Components

### 1. StudentNotificationCenter

Main notification panel component with slide-out animation.

```tsx
import { StudentNotificationCenter } from '@/components/student'

<StudentNotificationCenter
  isOpen={isOpen}
  onClose={onClose}
  notifications={notifications}
  onMarkAsRead={markAsRead}
  onMarkAllAsRead={markAllAsRead}
  onDelete={deleteNotification}
  onOpenSettings={openSettings}
/>
```

**Props**:
- `isOpen`: boolean - Controls panel visibility
- `onClose`: () => void - Close handler
- `notifications`: StudentNotification[] - Array of notifications
- `onMarkAsRead`: (id: string) => void - Mark single notification as read
- `onMarkAllAsRead`: () => void - Mark all notifications as read
- `onDelete`: (id: string) => void - Delete notification
- `onOpenSettings`: () => void - Open settings dialog

### 2. StudentNotificationTrigger

Notification bell button with unread count badge.

```tsx
import { StudentNotificationTrigger } from '@/components/student'

<StudentNotificationTrigger
  unreadCount={unreadCount}
  onClick={openNotificationCenter}
/>
```

**Props**:
- `unreadCount`: number - Number of unread notifications
- `onClick`: () => void - Click handler
- `className`: string (optional) - Additional CSS classes

### 3. StudentNotificationSettings

Settings dialog for notification preferences.

```tsx
import { StudentNotificationSettings } from '@/components/student'

<StudentNotificationSettings
  isOpen={isOpen}
  onClose={onClose}
  preferences={preferences}
  onSave={updatePreferences}
/>
```

**Props**:
- `isOpen`: boolean - Controls dialog visibility
- `onClose`: () => void - Close handler
- `preferences`: StudentNotificationPreferences - Current preferences
- `onSave`: (preferences: StudentNotificationPreferences) => void - Save handler

## Hooks

### useStudentNotifications

Main hook for managing notification state and actions.

```tsx
import { useStudentNotifications } from '@/hooks/use-student-notifications'

const {
  // State
  notifications,
  preferences,
  isLoading,
  error,
  unreadCount,
  hasNotifications,
  isNotificationCenterOpen,
  isSettingsOpen,

  // Actions
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences,
  requestPermission,
  initializeWebSocket,
  closeWebSocket,

  // UI Controls
  toggleNotificationCenter,
  openNotificationCenter,
  closeNotificationCenter,
  toggleSettings,
  openSettings,
  closeSettings,
} = useStudentNotifications()
```

### useCreateStudentNotification

Hook for creating test notifications (demo/testing purposes).

```tsx
import { useCreateStudentNotification } from '@/hooks/use-student-notifications'

const {
  createAttendanceNotification,
  createWarningNotification,
  createMahroomAlert,
  createTasdiqAlert,
  createScheduleChangeNotification,
  createMessageNotification,
} = useCreateStudentNotification()
```

## Service

### studentNotificationService

Singleton service for notification management.

```tsx
import { studentNotificationService } from '@/lib/services/student-notification-service'

// Fetch notifications
const notifications = await studentNotificationService.fetchNotifications()

// Mark as read
await studentNotificationService.markAsRead(notificationId)

// Mark all as read
await studentNotificationService.markAllAsRead()

// Delete notification
await studentNotificationService.deleteNotification(notificationId)

// Fetch preferences
const preferences = await studentNotificationService.fetchPreferences()

// Update preferences
await studentNotificationService.updatePreferences(newPreferences)

// Create notifications
await studentNotificationService.createAttendanceNotification(2, 'present', 'Dr. Ahmed')
await studentNotificationService.createWarningThresholdNotification(3, 12)
await studentNotificationService.createMahroomAlertNotification()
await studentNotificationService.createTasdiqAlertNotification()
await studentNotificationService.createScheduleChangeNotification('CS-101', 'Time changed')
await studentNotificationService.createMessageReceivedNotification('Dr. Ahmed', 'Message preview')

// Subscribe to updates
const unsubscribe = studentNotificationService.subscribe((notifications) => {
  console.log('Notifications updated:', notifications)
})

// Initialize WebSocket (for real-time updates)
studentNotificationService.initializeWebSocket(studentId)

// Close WebSocket
studentNotificationService.closeWebSocket()
```

## Types

### StudentNotification

```typescript
interface StudentNotification {
  id: string
  type: StudentNotificationType
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    sessionNumber?: number
    status?: 'present' | 'absent' | 'sick' | 'leave'
    remainingAbsences?: number
    alertType?: 'محروم' | 'تصدیق طلب' | 'warning'
    senderName?: string
    [key: string]: unknown
  }
}

type StudentNotificationType = 
  | 'attendance_marked' 
  | 'warning_threshold' 
  | 'critical_alert' 
  | 'schedule_change' 
  | 'message_received'
```

### StudentNotificationPreferences

```typescript
interface StudentNotificationPreferences {
  attendanceMarked: boolean
  warningThresholds: boolean
  criticalAlerts: boolean
  scheduleChanges: boolean
  messageReceived: boolean
  inAppNotifications: boolean
  emailNotifications: boolean
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}
```

## Usage Example

### Basic Implementation

```tsx
'use client'

import * as React from 'react'
import {
  StudentNotificationCenter,
  StudentNotificationTrigger,
  StudentNotificationSettings
} from '@/components/student'
import { useStudentNotifications } from '@/hooks/use-student-notifications'

export default function StudentDashboard() {
  const {
    notifications,
    preferences,
    unreadCount,
    isNotificationCenterOpen,
    isSettingsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    openNotificationCenter,
    closeNotificationCenter,
    openSettings,
    closeSettings,
  } = useStudentNotifications()

  return (
    <div>
      {/* Notification Bell in Header */}
      <StudentNotificationTrigger
        unreadCount={unreadCount}
        onClick={openNotificationCenter}
      />

      {/* Notification Center Panel */}
      <StudentNotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={closeNotificationCenter}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onOpenSettings={openSettings}
      />

      {/* Settings Dialog */}
      <StudentNotificationSettings
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        preferences={preferences}
        onSave={updatePreferences}
      />
    </div>
  )
}
```

### With WebSocket Real-time Updates

```tsx
'use client'

import * as React from 'react'
import { useStudentNotifications } from '@/hooks/use-student-notifications'

export default function StudentDashboard() {
  const { initializeWebSocket, closeWebSocket } = useStudentNotifications()
  const studentId = 'student-123' // Get from auth context

  React.useEffect(() => {
    // Initialize WebSocket connection
    initializeWebSocket(studentId)

    // Cleanup on unmount
    return () => {
      closeWebSocket()
    }
  }, [studentId, initializeWebSocket, closeWebSocket])

  // ... rest of component
}
```

## Demo Page

A comprehensive demo page is available at `/student/notifications-demo` that showcases:

- Creating all notification types
- Viewing notification statistics
- Opening notification center
- Managing notification settings
- Testing responsive layouts

## API Integration

The service currently uses mock data. To integrate with a real API:

1. **Replace mock data** in `lib/services/student-notification-service.ts`
2. **Update API endpoints**:
   - `GET /api/students/notifications` - Fetch notifications
   - `POST /api/students/notifications/:id/read` - Mark as read
   - `POST /api/students/notifications/read-all` - Mark all as read
   - `DELETE /api/students/notifications/:id` - Delete notification
   - `GET /api/students/notifications/preferences` - Fetch preferences
   - `PUT /api/students/notifications/preferences` - Update preferences

3. **Configure WebSocket URL** in environment variables:
   ```env
   NEXT_PUBLIC_WS_URL=wss://your-domain.com/student-notifications
   ```

## Accessibility

- ✅ **Keyboard Navigation**: Full keyboard support with proper tab order
- ✅ **Screen Reader Support**: Comprehensive ARIA labels and live regions
- ✅ **Focus Management**: Clear focus indicators with green theme
- ✅ **Touch Targets**: Minimum 44px on mobile devices
- ✅ **Color Contrast**: WCAG 2.1 AA compliant (4.5:1 ratio)
- ✅ **Semantic HTML**: Proper heading hierarchy and landmarks

## Performance

- ✅ **Code Splitting**: Lazy loading for notification components
- ✅ **Memoization**: React.memo for expensive components
- ✅ **Optimistic Updates**: Immediate UI feedback
- ✅ **Efficient Re-renders**: Proper dependency arrays in hooks
- ✅ **Animation Performance**: Hardware-accelerated transforms

## Browser Notifications

The system supports native browser notifications:

```tsx
import { useStudentNotifications } from '@/hooks/use-student-notifications'

const { requestPermission } = useStudentNotifications()

// Request permission
const permission = await requestPermission()

if (permission === 'granted') {
  console.log('Browser notifications enabled')
}
```

## Testing

Run the demo page to test all features:

```bash
npm run dev
# Navigate to http://localhost:3000/student/notifications-demo
```

## Color Theme

The notification system uses the student green theme:

- **Primary**: `emerald-500` (#10b981)
- **Light**: `emerald-50` - Backgrounds
- **Medium**: `emerald-100` - Hover states
- **Dark**: `emerald-600`, `emerald-700` - Text and emphasis
- **Gradient**: `from-emerald-500 to-emerald-600` - Buttons and icons

## Requirements Validation

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 11.1**: Display in-app notifications when attendance is marked
- ✅ **Requirement 11.2**: Alert students when approaching warning thresholds (75% of max absences)
- ✅ **Requirement 11.3**: Send critical alerts for محروم or تصدیق طلب status
- ✅ **Requirement 11.4**: Notify students of schedule changes and policy updates
- ✅ **Requirement 11.5**: Provide notification history with read/unread status tracking
- ✅ **Requirement 7.1**: Fully responsive across all devices
- ✅ **Requirement 7.2**: Touch-optimized with 44px minimum touch targets

## Future Enhancements

- [ ] Push notifications for mobile devices
- [ ] Notification grouping by type
- [ ] Advanced filtering and search
- [ ] Notification templates
- [ ] Batch operations
- [ ] Export notification history
- [ ] Notification analytics dashboard

## Support

For issues or questions about the notification system, please refer to:
- Design document: `.kiro/specs/student-dashboard/design.md`
- Requirements: `.kiro/specs/student-dashboard/requirements.md`
- Tasks: `.kiro/specs/student-dashboard/tasks.md`
