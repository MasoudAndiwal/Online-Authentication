'use client'

import * as React from 'react'
import { 
  studentNotificationService,
  type StudentNotification,
  type StudentNotificationPreferences
} from '@/lib/services/student-notification-service'

// ============================================================================
// Hook for Student Notifications
// ============================================================================

export function useStudentNotifications() {
  const [notifications, setNotifications] = React.useState<StudentNotification[]>([])
  const [preferences, setPreferences] = React.useState<StudentNotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  // Fetch notifications on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [notificationsData, preferencesData] = await Promise.all([
          studentNotificationService.fetchNotifications(),
          studentNotificationService.fetchPreferences()
        ])
        setNotifications(notificationsData)
        setPreferences(preferencesData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch notifications'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Subscribe to notification updates
  React.useEffect(() => {
    const unsubscribe = studentNotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
    })

    return unsubscribe
  }, [])

  // Initialize WebSocket connection (optional - requires student ID)
  const initializeWebSocket = React.useCallback((studentId: string) => {
    studentNotificationService.initializeWebSocket(studentId)
  }, [])

  // Close WebSocket connection
  const closeWebSocket = React.useCallback(() => {
    studentNotificationService.closeWebSocket()
  }, [])

  // Mark notification as read
  const markAsRead = React.useCallback(async (notificationId: string) => {
    try {
      await studentNotificationService.markAsRead(notificationId)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = React.useCallback(async () => {
    try {
      await studentNotificationService.markAllAsRead()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }, [])

  // Delete notification
  const deleteNotification = React.useCallback(async (notificationId: string) => {
    try {
      await studentNotificationService.deleteNotification(notificationId)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [])

  // Update preferences
  const updatePreferences = React.useCallback(async (newPreferences: StudentNotificationPreferences) => {
    try {
      await studentNotificationService.updatePreferences(newPreferences)
      setPreferences(newPreferences)
    } catch (err) {
      console.error('Failed to update notification preferences:', err)
      throw err
    }
  }, [])

  // Request browser notification permission
  const requestPermission = React.useCallback(async () => {
    try {
      const permission = await studentNotificationService.requestNotificationPermission()
      return permission
    } catch (err) {
      console.error('Failed to request notification permission:', err)
      return 'denied' as NotificationPermission
    }
  }, [])

  // Toggle notification center
  const toggleNotificationCenter = React.useCallback(() => {
    setIsNotificationCenterOpen(prev => !prev)
  }, [])

  // Open notification center
  const openNotificationCenter = React.useCallback(() => {
    setIsNotificationCenterOpen(true)
  }, [])

  // Close notification center
  const closeNotificationCenter = React.useCallback(() => {
    setIsNotificationCenterOpen(false)
  }, [])

  // Toggle settings
  const toggleSettings = React.useCallback(() => {
    setIsSettingsOpen(prev => !prev)
  }, [])

  // Open settings
  const openSettings = React.useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  // Close settings
  const closeSettings = React.useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  // Computed values
  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.isRead).length
  }, [notifications])

  const hasNotifications = notifications.length > 0

  return {
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
  }
}

// ============================================================================
// Hook for Creating Notifications (for testing/demo)
// ============================================================================

export function useCreateStudentNotification() {
  const createAttendanceNotification = React.useCallback(
    async (sessionNumber: number, status: 'present' | 'absent' | 'sick' | 'leave', markedBy: string) => {
      try {
        return await studentNotificationService.createAttendanceNotification(sessionNumber, status, markedBy)
      } catch (err) {
        console.error('Failed to create attendance notification:', err)
        throw err
      }
    },
    []
  )

  const createWarningNotification = React.useCallback(
    async (remainingAbsences: number, maxAbsences: number) => {
      try {
        return await studentNotificationService.createWarningThresholdNotification(remainingAbsences, maxAbsences)
      } catch (err) {
        console.error('Failed to create warning notification:', err)
        throw err
      }
    },
    []
  )

  const createMahroomAlert = React.useCallback(async () => {
    try {
      return await studentNotificationService.createMahroomAlertNotification()
    } catch (err) {
      console.error('Failed to create mahroom alert:', err)
      throw err
    }
  }, [])

  const createTasdiqAlert = React.useCallback(async () => {
    try {
      return await studentNotificationService.createTasdiqAlertNotification()
    } catch (err) {
      console.error('Failed to create tasdiq alert:', err)
      throw err
    }
  }, [])

  const createScheduleChangeNotification = React.useCallback(
    async (className: string, changeDetails: string) => {
      try {
        return await studentNotificationService.createScheduleChangeNotification(className, changeDetails)
      } catch (err) {
        console.error('Failed to create schedule change notification:', err)
        throw err
      }
    },
    []
  )

  const createMessageNotification = React.useCallback(
    async (senderName: string, messagePreview: string) => {
      try {
        return await studentNotificationService.createMessageReceivedNotification(senderName, messagePreview)
      } catch (err) {
        console.error('Failed to create message notification:', err)
        throw err
      }
    },
    []
  )

  return {
    createAttendanceNotification,
    createWarningNotification,
    createMahroomAlert,
    createTasdiqAlert,
    createScheduleChangeNotification,
    createMessageNotification,
  }
}
