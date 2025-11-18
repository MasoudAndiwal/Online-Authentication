/**
 * Student Notification Service
 * 
 * Handles notification management for students including:
 * - Attendance marked notifications
 * - Warning threshold notifications (75% of max absences)
 * - Critical alerts (محروم, تصدیق طلب status)
 * - Schedule change notifications
 * - Message received notifications
 * - Real-time notification updates (WebSocket integration ready)
 */

import type { StudentNotification, StudentNotificationType } from '@/components/student/notification-center'

// ============================================================================
// Mock Data (Replace with actual API calls)
// ============================================================================

const mockStudentNotifications: StudentNotification[] = [
  {
    id: '1',
    type: 'attendance_marked',
    title: 'Attendance Marked',
    message: 'Your attendance for Session 2 has been marked as Present.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: false,
    metadata: {
      sessionNumber: 2,
      status: 'present'
    }
  },
  {
    id: '2',
    type: 'warning_threshold',
    title: 'Attendance Warning',
    message: 'You have 3 absences remaining before reaching the warning threshold. Please maintain regular attendance.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    metadata: {
      remainingAbsences: 3,
      alertType: 'warning'
    }
  },
  {
    id: '3',
    type: 'message_received',
    title: 'New Message from Teacher',
    message: 'Dr. Ahmed Hassan sent you a message regarding your recent absence.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: true,
    metadata: {
      senderName: 'Dr. Ahmed Hassan'
    }
  },
  {
    id: '4',
    type: 'schedule_change',
    title: 'Class Schedule Updated',
    message: 'Your CS-101 class has been rescheduled from Monday 10:00 AM to Tuesday 2:00 PM.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true
  }
]

// ============================================================================
// Notification Preferences Types
// ============================================================================

export interface StudentNotificationPreferences {
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

const mockStudentPreferences: StudentNotificationPreferences = {
  attendanceMarked: true,
  warningThresholds: true,
  criticalAlerts: true,
  scheduleChanges: true,
  messageReceived: true,
  inAppNotifications: true,
  emailNotifications: false,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00'
  }
}

// ============================================================================
// Student Notification Service Class
// ============================================================================

class StudentNotificationService {
  private notifications: StudentNotification[] = [...mockStudentNotifications]
  private preferences: StudentNotificationPreferences = { ...mockStudentPreferences }
  private listeners: Set<(notifications: StudentNotification[]) => void> = new Set()
  private wsConnection: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  /**
   * Fetch all notifications for the current student
   */
  async fetchNotifications(): Promise<StudentNotification[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // const response = await fetch('/api/students/notifications')
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
    // await fetch(`/api/students/notifications/${notificationId}/read`, { method: 'POST' })
    
    this.notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    
    this.notifyListeners()
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // await fetch('/api/students/notifications/read-all', { method: 'POST' })
    
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
    // await fetch(`/api/students/notifications/${notificationId}`, { method: 'DELETE' })
    
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    
    this.notifyListeners()
  }

  /**
   * Fetch notification preferences
   */
  async fetchPreferences(): Promise<StudentNotificationPreferences> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // In production, replace with actual API call:
    // const response = await fetch('/api/students/notifications/preferences')
    // return response.json()
    
    return { ...this.preferences }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: StudentNotificationPreferences): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, replace with actual API call:
    // await fetch('/api/students/notifications/preferences', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(preferences)
    // })
    
    this.preferences = { ...preferences }
  }

  /**
   * Create attendance marked notification
   */
  async createAttendanceNotification(
    sessionNumber: number,
    status: 'present' | 'absent' | 'sick' | 'leave',
    markedBy: string
  ): Promise<StudentNotification> {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'attendance_marked',
      title: 'Attendance Marked',
      message: `Your attendance for Session ${sessionNumber} has been marked as ${statusText} by ${markedBy}.`,
      timestamp: new Date(),
      isRead: false,
      metadata: {
        sessionNumber,
        status
      }
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Create warning threshold notification (75% of max absences)
   */
  async createWarningThresholdNotification(
    remainingAbsences: number,
    maxAbsences: number
  ): Promise<StudentNotification> {
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'warning_threshold',
      title: 'Attendance Warning',
      message: `You have ${remainingAbsences} absences remaining before reaching the warning threshold (${maxAbsences} total allowed). Please maintain regular attendance.`,
      timestamp: new Date(),
      isRead: false,
      metadata: {
        remainingAbsences,
        alertType: 'warning'
      }
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Create critical alert notification (محروم status)
   */
  async createMahroomAlertNotification(): Promise<StudentNotification> {
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'critical_alert',
      title: 'Critical: Disqualified (محروم)',
      message: 'You have exceeded the maximum allowed absences. You are not eligible for final exams. Please contact your teacher immediately.',
      timestamp: new Date(),
      isRead: false,
      metadata: {
        alertType: 'محروم'
      }
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Create critical alert notification (تصدیق طلب status)
   */
  async createTasdiqAlertNotification(): Promise<StudentNotification> {
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'critical_alert',
      title: 'Certification Required (تصدیق طلب)',
      message: 'You need to submit medical certificates to restore your exam eligibility. Please upload documentation as soon as possible.',
      timestamp: new Date(),
      isRead: false,
      metadata: {
        alertType: 'تصدیق طلب'
      }
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Create schedule change notification
   */
  async createScheduleChangeNotification(
    className: string,
    changeDetails: string
  ): Promise<StudentNotification> {
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'schedule_change',
      title: 'Class Schedule Updated',
      message: `Your ${className} class schedule has been changed: ${changeDetails}`,
      timestamp: new Date(),
      isRead: false
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Create message received notification
   */
  async createMessageReceivedNotification(
    senderName: string,
    messagePreview: string
  ): Promise<StudentNotification> {
    const notification: StudentNotification = {
      id: Date.now().toString(),
      type: 'message_received',
      title: `New Message from ${senderName}`,
      message: messagePreview,
      timestamp: new Date(),
      isRead: false,
      metadata: {
        senderName
      }
    }
    
    this.notifications.unshift(notification)
    this.notifyListeners()
    
    // Show browser notification if enabled
    this.showBrowserNotification(notification)
    
    return notification
  }

  /**
   * Subscribe to notification updates
   */
  subscribe(listener: (notifications: StudentNotification[]) => void): () => void {
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
  initializeWebSocket(studentId: string): void {
    // In production, replace with actual WebSocket URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/student-notifications'
    
    try {
      this.wsConnection = new WebSocket(`${wsUrl}?studentId=${studentId}`)
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connection established for student:', studentId)
        this.reconnectAttempts = 0
      }
      
      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'notification') {
            const notification: StudentNotification = {
              id: data.id,
              type: data.notificationType,
              title: data.title,
              message: data.message,
              timestamp: new Date(data.timestamp),
              isRead: false,
              metadata: data.metadata
            }
            
            this.notifications.unshift(notification)
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
        this.attemptReconnect(studentId)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  /**
   * Attempt to reconnect WebSocket with exponential backoff
   */
  private attemptReconnect(studentId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.initializeWebSocket(studentId)
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: StudentNotification): Promise<void> {
    if (!this.preferences.inAppNotifications) return
    
    // Check if browser notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/notification-icon.png',
          badge: '/notification-badge.png',
          tag: notification.id,
          requireInteraction: notification.type === 'critical_alert'
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
   * Get notification statistics
   */
  async getStatistics(): Promise<{
    total: number
    unread: number
    byType: Record<StudentNotificationType, number>
  }> {
    const notifications = await this.fetchNotifications()
    
    const byType: Record<StudentNotificationType, number> = {
      attendance_marked: 0,
      warning_threshold: 0,
      critical_alert: 0,
      schedule_change: 0,
      message_received: 0
    }
    
    notifications.forEach(n => {
      byType[n.type]++
    })
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const studentNotificationService = new StudentNotificationService()

// ============================================================================
// Export Types
// ============================================================================

export type { StudentNotification, StudentNotificationType } from '@/components/student/notification-center'
