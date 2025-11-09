# Notification Center - Quick Reference

## 🚀 Quick Start

### 1. Import Components
```tsx
import { 
  NotificationCenter, 
  NotificationTrigger 
} from '@/components/teacher'
import { useNotifications } from '@/lib/hooks/use-notifications'
```

### 2. Use in Component
```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotifications()

  return (
    <>
      <NotificationTrigger
        unreadCount={unreadCount}
        onClick={() => setIsOpen(true)}
      />
      
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </>
  )
}
```

## 📦 Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `NotificationCenter` | Main notification panel | `isOpen`, `onClose`, `notifications`, `onMarkAsRead`, `onMarkAllAsRead`, `onDelete`, `onOpenSettings` |
| `NotificationTrigger` | Bell icon button | `unreadCount`, `onClick`, `className` |
| `NotificationSettings` | Settings panel | `isOpen`, `onClose`, `preferences`, `onSave` |

## 🎨 Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `student_risk` | ⚠️ | Red | محروم, تصدیق طلب alerts |
| `system_update` | ℹ️ | Blue | System maintenance, features |
| `schedule_change` | 📅 | Orange | Class schedule changes |

## 🔧 Service Methods

```tsx
import { notificationService } from '@/lib/services/notification-service'

// Fetch notifications
const notifications = await notificationService.fetchNotifications()

// Mark as read
await notificationService.markAsRead(notificationId)

// Mark all as read
await notificationService.markAllAsRead()

// Delete notification
await notificationService.deleteNotification(notificationId)

// Get preferences
const preferences = await notificationService.fetchPreferences()

// Update preferences
await notificationService.updatePreferences(newPreferences)

// Subscribe to updates
const unsubscribe = notificationService.subscribe((notifications) => {
  console.log('Updated:', notifications)
})
```

## 🪝 Hook API

```tsx
const {
  notifications,      // Notification[]
  preferences,        // NotificationPreferences | null
  unreadCount,        // number
  isLoading,          // boolean
  error,              // string | null
  markAsRead,         // (id: string) => Promise<void>
  markAllAsRead,      // () => Promise<void>
  deleteNotification, // (id: string) => Promise<void>
  updatePreferences,  // (prefs: NotificationPreferences) => Promise<void>
  refresh             // () => Promise<void>
} = useNotifications()
```

## 📝 Type Definitions

### Notification
```tsx
interface Notification {
  id: string
  type: 'student_risk' | 'system_update' | 'schedule_change'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  actionUrl?: string
  metadata?: {
    studentName?: string
    className?: string
    riskType?: 'محروم' | 'تصدیق طلب'
  }
}
```

### NotificationPreferences
```tsx
interface NotificationPreferences {
  studentRiskAlerts: boolean
  systemUpdates: boolean
  scheduleChanges: boolean
  inAppNotifications: boolean
  emailNotifications: boolean
  enableDigest: boolean
  digestFrequency: 'daily' | 'weekly' | 'never'
  digestTime: string
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  notifyOnMahroom: boolean
  notifyOnTasdiq: boolean
  notifyOnAbsenceCount: boolean
  absenceCountThreshold: number
}
```

## 🎯 Common Use Cases

### Add Test Notification
```tsx
await notificationService.createNotification(
  'student_risk',
  'Student at Risk',
  'Ahmad Hassan is approaching محروم threshold',
  {
    studentName: 'Ahmad Hassan',
    className: 'CS-101',
    riskType: 'محروم'
  }
)
```

### Filter Unread Notifications
```tsx
const unreadNotifications = notifications.filter(n => !n.isRead)
```

### Get Notifications by Type
```tsx
const riskAlerts = notifications.filter(n => n.type === 'student_risk')
```

### Generate Digest
```tsx
const digest = await notificationService.generateDigest('daily')
console.log(`Total: ${digest.totalNotifications}`)
console.log(`Unread: ${digest.unreadCount}`)
console.log(`By Type:`, digest.byType)
```

## 🎨 Styling Classes

### Orange Theme
```tsx
// Backgrounds
'bg-orange-50'                           // Light background
'bg-orange-100'                          // Medium background
'bg-gradient-to-br from-orange-50 to-orange-100/50'  // Gradient

// Text
'text-orange-600'                        // Primary text
'text-orange-700'                        // Dark text

// Buttons
'bg-orange-50 text-orange-700 hover:bg-orange-100'  // Filled button
'border-0 shadow-sm rounded-xl'          // No borders, soft shadow
```

### Glass Morphism
```tsx
'bg-white/80 backdrop-blur-xl'           // Semi-transparent with blur
'bg-white backdrop-blur-xl'              // Solid with blur
```

## 🔔 Demo Page

Visit `/teacher/notifications-demo` to see:
- Interactive notification panel
- Settings configuration
- Test controls
- Live statistics

## 📚 Documentation

- **Implementation Guide**: `NOTIFICATION_CENTER_IMPLEMENTATION.md`
- **Visual Guide**: `NOTIFICATION_CENTER_VISUAL_GUIDE.md`
- **Completion Summary**: `.kiro/specs/teacher-dashboard/TASK_7_COMPLETION_SUMMARY.md`

## ⚡ Performance Tips

1. **Lazy Load Settings**: Settings panel only loads when opened
2. **Optimistic Updates**: UI updates immediately, syncs in background
3. **Memoization**: Use React.memo for expensive components
4. **Subscription Pattern**: Efficient real-time updates

## 🐛 Troubleshooting

### Notifications not updating
```tsx
// Manually refresh
const { refresh } = useNotifications()
await refresh()
```

### WebSocket not connecting
```tsx
// Check initialization
notificationService.initializeWebSocket(userId)
```

### Preferences not saving
```tsx
// Check for errors
try {
  await updatePreferences(newPreferences)
} catch (error) {
  console.error('Failed to save:', error)
}
```

## 🔗 Related Components

- `StudentProgressCard` - Shows student risk status
- `RiskAssessment` - Calculates risk levels
- `ReportsDashboard` - Generates reports that trigger notifications

## 📱 Mobile Support

- Full touch support
- Responsive layouts
- Optimized for small screens
- Swipe gestures (future enhancement)

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements
- Focus management
- High contrast support

## 🚀 Next Steps

1. **Backend Integration**: Replace mock data with API calls
2. **WebSocket**: Implement real-time connection
3. **Push Notifications**: Add browser push support
4. **Testing**: Add unit and integration tests
5. **Analytics**: Track notification engagement

---

**Quick Links:**
- Demo: `/teacher/notifications-demo`
- Components: `components/teacher/notification-*.tsx`
- Service: `lib/services/notification-service.ts`
- Hook: `lib/hooks/use-notifications.ts`
