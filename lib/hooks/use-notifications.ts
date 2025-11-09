'use client'

import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/services/notification-service'
import type { Notification, NotificationPreferences } from '@/lib/services/notification-service'

/**
 * Custom hook for managing notifications
 * 
 * Provides:
 * - Notification list with real-time updates
 * - Unread count
 * - Mark as read functionality
 * - Delete functionality
 * - Notification preferences management
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [notificationsData, preferencesData] = await Promise.all([
          notificationService.fetchNotifications(),
          notificationService.fetchPreferences()
        ])
        setNotifications(notificationsData)
        setPreferences(preferencesData)
        setError(null)
      } catch (err) {
        setError('Failed to load notifications')
        console.error('Error fetching notifications:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
    })

    return unsubscribe
  }, [])

  // Initialize WebSocket connection (placeholder for future implementation)
  useEffect(() => {
    // In production, get userId from auth context
    const userId = 'current-user-id'
    notificationService.initializeWebSocket(userId)

    return () => {
      notificationService.closeWebSocket()
    }
  }, [])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError('Failed to mark notification as read')
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError('Failed to mark all notifications as read')
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError('Failed to delete notification')
    }
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      await notificationService.updatePreferences(newPreferences)
      setPreferences(newPreferences)
    } catch (err) {
      console.error('Error updating preferences:', err)
      setError('Failed to update preferences')
      throw err
    }
  }, [])

  // Refresh notifications
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const notificationsData = await notificationService.fetchNotifications()
      setNotifications(notificationsData)
      setError(null)
    } catch (err) {
      console.error('Error refreshing notifications:', err)
      setError('Failed to refresh notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    notifications,
    preferences,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refresh
  }
}

/**
 * Hook for notification digest
 */
export function useNotificationDigest(frequency: 'daily' | 'weekly') {
  const [digest, setDigest] = useState<{
    totalNotifications: number
    unreadCount: number
    byType: Record<string, number>
    recentNotifications: Notification[]
    period: {
      start: Date
      end: Date
    }
    trends: {
      comparedToPrevious: number
      mostActiveType: string
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDigest = useCallback(async () => {
    try {
      setIsLoading(true)
      const digestData = await notificationService.generateDigest(frequency)
      setDigest(digestData)
    } catch (err) {
      console.error('Error fetching digest:', err)
    } finally {
      setIsLoading(false)
    }
  }, [frequency])

  useEffect(() => {
    fetchDigest()
  }, [fetchDigest])

  return { digest, isLoading, refresh: fetchDigest }
}

/**
 * Hook for notification history
 */
export function useNotificationHistory() {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const historyData = await notificationService.getHistory()
      setHistory(historyData)
      setError(null)
    } catch (err) {
      console.error('Error fetching history:', err)
      setError('Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      await notificationService.clearHistory()
      setHistory([])
    } catch (err) {
      console.error('Error clearing history:', err)
      setError('Failed to clear history')
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
    clear: clearHistory
  }
}

/**
 * Hook for notification statistics
 */
export function useNotificationStatistics() {
  const [statistics, setStatistics] = useState<{
    total: number
    unread: number
    byType: Record<string, number>
    byDay: { date: string; count: number }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true)
        const stats = await notificationService.getStatistics()
        setStatistics(stats)
      } catch (err) {
        console.error('Error fetching statistics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  return { statistics, isLoading }
}
