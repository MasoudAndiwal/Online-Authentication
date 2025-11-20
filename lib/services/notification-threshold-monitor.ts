/**
 * Notification Threshold Monitor Service
 * 
 * Background service that monitors student attendance rates and triggers
 * notifications when thresholds are breached. Runs as a scheduled job.
 * 
 * Features:
 * - Hourly monitoring of all active students
 * - Threshold checking (80% warning, 75% mahroom, 85% tasdiq)
 * - Retry logic for failed notification deliveries
 * - Batch processing for performance
 * - Comprehensive error handling and logging
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import * as cron from 'node-cron';
import { supabase } from '@/lib/supabase';
import { 
  NotificationService, 
  NOTIFICATION_THRESHOLDS,
  NotificationResult 
} from './student-notification-service';
import { getDashboardService } from './dashboard-service';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface StudentAttendanceData {
  id: string;
  firstName: string;
  lastName: string;
  classSection: string;
  attendanceRate: number;
  sickAndLeaveHours?: number;
  totalAllowedHours?: number;
}

export interface ThresholdCheckResult {
  studentId: string;
  thresholdType: 'warning' | 'mahroom' | 'tasdiq';
  attendanceRate: number;
  notificationSent: boolean;
  error?: string;
}

export interface MonitoringJobResult {
  totalStudentsChecked: number;
  notificationsSent: number;
  notificationsFailed: number;
  errors: Array<{
    studentId: string;
    error: string;
  }>;
  executionTime: number;
  timestamp: Date;
}

export interface RetryableNotification {
  id: string;
  studentId: string;
  type: 'warning' | 'mahroom' | 'tasdiq';
  attendanceRate: number;
  sickAndLeaveHours?: number;
  attempts: number;
  lastAttempt: Date;
  nextRetry: Date;
  error?: string;
}

// ============================================================================
// NotificationThresholdMonitor Class
// ============================================================================

export class NotificationThresholdMonitor {
  private notificationService: NotificationService;
  private dashboardService: ReturnType<typeof getDashboardService>;
  private isRunning: boolean = false;
  private cronJob: cron.ScheduledTask | null = null;
  private retryQueue: Map<string, RetryableNotification> = new Map();

  constructor() {
    this.notificationService = new NotificationService();
    this.dashboardService = getDashboardService();
  }

  /**
   * Start the threshold monitoring service
   * Sets up hourly cron job to check all student attendance rates
   * 
   * Cron schedule: '0 * * * *' (every hour at minute 0)
   */
  start(): void {
    if (this.cronJob) {
      console.log('Notification threshold monitor is already running');
      return;
    }

    // Schedule hourly monitoring job
    this.cronJob = cron.schedule('0 * * * *', async () => {
      await this.runMonitoringJob();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Also schedule retry job every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      await this.processRetryQueue();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('Notification threshold monitor started - running hourly');
    console.log('Retry processor started - running every 15 minutes');
  }

  /**
   * Stop the threshold monitoring service
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('Notification threshold monitor stopped');
    }
  }

  /**
   * Main monitoring job that checks all students
   * Implements Requirements 8.1, 8.2, 8.3, 8.4
   */
  async runMonitoringJob(): Promise<MonitoringJobResult> {
    if (this.isRunning) {
      console.log('Monitoring job already running, skipping this execution');
      return {
        totalStudentsChecked: 0,
        notificationsSent: 0,
        notificationsFailed: 0,
        errors: [{ studentId: 'system', error: 'Job already running' }],
        executionTime: 0,
        timestamp: new Date()
      };
    }

    const startTime = Date.now();
    this.isRunning = true;

    try {
      console.log('Starting threshold monitoring job...');

      // Get all active students
      const students = await this.getAllActiveStudents();
      console.log(`Checking thresholds for ${students.length} active students`);

      const results: ThresholdCheckResult[] = [];
      const batchSize = 10; // Process students in batches to avoid overwhelming the system

      // Process students in batches
      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(student => this.checkStudentThresholds(student))
        );

        // Process batch results
        batchResults.forEach((result, index) => {
          const student = batch[index];
          
          if (result.status === 'fulfilled' && result.value) {
            results.push(result.value);
          } else if (result.status === 'rejected') {
            console.error(`Failed to check thresholds for student ${student.id}:`, result.reason);
            results.push({
              studentId: student.id,
              thresholdType: 'warning',
              attendanceRate: student.attendanceRate,
              notificationSent: false,
              error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
            });
          }
        });

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < students.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate summary statistics
      const notificationsSent = results.filter(r => r.notificationSent).length;
      const notificationsFailed = results.filter(r => !r.notificationSent && r.error).length;
      const errors = results
        .filter(r => r.error)
        .map(r => ({ studentId: r.studentId, error: r.error! }));

      const executionTime = Date.now() - startTime;

      const jobResult: MonitoringJobResult = {
        totalStudentsChecked: students.length,
        notificationsSent,
        notificationsFailed,
        errors,
        executionTime,
        timestamp: new Date()
      };

      console.log('Threshold monitoring job completed:', {
        studentsChecked: jobResult.totalStudentsChecked,
        notificationsSent: jobResult.notificationsSent,
        notificationsFailed: jobResult.notificationsFailed,
        executionTimeMs: jobResult.executionTime
      });

      return jobResult;

    } catch (error) {
      console.error('Threshold monitoring job failed:', error);
      
      return {
        totalStudentsChecked: 0,
        notificationsSent: 0,
        notificationsFailed: 1,
        errors: [{
          studentId: 'system',
          error: error instanceof Error ? error.message : 'Unknown system error'
        }],
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get all active students with their attendance data
   */
  private async getAllActiveStudents(): Promise<StudentAttendanceData[]> {
    try {
      // Get all active students
      const { data: students, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, class_section')
        .eq('status', 'ACTIVE')
        .order('class_section', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch students: ${error.message}`);
      }

      if (!students || students.length === 0) {
        console.log('No active students found');
        return [];
      }

      // Calculate attendance rates for each student
      const studentsWithAttendance: StudentAttendanceData[] = [];

      for (const student of students) {
        try {
          // Get student metrics from dashboard service (uses cache)
          const metrics = await this.dashboardService.getStudentMetrics(student.id);
          
          studentsWithAttendance.push({
            id: student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            classSection: student.class_section,
            attendanceRate: metrics.attendanceRate,
            sickAndLeaveHours: metrics.sickDays + metrics.leaveDays,
            totalAllowedHours: 100 // Assuming 100 hours total - this could be configurable
          });
        } catch (error) {
          console.error(`Failed to get metrics for student ${student.id}:`, error);
          // Continue with other students, don't fail the entire job
        }
      }

      return studentsWithAttendance;
    } catch (error) {
      console.error('Failed to get active students:', error);
      throw error;
    }
  }

  /**
   * Check thresholds for a single student and send notifications if needed
   * Implements Requirements 8.1, 8.2, 8.3
   */
  private async checkStudentThresholds(
    student: StudentAttendanceData
  ): Promise<ThresholdCheckResult | null> {
    try {
      // Check mahroom threshold first (most urgent - 75%)
      if (student.attendanceRate <= NOTIFICATION_THRESHOLDS.MAHROOM) {
        const result = await this.notificationService.checkThresholdsAndNotify(
          student.id,
          student.attendanceRate,
          student.sickAndLeaveHours
        );

        if (!result.sent && result.error) {
          // Add to retry queue if notification failed
          await this.addToRetryQueue(student, 'mahroom', result.error);
        }

        return {
          studentId: student.id,
          thresholdType: 'mahroom',
          attendanceRate: student.attendanceRate,
          notificationSent: result.sent,
          error: result.error
        };
      }

      // Check warning threshold (80%)
      if (student.attendanceRate < NOTIFICATION_THRESHOLDS.WARNING) {
        const result = await this.notificationService.checkThresholdsAndNotify(
          student.id,
          student.attendanceRate,
          student.sickAndLeaveHours
        );

        if (!result.sent && result.error) {
          // Add to retry queue if notification failed
          await this.addToRetryQueue(student, 'warning', result.error);
        }

        return {
          studentId: student.id,
          thresholdType: 'warning',
          attendanceRate: student.attendanceRate,
          notificationSent: result.sent,
          error: result.error
        };
      }

      // Check tasdiq threshold (85% of sick + leave hours)
      if (student.sickAndLeaveHours && student.totalAllowedHours) {
        const sickLeavePercentage = (student.sickAndLeaveHours / student.totalAllowedHours) * 100;
        
        if (sickLeavePercentage >= NOTIFICATION_THRESHOLDS.TASDIQ) {
          const result = await this.notificationService.checkThresholdsAndNotify(
            student.id,
            student.attendanceRate,
            student.sickAndLeaveHours
          );

          if (!result.sent && result.error) {
            // Add to retry queue if notification failed
            await this.addToRetryQueue(student, 'tasdiq', result.error);
          }

          return {
            studentId: student.id,
            thresholdType: 'tasdiq',
            attendanceRate: student.attendanceRate,
            notificationSent: result.sent,
            error: result.error
          };
        }
      }

      // No thresholds breached
      return null;

    } catch (error) {
      console.error(`Error checking thresholds for student ${student.id}:`, error);
      
      return {
        studentId: student.id,
        thresholdType: 'warning',
        attendanceRate: student.attendanceRate,
        notificationSent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add failed notification to retry queue
   * Implements Requirements 8.4 - Retry logic for failed deliveries
   */
  private async addToRetryQueue(
    student: StudentAttendanceData,
    thresholdType: 'warning' | 'mahroom' | 'tasdiq',
    error: string
  ): Promise<void> {
    const retryId = `${student.id}_${thresholdType}`;
    const now = new Date();
    
    // Calculate next retry time with exponential backoff
    const baseDelay = 15 * 60 * 1000; // 15 minutes base delay
    const attempts = this.retryQueue.get(retryId)?.attempts || 0;
    const backoffMultiplier = Math.pow(2, attempts); // Exponential backoff: 15min, 30min, 60min
    const nextRetryDelay = Math.min(baseDelay * backoffMultiplier, 4 * 60 * 60 * 1000); // Max 4 hours
    
    const retryableNotification: RetryableNotification = {
      id: retryId,
      studentId: student.id,
      type: thresholdType,
      attendanceRate: student.attendanceRate,
      sickAndLeaveHours: student.sickAndLeaveHours,
      attempts: attempts + 1,
      lastAttempt: now,
      nextRetry: new Date(now.getTime() + nextRetryDelay),
      error
    };

    // Only retry up to 3 times
    if (retryableNotification.attempts <= 3) {
      this.retryQueue.set(retryId, retryableNotification);
      console.log(`Added notification to retry queue: ${retryId}, attempt ${retryableNotification.attempts}/3, next retry: ${retryableNotification.nextRetry.toISOString()}`);
    } else {
      console.error(`Max retry attempts reached for notification: ${retryId}, giving up`);
      this.retryQueue.delete(retryId);
    }
  }

  /**
   * Process retry queue for failed notifications
   * Implements Requirements 8.4 - Retry logic with exponential backoff
   */
  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.size === 0) {
      return;
    }

    console.log(`Processing retry queue with ${this.retryQueue.size} pending notifications`);
    const now = new Date();
    const retryPromises: Promise<void>[] = [];

    for (const [retryId, notification] of this.retryQueue.entries()) {
      // Check if it's time to retry
      if (now >= notification.nextRetry) {
        retryPromises.push(this.retryNotification(retryId, notification));
      }
    }

    if (retryPromises.length > 0) {
      console.log(`Retrying ${retryPromises.length} notifications`);
      await Promise.allSettled(retryPromises);
    }
  }

  /**
   * Retry a single notification
   */
  private async retryNotification(retryId: string, notification: RetryableNotification): Promise<void> {
    try {
      console.log(`Retrying notification: ${retryId}, attempt ${notification.attempts}`);

      const result = await this.notificationService.checkThresholdsAndNotify(
        notification.studentId,
        notification.attendanceRate,
        notification.sickAndLeaveHours
      );

      if (result.sent) {
        // Success - remove from retry queue
        this.retryQueue.delete(retryId);
        console.log(`Notification retry successful: ${retryId}`);
      } else {
        // Failed again - update retry info
        await this.addToRetryQueue(
          {
            id: notification.studentId,
            firstName: '',
            lastName: '',
            classSection: '',
            attendanceRate: notification.attendanceRate,
            sickAndLeaveHours: notification.sickAndLeaveHours
          },
          notification.type,
          result.error || 'Retry failed'
        );
      }
    } catch (error) {
      console.error(`Error retrying notification ${retryId}:`, error);
      
      // Update retry info for next attempt
      await this.addToRetryQueue(
        {
          id: notification.studentId,
          firstName: '',
          lastName: '',
          classSection: '',
          attendanceRate: notification.attendanceRate,
          sickAndLeaveHours: notification.sickAndLeaveHours
        },
        notification.type,
        error instanceof Error ? error.message : 'Retry error'
      );
    }
  }

  /**
   * Get current retry queue status (for monitoring/debugging)
   */
  getRetryQueueStatus(): {
    totalPending: number;
    byType: Record<string, number>;
    byAttempts: Record<number, number>;
  } {
    const byType: Record<string, number> = {};
    const byAttempts: Record<number, number> = {};

    for (const notification of this.retryQueue.values()) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byAttempts[notification.attempts] = (byAttempts[notification.attempts] || 0) + 1;
    }

    return {
      totalPending: this.retryQueue.size,
      byType,
      byAttempts
    };
  }

  /**
   * Clear retry queue (for testing or manual intervention)
   */
  clearRetryQueue(): void {
    const clearedCount = this.retryQueue.size;
    this.retryQueue.clear();
    console.log(`Cleared ${clearedCount} notifications from retry queue`);
  }

  /**
   * Manual trigger for testing (bypasses cron schedule)
   */
  async runManualCheck(): Promise<MonitoringJobResult> {
    console.log('Running manual threshold check...');
    return await this.runMonitoringJob();
  }

  /**
   * Get monitoring service status
   */
  getStatus(): {
    isRunning: boolean;
    cronJobActive: boolean;
    retryQueueSize: number;
    lastExecution?: Date;
  } {
    return {
      isRunning: this.isRunning,
      cronJobActive: this.cronJob !== null,
      retryQueueSize: this.retryQueue.size,
      // lastExecution would need to be tracked separately if needed
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let thresholdMonitorInstance: NotificationThresholdMonitor | null = null;

export function getNotificationThresholdMonitor(): NotificationThresholdMonitor {
  if (!thresholdMonitorInstance) {
    thresholdMonitorInstance = new NotificationThresholdMonitor();
  }
  return thresholdMonitorInstance;
}

export default NotificationThresholdMonitor;