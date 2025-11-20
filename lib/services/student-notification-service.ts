/**
 * Student Notification Service
 * 
 * Handles notification management for the student dashboard including:
 * - Sending notifications to students
 * - Queuing notifications for batch processing
 * - Managing notification preferences
 * - Checking attendance thresholds and triggering alerts
 * - Retry logic for failed deliveries
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { supabase } from '@/lib/supabase'

// ============================================================================
// Types and Interfaces
// ============================================================================

export type NotificationType = 
  | 'attendance_warning'
  | 'mahroom_alert'
  | 'tasdiq_alert'
  | 'file_approved'
  | 'file_rejected'
  | 'system_announcement'

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success'

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retrying'

export interface Notification {
  id: string
  studentId: string
  type: NotificationType
  title: string
  message: string
  severity: NotificationSeverity
  createdAt: Date
  read: boolean
  readAt?: Date
  actionUrl?: string
  metadata?: Record<string, any>
  deliveryStatus?: DeliveryStatus
  deliveryAttempts?: number
  lastDeliveryAttempt?: Date
  deliveryError?: string
}

export interface NotificationPreferences {
  studentId: string
  emailEnabled: boolean
  inAppEnabled: boolean
  attendanceAlerts: boolean
  fileUpdates: boolean
  systemAnnouncements: boolean
  updatedAt: Date
}

export interface NotificationResult {
  sent: boolean
  notificationId?: string
  error?: string
}

export interface CreateNotificationInput {
  studentId: string
  type: NotificationType
  title: string
  message: string
  severity: NotificationSeverity
  actionUrl?: string
  metadata?: Record<string, any>
}

// ============================================================================
// Notification Thresholds
// ============================================================================

export const NOTIFICATION_THRESHOLDS = {
  WARNING: 80,      // Send warning below 80%
  MAHROOM: 75,      // Urgent alert at 75%
  TASDIQ: 85,       // Certification required at 85% (for sick+leave hours)
} as const

// ============================================================================
// NotificationService Class
// ============================================================================

export class NotificationService {
  /**
   * Send a notification to a student
   * Creates the notification in the database and attempts delivery
   * 
   * @param input - Notification details
   * @returns Result indicating success or failure
   */
  async sendNotification(input: CreateNotificationInput): Promise<NotificationResult> {
    try {
      // Check if student has this type of notification enabled
      const preferences = await this.getPreferences(input.studentId)
      
      if (!this.shouldSendNotification(input.type, preferences)) {
        return {
          sent: false,
          error: 'Notification type disabled in user preferences'
        }
      }

      // Insert notification into database
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          student_id: input.studentId,
          type: input.type,
          title: input.title,
          message: input.message,
          severity: input.severity,
          action_url: input.actionUrl,
          metadata: input.metadata,
          delivery_status: 'pending',
          delivery_attempts: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        return {
          sent: false,
          error: error.message
        }
      }

      // Attempt immediate delivery
      await this.attemptDelivery(data.id, input.studentId, preferences)

      return {
        sent: true,
        notificationId: data.id
      }
    } catch (error) {
      console.error('Error in sendNotification:', error)
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Queue a notification for batch processing
   * Useful for bulk notifications or scheduled delivery
   * 
   * @param input - Notification details
   * @returns Result indicating success or failure
   */
  async queueNotification(input: CreateNotificationInput): Promise<NotificationResult> {
    try {
      // Insert notification with pending status
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          student_id: input.studentId,
          type: input.type,
          title: input.title,
          message: input.message,
          severity: input.severity,
          action_url: input.actionUrl,
          metadata: input.metadata,
          delivery_status: 'pending',
          delivery_attempts: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error queuing notification:', error)
        return {
          sent: false,
          error: error.message
        }
      }

      return {
        sent: true,
        notificationId: data.id
      }
    } catch (error) {
      console.error('Error in queueNotification:', error)
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get unread notifications for a student
   * 
   * @param studentId - Student ID
   * @param limit - Maximum number of notifications to return
   * @returns Array of unread notifications
   */
  async getUnreadNotifications(studentId: string, limit = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', studentId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching unread notifications:', error)
        return []
      }

      return this.mapNotifications(data)
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error)
      return []
    }
  }

  /**
   * Get all notifications for a student (read and unread)
   * 
   * @param studentId - Student ID
   * @param limit - Maximum number of notifications to return
   * @returns Array of notifications
   */
  async getAllNotifications(studentId: string, limit = 100): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return this.mapNotifications(data)
    } catch (error) {
      console.error('Error in getAllNotifications:', error)
      return []
    }
  }

  /**
   * Mark a notification as read
   * 
   * @param notificationId - Notification ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('mark_notification_read', { notification_id: notificationId })

      if (error) {
        console.error('Error marking notification as read:', error)
      }
    } catch (error) {
      console.error('Error in markAsRead:', error)
    }
  }

  /**
   * Mark all notifications as read for a student
   * 
   * @param studentId - Student ID
   */
  async markAllAsRead(studentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('student_id', studentId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
      }
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    }
  }

  /**
   * Get notification preferences for a student
   * 
   * @param studentId - Student ID
   * @returns Notification preferences
   */
  async getPreferences(studentId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('student_id', studentId)
        .single()

      if (error) {
        // If preferences don't exist, return defaults
        if (error.code === 'PGRST116') {
          return this.getDefaultPreferences(studentId)
        }
        console.error('Error fetching notification preferences:', error)
        return this.getDefaultPreferences(studentId)
      }

      return {
        studentId: data.student_id,
        emailEnabled: data.email_enabled,
        inAppEnabled: data.in_app_enabled,
        attendanceAlerts: data.attendance_alerts,
        fileUpdates: data.file_updates,
        systemAnnouncements: data.system_announcements,
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error in getPreferences:', error)
      return this.getDefaultPreferences(studentId)
    }
  }

  /**
   * Update notification preferences for a student
   * Validates preferences and ensures at least one delivery channel remains enabled
   * 
   * @param studentId - Student ID
   * @param preferences - Updated preferences
   */
  async updatePreferences(
    studentId: string,
    preferences: Partial<Omit<NotificationPreferences, 'studentId' | 'updatedAt'>>
  ): Promise<void> {
    try {
      // Validate preferences
      this.validatePreferences(preferences)

      // Get current preferences to merge with updates
      const currentPreferences = await this.getPreferences(studentId)
      
      // Merge current preferences with updates
      const updatedPreferences = {
        email_enabled: preferences.emailEnabled ?? currentPreferences.emailEnabled,
        in_app_enabled: preferences.inAppEnabled ?? currentPreferences.inAppEnabled,
        attendance_alerts: preferences.attendanceAlerts ?? currentPreferences.attendanceAlerts,
        file_updates: preferences.fileUpdates ?? currentPreferences.fileUpdates,
        system_announcements: preferences.systemAnnouncements ?? currentPreferences.systemAnnouncements
      }

      // Ensure at least one delivery channel is enabled
      if (!updatedPreferences.email_enabled && !updatedPreferences.in_app_enabled) {
        throw new Error('At least one delivery channel (email or in-app) must be enabled')
      }

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          student_id: studentId,
          ...updatedPreferences
        })

      if (error) {
        console.error('Error updating notification preferences:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in updatePreferences:', error)
      throw error
    }
  }

  /**
   * Validate notification preferences
   * 
   * @param preferences - Preferences to validate
   */
  private validatePreferences(
    preferences: Partial<Omit<NotificationPreferences, 'studentId' | 'updatedAt'>>
  ): void {
    // Validate boolean fields
    const booleanFields = [
      'emailEnabled', 'inAppEnabled', 'attendanceAlerts', 
      'fileUpdates', 'systemAnnouncements'
    ] as const

    for (const field of booleanFields) {
      if (preferences[field] !== undefined && typeof preferences[field] !== 'boolean') {
        throw new Error(`${field} must be a boolean value`)
      }
    }
  }

  /**
   * Reset preferences to default values for a student
   * 
   * @param studentId - Student ID
   */
  async resetPreferencesToDefault(studentId: string): Promise<void> {
    try {
      const defaultPrefs = this.getDefaultPreferences(studentId)
      
      await this.updatePreferences(studentId, {
        emailEnabled: defaultPrefs.emailEnabled,
        inAppEnabled: defaultPrefs.inAppEnabled,
        attendanceAlerts: defaultPrefs.attendanceAlerts,
        fileUpdates: defaultPrefs.fileUpdates,
        systemAnnouncements: defaultPrefs.systemAnnouncements
      })
    } catch (error) {
      console.error('Error resetting preferences to default:', error)
      throw error
    }
  }

  /**
   * Get unread notification count for a student
   * 
   * @param studentId - Student ID
   * @returns Count of unread notifications
   */
  async getUnreadCount(studentId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', { p_student_id: studentId })

      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }

      return data || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  }

  // ============================================================================
  // Threshold Checking Methods
  // ============================================================================

  /**
   * Check attendance thresholds and send notifications if needed
   * Checks for:
   * - 80% warning threshold
   * - 75% mahroom urgent threshold
   * - 85% tasdiq certification threshold (for sick + leave hours)
   * 
   * @param studentId - Student ID
   * @param attendanceRate - Current attendance rate (0-100)
   * @param sickAndLeaveHours - Combined sick and leave hours
   * @returns Result indicating if notification was sent
   */
  async checkThresholdsAndNotify(
    studentId: string,
    attendanceRate: number,
    sickAndLeaveHours?: number
  ): Promise<NotificationResult> {
    try {
      // Get student preferences to check if alerts are enabled
      const preferences = await this.getPreferences(studentId)
      
      if (!preferences.attendanceAlerts) {
        return {
          sent: false,
          error: 'Attendance alerts disabled in preferences'
        }
      }

      // Check mahroom threshold (75%) - most urgent
      if (attendanceRate <= NOTIFICATION_THRESHOLDS.MAHROOM) {
        return await this.sendMahroomAlert(studentId, attendanceRate)
      }

      // Check warning threshold (80%)
      if (attendanceRate < NOTIFICATION_THRESHOLDS.WARNING) {
        return await this.sendWarningNotification(studentId, attendanceRate)
      }

      // Check tasdiq threshold (85% of sick + leave hours)
      if (sickAndLeaveHours !== undefined) {
        const totalAllowedHours = 100 // Assuming 100 hours total
        const sickLeavePercentage = (sickAndLeaveHours / totalAllowedHours) * 100
        
        if (sickLeavePercentage >= NOTIFICATION_THRESHOLDS.TASDIQ) {
          return await this.sendTasdiqAlert(studentId, sickAndLeaveHours, totalAllowedHours)
        }
      }

      return {
        sent: false,
        error: 'No threshold breached'
      }
    } catch (error) {
      console.error('Error in checkThresholdsAndNotify:', error)
      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Send warning notification for attendance below 80%
   * 
   * @param studentId - Student ID
   * @param attendanceRate - Current attendance rate
   * @returns Notification result
   */
  private async sendWarningNotification(
    studentId: string,
    attendanceRate: number
  ): Promise<NotificationResult> {
    // Check if we already sent a warning recently (within 24 hours)
    const recentWarning = await this.hasRecentNotification(
      studentId,
      'attendance_warning',
      24
    )

    if (recentWarning) {
      return {
        sent: false,
        error: 'Warning notification already sent within 24 hours'
      }
    }

    return await this.sendNotification({
      studentId,
      type: 'attendance_warning',
      title: 'Attendance Warning',
      message: `Your attendance rate has dropped to ${attendanceRate.toFixed(1)}%. ` +
               `Please improve your attendance to avoid academic consequences. ` +
               `The minimum required attendance is 75%.`,
      severity: 'warning',
      actionUrl: '/student/student-dashboard',
      metadata: {
        attendanceRate,
        threshold: NOTIFICATION_THRESHOLDS.WARNING,
        thresholdType: 'warning'
      }
    })
  }

  /**
   * Send urgent mahroom alert for attendance at or below 75%
   * 
   * @param studentId - Student ID
   * @param attendanceRate - Current attendance rate
   * @returns Notification result
   */
  private async sendMahroomAlert(
    studentId: string,
    attendanceRate: number
  ): Promise<NotificationResult> {
    // Check if we already sent a mahroom alert recently (within 12 hours)
    const recentAlert = await this.hasRecentNotification(
      studentId,
      'mahroom_alert',
      12
    )

    if (recentAlert) {
      return {
        sent: false,
        error: 'Mahroom alert already sent within 12 hours'
      }
    }

    return await this.sendNotification({
      studentId,
      type: 'mahroom_alert',
      title: 'Urgent: محروم Risk Alert',
      message: `URGENT: Your attendance rate is ${attendanceRate.toFixed(1)}%, ` +
               `which is at or below the محروم (mahroom) threshold of 75%. ` +
               `You are at risk of being barred from exams. ` +
               `Please contact your academic advisor immediately.`,
      severity: 'error',
      actionUrl: '/student/student-dashboard',
      metadata: {
        attendanceRate,
        threshold: NOTIFICATION_THRESHOLDS.MAHROOM,
        thresholdType: 'mahroom',
        urgent: true
      }
    })
  }

  /**
   * Send tasdiq certification alert for sick/leave hours at or above 85%
   * 
   * @param studentId - Student ID
   * @param sickAndLeaveHours - Combined sick and leave hours
   * @param totalAllowedHours - Total allowed hours
   * @returns Notification result
   */
  private async sendTasdiqAlert(
    studentId: string,
    sickAndLeaveHours: number,
    totalAllowedHours: number
  ): Promise<NotificationResult> {
    // Check if we already sent a tasdiq alert recently (within 24 hours)
    const recentAlert = await this.hasRecentNotification(
      studentId,
      'tasdiq_alert',
      24
    )

    if (recentAlert) {
      return {
        sent: false,
        error: 'Tasdiq alert already sent within 24 hours'
      }
    }

    const percentage = (sickAndLeaveHours / totalAllowedHours) * 100

    return await this.sendNotification({
      studentId,
      type: 'tasdiq_alert',
      title: 'Medical Certification Required (تصدیق طلب)',
      message: `Your sick and leave hours have reached ${sickAndLeaveHours} hours ` +
               `(${percentage.toFixed(1)}% of allowed ${totalAllowedHours} hours). ` +
               `You are required to submit medical certification (تصدیق طلب) ` +
               `to justify your absences. Please upload your medical certificates ` +
               `as soon as possible.`,
      severity: 'warning',
      actionUrl: '/student/student-dashboard',
      metadata: {
        sickAndLeaveHours,
        totalAllowedHours,
        percentage,
        threshold: NOTIFICATION_THRESHOLDS.TASDIQ,
        thresholdType: 'tasdiq'
      }
    })
  }

  /**
   * Check if a notification of a specific type was sent recently
   * 
   * @param studentId - Student ID
   * @param type - Notification type
   * @param hoursAgo - Number of hours to look back
   * @returns True if recent notification exists
   */
  private async hasRecentNotification(
    studentId: string,
    type: NotificationType,
    hoursAgo: number
  ): Promise<boolean> {
    try {
      const cutoffTime = new Date()
      cutoffTime.setHours(cutoffTime.getHours() - hoursAgo)

      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('student_id', studentId)
        .eq('type', type)
        .gte('created_at', cutoffTime.toISOString())
        .limit(1)

      if (error) {
        console.error('Error checking recent notifications:', error)
        return false
      }

      return data && data.length > 0
    } catch (error) {
      console.error('Error in hasRecentNotification:', error)
      return false
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check if a notification should be sent based on user preferences
   * Returns true if at least one delivery channel (email or in-app) is enabled
   * and the notification type is allowed
   */
  private shouldSendNotification(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    // Check if at least one delivery channel is enabled
    if (!preferences.emailEnabled && !preferences.inAppEnabled) {
      return false
    }

    // Check specific notification type preferences
    switch (type) {
      case 'attendance_warning':
      case 'mahroom_alert':
      case 'tasdiq_alert':
        return preferences.attendanceAlerts
      
      case 'file_approved':
      case 'file_rejected':
        return preferences.fileUpdates
      
      case 'system_announcement':
        return preferences.systemAnnouncements
      
      default:
        return true
    }
  }

  /**
   * Attempt to deliver a notification through appropriate channels
   * Respects user preferences for email and in-app notifications
   */
  private async attemptDelivery(
    notificationId: string,
    studentId: string,
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      const deliveryChannels: string[] = []
      let deliverySuccess = false
      let deliveryError: string | null = null

      // Attempt in-app delivery (always attempted if in-app is enabled)
      if (preferences.inAppEnabled) {
        try {
          // In-app notification is already stored in database
          // Trigger SSE event for real-time update if student is connected
          await this.triggerSSEUpdate(studentId, notificationId)
          deliveryChannels.push('in-app')
          deliverySuccess = true
        } catch (error) {
          console.error('Error delivering in-app notification:', error)
          deliveryError = `In-app delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }

      // Attempt email delivery if enabled
      if (preferences.emailEnabled) {
        try {
          await this.sendEmailNotification(studentId, notificationId)
          deliveryChannels.push('email')
          deliverySuccess = true
        } catch (error) {
          console.error('Error sending email notification:', error)
          const emailError = `Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          deliveryError = deliveryError ? `${deliveryError}; ${emailError}` : emailError
        }
      }

      // Update delivery status based on results
      const { error } = await supabase
        .from('notifications')
        .update({
          delivery_status: deliverySuccess ? 'sent' : 'failed',
          delivery_attempts: 1,
          last_delivery_attempt: new Date().toISOString(),
          delivery_error: deliveryError,
          metadata: {
            delivery_channels: deliveryChannels,
            email_enabled: preferences.emailEnabled,
            in_app_enabled: preferences.inAppEnabled
          }
        })
        .eq('id', notificationId)

      if (error) {
        console.error('Error updating delivery status:', error)
      }
    } catch (error) {
      console.error('Error in attemptDelivery:', error)
      
      // Mark as failed
      await supabase
        .from('notifications')
        .update({
          delivery_status: 'failed',
          delivery_error: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', notificationId)
    }
  }

  /**
   * Trigger SSE update for real-time in-app notifications
   * 
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   */
  private async triggerSSEUpdate(studentId: string, notificationId: string): Promise<void> {
    // TODO: Implement SSE notification trigger
    // This would integrate with the SSE service to send real-time updates
    // For now, we'll just log the action
    console.log(`SSE update triggered for student ${studentId}, notification ${notificationId}`)
  }

  /**
   * Send email notification to student
   * 
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   */
  private async sendEmailNotification(studentId: string, notificationId: string): Promise<void> {
    // TODO: Implement email delivery
    // This would integrate with an email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log the action
    console.log(`Email notification sent to student ${studentId}, notification ${notificationId}`)
    
    // In a real implementation, this would:
    // 1. Fetch student email from database
    // 2. Fetch notification details
    // 3. Generate email template
    // 4. Send via email service
    // 5. Handle delivery confirmation/failure
  }

  /**
   * Map database records to Notification objects
   */
  private mapNotifications(data: any[]): Notification[] {
    return data.map(record => ({
      id: record.id,
      studentId: record.student_id,
      type: record.type,
      title: record.title,
      message: record.message,
      severity: record.severity,
      createdAt: new Date(record.created_at),
      read: record.read,
      readAt: record.read_at ? new Date(record.read_at) : undefined,
      actionUrl: record.action_url,
      metadata: record.metadata,
      deliveryStatus: record.delivery_status,
      deliveryAttempts: record.delivery_attempts,
      lastDeliveryAttempt: record.last_delivery_attempt 
        ? new Date(record.last_delivery_attempt) 
        : undefined,
      deliveryError: record.delivery_error
    }))
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(studentId: string): NotificationPreferences {
    return {
      studentId,
      emailEnabled: true,
      inAppEnabled: true,
      attendanceAlerts: true,
      fileUpdates: true,
      systemAnnouncements: true,
      updatedAt: new Date()
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const studentNotificationService = new NotificationService()
