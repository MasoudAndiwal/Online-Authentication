/**
 * useNotifications Hook
 * Manages notification state and operations for the teacher dashboard
 */

import * as React from 'react'
import { useTeacherNotifications, useMarkNotificationRead, type TeacherNotification } from '@/hooks/use-teacher-notifications'
import type { Notification } from '@/components/teacher/notification-center'

// Convert API notification to component notification format
const convertNotification = (apiNotification: TeacherNotification): Notification => ({
  id: apiNotification.id,
  type: apiNotification.type as Notification['type'],
  title: apiNotification.title,
  message: apiNotification.message,
  timestamp: new Date(apiNotification.timestamp),
  isRead: apiNotification.isRead,
  actionUrl: apiNotification.actionUrl,
  metadata: apiNotification.metadata
})

export function useNotifications() {
  const { data, isLoading, refetch } = useTeacherNotifications()
  const markReadMutation = useMarkNotificationRead()
  
  // Convert API notifications to component format
  const notifications = React.useMemo(() => {
    if (!data?.notifications) return []
    return data.notifications.map(convertNotification)
  }, [data])

  const unreadCount = data?.unreadCount || 0

  // Mark notification as read
  const markAsRead = React.useCallback((notificationId: string) => {
    markReadMutation.mutate(notificationId)
  }, [markReadMutation])

  // Mark all notifications as read
  const markAllAsRead = React.useCallback(() => {
    // Mark all notifications as read
    notifications.forEach(n => {
      if (!n.isRead) {
        markReadMutation.mutate(n.id)
      }
    })
  }, [notifications, markReadMutation])

  // Delete notification (for now, just mark as read)
  const deleteNotification = React.useCallback((notificationId: string) => {
    markReadMutation.mutate(notificationId)
  }, [markReadMutation])

  // Add new notification (for real-time updates)
  const addNotification = React.useCallback((_notification: Notification) => {
    // Refetch to get latest notifications
    refetch()
  }, [refetch])

  // Get notifications by type
  const getByType = React.useCallback(
    (type: Notification['type']) => notifications.filter(n => n.type === type),
    [notifications]
  )

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getByType
  }
}
