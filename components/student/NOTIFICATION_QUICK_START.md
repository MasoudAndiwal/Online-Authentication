# Student Notification System - Quick Start Guide

## 🚀 Quick Implementation

### 1. Import Components

```tsx
import {
  StudentNotificationCenter,
  StudentNotificationTrigger,
  StudentNotificationSettings
} from '@/components/student'
import { useStudentNotifications } from '@/hooks/use-student-notifications'
```

### 2. Use the Hook

```tsx
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
```

### 3. Add Components to Your Layout

```tsx
{/* Notification Bell */}
<StudentNotificationTrigger
  unreadCount={unreadCount}
  onClick={openNotificationCenter}
/>

{/* Notification Panel */}
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
```

## 📱 Notification Types

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `attendance_marked` | UserCheck | Green | Attendance marked for session |
| `warning_threshold` | AlertTriangle | Yellow | Approaching absence limit |
| `critical_alert` | AlertTriangle | Red | محروم or تصدیق طلب status |
| `schedule_change` | Calendar | Blue | Class schedule updated |
| `message_received` | MessageSquare | Green | New message from teacher |

## 🎨 Green Theme

- Primary: `emerald-500` (#10b981)
- Backgrounds: `emerald-50`, `emerald-100`
- Text: `emerald-600`, `emerald-700`
- Gradients: `from-emerald-500 to-emerald-600`

## 📐 Responsive Breakpoints

- **Mobile**: Full screen (375px - 767px)
- **Tablet**: Medium width (768px - 1023px)
- **Desktop**: Standard width (1024px+)

## 🧪 Test It

Visit the demo page: `/student/notifications-demo`

## 📚 Full Documentation

See `NOTIFICATION_SYSTEM_IMPLEMENTATION.md` for complete details.

## ✅ Features

- ✅ 5 notification types
- ✅ Slide-out panel
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Customizable preferences
- ✅ Quiet hours
- ✅ Email notifications
- ✅ WebSocket support
- ✅ Browser notifications
- ✅ Fully responsive
- ✅ Touch-friendly (44px targets)
- ✅ WCAG 2.1 AA compliant
- ✅ Green theme throughout
