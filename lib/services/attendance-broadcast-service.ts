/**
 * Attendance Broadcast Service
 * 
 * Handles SSE broadcasting for attendance-related events
 * Implements Requirements:
 * - 2.1: Trigger SSE events when attendance is marked
 * - 2.3: Broadcast to all students in affected class
 * 
 * This service centralizes the logic for broadcasting attendance updates
 * and ensures consistent event formatting across the application.
 */

import { getSSEService, SSEService } from './sse-service';
import { getDashboardService, DashboardService } from './dashboard-service';

export interface AttendanceUpdateData {
  studentId: string;
  classId: string;
  date: string;
  period?: number;
  status: string;
  subject?: string;
  markedBy: string;
}

export interface BulkAttendanceUpdateData {
  classId: string;
  date: string;
  updates: AttendanceUpdateData[];
  markedBy: string;
}

export class AttendanceBroadcastService {
  private sseService: SSEService;
  private dashboardService: DashboardService;

  constructor(sseService?: SSEService, dashboardService?: DashboardService) {
    this.sseService = sseService || getSSEService();
    this.dashboardService = dashboardService || getDashboardService();
  }

  /**
   * Broadcast single attendance update
   * Implements Requirements 2.1: Trigger SSE events when attendance is marked
   * 
   * @param updateData - Attendance update information
   */
  async broadcastAttendanceUpdate(updateData: AttendanceUpdateData): Promise<void> {
    try {
      const { studentId, classId, date, period, status, subject, markedBy } = updateData;

      // Invalidate cache for this student and class
      await this.dashboardService.invalidateAttendanceUpdate(studentId, classId);

      // Create attendance update event
      const attendanceEvent = {
        type: 'attendance_update' as const,
        data: {
          studentId,
          date,
          period: period || null,
          status,
          subject: subject || 'Unknown',
          markedBy,
          classId,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        id: `attendance_${studentId}_${period || 'all'}_${Date.now()}`,
      };

      // Send update to the specific student
      await this.sseService.sendToStudent(studentId, attendanceEvent);

      // Get updated metrics for the student
      try {
        const updatedMetrics = await this.dashboardService.getStudentMetrics(studentId);

        const metricsEvent = {
          type: 'metrics_update' as const,
          data: {
            studentId,
            attendanceRate: updatedMetrics.attendanceRate,
            totalClasses: updatedMetrics.totalClasses,
            presentDays: updatedMetrics.presentDays,
            ranking: updatedMetrics.ranking,
            classAverage: updatedMetrics.classAverage,
            trend: updatedMetrics.trend,
            lastUpdated: updatedMetrics.lastUpdated.toISOString(),
          },
          timestamp: new Date(),
          id: `metrics_${studentId}_${Date.now()}`,
        };

        // Send metrics update to the student
        await this.sseService.sendToStudent(studentId, metricsEvent);

        console.log(`Attendance broadcast sent for student ${studentId}, period ${period || 'all'}`);
      } catch (metricsError) {
        console.error(`Failed to send metrics update for student ${studentId}:`, metricsError);
        // Continue execution - attendance event was still sent
      }
    } catch (error) {
      console.error('Failed to broadcast attendance update:', error);
      throw error;
    }
  }

  /**
   * Broadcast bulk attendance updates
   * Implements Requirements 2.1, 2.3: Trigger SSE events and broadcast to class
   * 
   * @param bulkData - Bulk attendance update information
   */
  async broadcastBulkAttendanceUpdate(bulkData: BulkAttendanceUpdateData): Promise<void> {
    try {
      const { classId, date, updates, markedBy } = bulkData;

      // Process individual student updates
      const studentUpdatePromises = updates.map(async (update) => {
        try {
          await this.broadcastAttendanceUpdate({
            ...update,
            classId, // Ensure classId is consistent
            date,    // Ensure date is consistent
            markedBy, // Ensure markedBy is consistent
          });
        } catch (error) {
          console.error(`Failed to broadcast update for student ${update.studentId}:`, error);
          // Continue with other students
        }
      });

      // Wait for all individual updates to complete
      await Promise.allSettled(studentUpdatePromises);

      // Broadcast class-wide summary update
      const classUpdateEvent = {
        type: 'attendance_update' as const,
        data: {
          type: 'class_summary',
          classId,
          date,
          studentsUpdated: updates.length,
          markedBy,
          timestamp: new Date().toISOString(),
          summary: {
            present: updates.filter(u => u.status === 'PRESENT').length,
            absent: updates.filter(u => u.status === 'ABSENT').length,
            sick: updates.filter(u => u.status === 'SICK').length,
            leave: updates.filter(u => u.status === 'LEAVE').length,
          },
        },
        timestamp: new Date(),
        id: `class_summary_${classId}_${Date.now()}`,
      };

      // Broadcast to all students in the class
      await this.sseService.broadcastToClass(classId, classUpdateEvent);

      console.log(`Bulk attendance broadcast completed for ${updates.length} students in class ${classId}`);
    } catch (error) {
      console.error('Failed to broadcast bulk attendance update:', error);
      throw error;
    }
  }

  /**
   * Broadcast attendance correction/modification
   * Used when attendance records are updated after initial marking
   * 
   * @param updateData - Attendance correction information
   */
  async broadcastAttendanceCorrection(updateData: AttendanceUpdateData & { 
    previousStatus?: string;
    reason?: string;
  }): Promise<void> {
    try {
      const { studentId, classId, date, period, status, subject, markedBy, previousStatus, reason } = updateData;

      // Invalidate cache for this student and class
      await this.dashboardService.invalidateAttendanceUpdate(studentId, classId);

      // Create attendance correction event
      const correctionEvent = {
        type: 'attendance_update' as const,
        data: {
          type: 'correction',
          studentId,
          date,
          period: period || null,
          status,
          previousStatus: previousStatus || null,
          subject: subject || 'Unknown',
          markedBy,
          classId,
          reason: reason || 'Attendance correction',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        id: `correction_${studentId}_${period || 'all'}_${Date.now()}`,
      };

      // Send correction to the specific student
      await this.sseService.sendToStudent(studentId, correctionEvent);

      // Get updated metrics for the student
      try {
        const updatedMetrics = await this.dashboardService.getStudentMetrics(studentId);

        const metricsEvent = {
          type: 'metrics_update' as const,
          data: {
            studentId,
            attendanceRate: updatedMetrics.attendanceRate,
            totalClasses: updatedMetrics.totalClasses,
            presentDays: updatedMetrics.presentDays,
            ranking: updatedMetrics.ranking,
            classAverage: updatedMetrics.classAverage,
            trend: updatedMetrics.trend,
            lastUpdated: updatedMetrics.lastUpdated.toISOString(),
          },
          timestamp: new Date(),
          id: `metrics_correction_${studentId}_${Date.now()}`,
        };

        // Send updated metrics to the student
        await this.sseService.sendToStudent(studentId, metricsEvent);

        console.log(`Attendance correction broadcast sent for student ${studentId}, period ${period || 'all'}`);
      } catch (metricsError) {
        console.error(`Failed to send metrics update for correction ${studentId}:`, metricsError);
      }
    } catch (error) {
      console.error('Failed to broadcast attendance correction:', error);
      throw error;
    }
  }

  /**
   * Broadcast class statistics update
   * Used when class-wide statistics change significantly
   * Implements Requirements 2.3: Broadcast to all connected students in affected class
   * 
   * @param classId - ID of the class
   * @param trigger - What triggered the statistics update
   */
  async broadcastClassStatisticsUpdate(classId: string, trigger: string = 'attendance_update'): Promise<void> {
    try {
      // Get updated class statistics
      const classStats = await this.dashboardService.getClassStatistics(classId);

      if (!classStats) {
        console.warn(`No class statistics found for class ${classId}`);
        return;
      }

      // Create class statistics update event
      const statsEvent = {
        type: 'metrics_update' as const,
        data: {
          type: 'class_statistics',
          classId,
          averageAttendance: classStats.averageAttendance,
          totalStudents: classStats.totalStudents,
          studentsAtRisk: classStats.studentsAtRisk,
          lastCalculated: classStats.lastCalculated.toISOString(),
          trigger,
        },
        timestamp: new Date(),
        id: `class_stats_${classId}_${Date.now()}`,
      };

      // Broadcast to all students in the class
      await this.sseService.broadcastToClass(classId, statsEvent);

      console.log(`Class statistics update broadcast sent for class ${classId}`);
    } catch (error) {
      console.error(`Failed to broadcast class statistics update for class ${classId}:`, error);
      throw error;
    }
  }

  /**
   * Broadcast notification to student
   * Used for attendance-related notifications (warnings, alerts, etc.)
   * 
   * @param studentId - ID of the student
   * @param notification - Notification data
   */
  async broadcastNotification(studentId: string, notification: {
    id: string;
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    actionUrl?: string;
    relatedTo?: 'attendance' | 'metrics' | 'general';
  }): Promise<void> {
    try {
      const notificationEvent = {
        type: 'notification' as const,
        data: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          severity: notification.severity,
          actionUrl: notification.actionUrl,
          relatedTo: notification.relatedTo || 'general',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
        id: `notification_${notification.id}_${Date.now()}`,
      };

      // Send notification to the specific student
      await this.sseService.sendToStudent(studentId, notificationEvent);

      console.log(`Notification broadcast sent to student ${studentId}: ${notification.title}`);
    } catch (error) {
      console.error(`Failed to broadcast notification to student ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Test SSE connection for a student
   * Useful for debugging and health checks
   * 
   * @param studentId - ID of the student
   */
  async testConnection(studentId: string): Promise<boolean> {
    try {
      const testEvent = {
        type: 'ping' as const,
        data: {
          test: true,
          timestamp: Date.now(),
          message: 'SSE connection test',
        },
        timestamp: new Date(),
        id: `test_${studentId}_${Date.now()}`,
      };

      await this.sseService.sendToStudent(studentId, testEvent);
      console.log(`Test event sent to student ${studentId}`);
      return true;
    } catch (error) {
      console.error(`Failed to send test event to student ${studentId}:`, error);
      return false;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let attendanceBroadcastServiceInstance: AttendanceBroadcastService | null = null;

export function getAttendanceBroadcastService(): AttendanceBroadcastService {
  if (!attendanceBroadcastServiceInstance) {
    attendanceBroadcastServiceInstance = new AttendanceBroadcastService();
  }
  return attendanceBroadcastServiceInstance;
}

export default AttendanceBroadcastService;