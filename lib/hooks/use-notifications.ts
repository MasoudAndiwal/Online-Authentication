/**
 * useNotifications Hook
 * Manages notification state and operations for the teacher dashboard
 */

import * as React from 'react'
import type { Notification } from '@/components/teacher/notification-center'

// Mock notification data - replace with actual API calls
const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'student_risk',
    title: 'Student At Risk',
    message: 'Ahmed Hassan has exceeded 75% absence threshold in CS101',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    isRead: false,
    metadata: {
      studentName: 'Ahmed Hassan',
      className: 'CS101',
      riskType: 'محروم'
    }
  },
  {
    id: '2',
    type: 'schedule_change',
    title: 'Schedule Update',
    message: 'Your CS101 class has been moved to Room B-305',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: false,
    metadata: {
      className: 'CS101'
    }
  },
  {
    id: '3',
    type: 'system_update',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2:00 AM - 4:00 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true
  },
  {
    id: '4',
    type: 'student_risk',
    title: 'Student Needs Attention',
    message: 'Sara Ali is approaching تصدیق طلب threshold with 4 absences',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    isRead: true,
    metadata: {
      studentName: 'Sara Ali',
      className: 'CS101',
      riskType: 'تصدیق طلب'
    }
  }
]

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Load notifications on mount
  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setNotifications(getMockNotifications())
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Mark notification as read
  const markAsRead = React.useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }, [])

  // Delete notification
  const deleteNotification = React.useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Add new notification (for real-time updates)
  const addNotification = React.useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  // Get unread count
  const unreadCount = React.useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  )

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
