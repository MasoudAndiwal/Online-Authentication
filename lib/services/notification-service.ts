/**
 * Notification Service
 * 
 * Handles notification management including:
 * - Fetching notifications
 * - Marking as read/unread
 * - Deleting notifications
 * - Managing notification preferences
 * - Real-time notification updates (WebSocket integration ready)
 */

import type { Notification, NotificationType } from '@/components/teacher/notification-center'
import type { NotificationPreferences } from '@/components/teacher/notification-settings'

// ============================================================================
// Mock Data (Replace with actual API calls)
// ============================================================================

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'student_risk',
    title: 'Student at Risk of محروم',
    message: 'Ahmad Hassan has exceeded the absence threshold and is now at risk of محروم status.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    metadata: {
      studentName: 'Ahmad Hassan',
      className: 'CS-101',
      riskType: 'محروم'
    }
  },
  {
    id: '2',
    type: 'schedule_change',
    title: 'Class Schedule Updated',
    message: 'Your CS-201 class schedule has been changed from Monday 10:00 AM to Tuesday 2:00 PM.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    metadata: {
      className: 'CS-201'
    }
  },
  {
    id: '3',
    type: 'system_update',
    title: 'System Maintenance Scheduled',
    message: 'The attendance system will undergo maintenance on Friday from 11:00 PM to 2:00 AM.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: true
  },
  {
    id: '4',
    type: 'student_risk',
    title: 'Student Requires تصدیق طلب',
    message: 'Sara Ali is approaching the تصدیق طلب threshold with 4 absences in the last two weeks.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    metadata: {
      studentName: 'Sara Ali',
      className: 'CS-101',
      riskType: 'تصدیق طلب'
    }
  },
  {
    id: '5',
    type: 'schedule_change',
    title: 'Room Change Notification',
    message: 'Your CS-301 class has been moved from Room A-204 to Room B-105 for today.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    metadata: {
      className: 'CS-301'
    }
  }
]

const mockPreferences: NotificationPreferences = {
  studentRiskAlerts: true,
  systemUpdates: true,
  scheduleChanges: true,
  inAppNotifications: true,
  emailNotifications: false,
  enableDigest: true,
  digestFrequency: 'daily',
  digestTime: '08:00',
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00'
  },
  notifyOnMahroom: true,
  notifyOnTasdiq: true,
  notifyOnAbsenceCount: true,
  absenceCountThreshold: 3
}

// ============================================================================
// Notification History Types
// ============================================================================

export interface NotificationHistory {
  id: string
  notification: Notification
  action: 'created' | 'read' | 'deleted'
  timestamp: Date
}

export interface DigestSummary {
  totalNotifications: number
  unreadCount: number
  byType: Record<NotificationType, number>
  recentNotifications: Notification[]
  period: {
    start: Date
    end: Date
  }
  trends: {
    comparedToPrevious: number // percentage change
    mostActiveType: NotificationType
  }
}

// ============================================================================
// Notification Service Class
// ============================================================================

class NotificationService {
  private notifications: Notification[] = [...mockNotifications]
  private preferences: NotificationPreferences = { ...mockPreferences }
  private listeners: Set<(notifications: Notification[]) => void> = new Set()
  private wsConnection: WebSocket | null = null
  private history: NotificationHistory[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Fetch all notifications for the current user
   */
  async fetchNotifications(): Promise<Notification[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // const response = await fetch('/api/notifications')
    // return response.json()
    
    return [...this.notifications]
  }

  /**
   * Fetch unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const notifications = await this.fetchNotifications()
    return notifications.filter(n => !n.isRead).length
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' })
    
    const notification = this.notifications.find(n => n.id === notificationId)
    
    this.notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    
    // Add to history
    if (notification) {
      this.addToHistory(notification, 'read')
    }
    
    this.notifyListeners()
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // await fetch('/api/notifications/read-all', { method: 'POST' })
    
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }))
    
    this.notifyListeners()
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' })
    
    const notification = this.notifications.find(n => n.id === notificationId)
    
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    
    // Add to history
    if (notification) {
      this.addToHistory(notification, 'deleted')
    }
    
    this.notifyListeners()
  }

  /**
   * Fetch notification preferences
   */
  async fetchPreferences(): Promise<NotificationPreferences> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // const response = await fetch('/api/notifications/preferences')
    // return response.json()
    
    return { ...this.preferences }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // await fetch('/api/notifications/preferences', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(preferences)
    // })
    
    this.preferences = { ...preferences }
  }

  /**
   * Create a new notification (for testing/demo purposes)
   */
  async createNotification(
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Notification['metadata']
  ): Promise<Notification> {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      metadata
    }
    
    this.notifications.unshift(notification)
    
    // Add to history
    this.addToHistory(notification, 'created')
    
    this.notifyListeners()
    
    return notification
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of notification changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications])
    })
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeWebSocket(userId: string): void {
    // In production, replace with actual WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/notifications'
    
    try {
      this.wsConnection = new WebSocket(`${wsUrl}?userId=${userId}`)
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connection established for user:', userId)
        this.reconnectAttempts = 0
      }
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'notification') {
            const notification: Notification = {
              id: data.id,
              type: data.notificationType,
              title: data.title,
              message: data.message,
              timestamp: new Date(data.timestamp),
              isRead: false,
              metadata: data.metadata
            }
            
            this.notifications.unshift(notification)
            this.addToHistory(notification, 'created')
            this.notifyListeners()
            
            // Show browser notification if enabled
            this.showBrowserNotification(notification)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      this.wsConnection.onclose = () => {
        console.log('WebSocket connection closed')
        this.attemptReconnect(userId)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  /**
   * Attempt to reconnect WebSocket with exponential backoff
   */
  private attemptReconnect(userId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.initializeWebSocket(userId)
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (!this.preferences.inAppNotifications) return
    
    // Check if browser notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/notification-icon.png',
          badge: '/notification-badge.png',
          tag: notification.id,
          requireInteraction: notification.type === 'student_risk'
        })
      } catch (error) {
        console.error('Failed to show browser notification:', error)
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  /**
   * Close WebSocket connection
   */
  closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  /**
   * Generate digest summary with trends
   */
  async generateDigest(frequency: 'daily' | 'weekly'): Promise<DigestSummary> {
    const notifications = await this.fetchNotifications()
    
    // Calculate date ranges
    const now = new Date()
    const currentPeriodStart = new Date()
    const previousPeriodStart = new Date()
    
    if (frequency === 'daily') {
      currentPeriodStart.setDate(now.getDate() - 1)
      previousPeriodStart.setDate(now.getDate() - 2)
    } else {
      currentPeriodStart.setDate(now.getDate() - 7)
      previousPeriodStart.setDate(now.getDate() - 14)
    }
    
    // Filter notifications for current period
    const currentNotifications = notifications.filter(
      n => n.timestamp >= currentPeriodStart && n.timestamp <= now
    )
    
    // Filter notifications for previous period
    const previousNotifications = notifications.filter(
      n => n.timestamp >= previousPeriodStart && n.timestamp < currentPeriodStart
    )
    
    // Count by type
    const byType: Record<NotificationType, number> = {
      student_risk: 0,
      system_update: 0,
      schedule_change: 0
    }
    
    currentNotifications.forEach(n => {
      byType[n.type]++
    })
    
    // Calculate trends
    const comparedToPrevious = previousNotifications.length > 0
      ? ((currentNotifications.length - previousNotifications.length) / previousNotifications.length) * 100
      : 0
    
    const mostActiveType = (Object.entries(byType) as [NotificationType, number][])
      .reduce((max, [type, count]) => count > max[1] ? [type, count] : max, ['student_risk', 0] as [NotificationType, number])[0]
    
    return {
      totalNotifications: currentNotifications.length,
      unreadCount: currentNotifications.filter(n => !n.isRead).length,
      byType,
      recentNotifications: currentNotifications.slice(0, 10),
      period: {
        start: currentPeriodStart,
        end: now
      },
      trends: {
        comparedToPrevious,
        mostActiveType
      }
    }
  }

  /**
   * Get notification history
   */
  async getHistory(limit = 50): Promise<NotificationHistory[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // const response = await fetch(`/api/notifications/history?limit=${limit}`)
    // return response.json()
    
    return this.history.slice(0, limit)
  }

  /**
   * Clear notification history
   */
  async clearHistory(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // await fetch('/api/notifications/history', { method: 'DELETE' })
    
    this.history = []
  }

  /**
   * Add notification to history
   */
  private addToHistory(notification: Notification, action: NotificationHistory['action']): void {
    const historyEntry: NotificationHistory = {
      id: `${notification.id}-${action}-${Date.now()}`,
      notification,
      action,
      timestamp: new Date()
    }
    
    this.history.unshift(historyEntry)
    
    // Keep only last 100 history entries
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100)
    }
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<{
    total: number
    unread: number
    byType: Record<NotificationType, number>
    byDay: { date: string; count: number }[]
  }> {
    const notifications = await this.fetchNotifications()
    
    const byType: Record<NotificationType, number> = {
      student_risk: 0,
      system_update: 0,
      schedule_change: 0
    }
    
    const byDay: Record<string, number> = {}
    
    notifications.forEach(n => {
      byType[n.type]++
      
      const dateKey = n.timestamp.toISOString().split('T')[0]
      byDay[dateKey] = (byDay[dateKey] || 0) + 1
    })
    
    const byDayArray = Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType,
      byDay: byDayArray
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const notificationService = new NotificationService()

// ============================================================================
// Export Types
// ============================================================================

export type { Notification, NotificationType } from '@/components/teacher/notification-center'
export type { NotificationPreferences } from '@/components/teacher/notification-settings'
