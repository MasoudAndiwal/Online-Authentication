/**
 * Tests for NotificationThresholdMonitor
 * 
 * Tests the background job functionality for monitoring student attendance
 * thresholds and sending notifications.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationThresholdMonitor } from '../notification-threshold-monitor';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    }))
  }
}));

vi.mock('../student-notification-service', () => {
  const MockNotificationService = vi.fn();
  MockNotificationService.prototype.checkThresholdsAndNotify = vi.fn(() => 
    Promise.resolve({ sent: true, notificationId: 'test-123' })
  );
  
  return {
    NotificationService: MockNotificationService,
    NOTIFICATION_THRESHOLDS: {
      WARNING: 80,
      MAHROOM: 75,
      TASDIQ: 85
    }
  };
});

vi.mock('../dashboard-service', () => ({
  getDashboardService: vi.fn(() => ({
    getStudentMetrics: vi.fn(() => Promise.resolve({
      totalClasses: 100,
      attendanceRate: 70, // Below threshold
      presentDays: 70,
      absentDays: 30,
      sickDays: 15,
      leaveDays: 15,
      classAverage: 85,
      ranking: 25,
      trend: 'declining',
      lastUpdated: new Date()
    })),
    warmCache: vi.fn(() => Promise.resolve())
  }))
}));

describe('NotificationThresholdMonitor', () => {
  let monitor: NotificationThresholdMonitor;

  beforeEach(() => {
    monitor = new NotificationThresholdMonitor();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (monitor && typeof monitor.stop === 'function') {
      monitor.stop();
    }
  });

  describe('Service Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => new NotificationThresholdMonitor()).not.toThrow();
    });

    it('should start and stop monitoring service', () => {
      expect(monitor.getStatus().cronJobActive).toBe(false);
      
      monitor.start();
      expect(monitor.getStatus().cronJobActive).toBe(true);
      
      monitor.stop();
      expect(monitor.getStatus().cronJobActive).toBe(false);
    });

    it('should not start multiple instances', () => {
      monitor.start();
      const consoleSpy = vi.spyOn(console, 'log');
      
      monitor.start(); // Try to start again
      
      expect(consoleSpy).toHaveBeenCalledWith('Notification threshold monitor is already running');
    });
  });

  describe('Status and Monitoring', () => {
    it('should return correct status information', () => {
      const status = monitor.getStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('cronJobActive');
      expect(status).toHaveProperty('retryQueueSize');
      expect(typeof status.isRunning).toBe('boolean');
      expect(typeof status.cronJobActive).toBe('boolean');
      expect(typeof status.retryQueueSize).toBe('number');
    });

    it('should return retry queue status', () => {
      const retryStatus = monitor.getRetryQueueStatus();
      
      expect(retryStatus).toHaveProperty('totalPending');
      expect(retryStatus).toHaveProperty('byType');
      expect(retryStatus).toHaveProperty('byAttempts');
      expect(typeof retryStatus.totalPending).toBe('number');
      expect(typeof retryStatus.byType).toBe('object');
      expect(typeof retryStatus.byAttempts).toBe('object');
    });
  });

  describe('Manual Operations', () => {
    it('should clear retry queue', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      monitor.clearRetryQueue();
      
      expect(consoleSpy).toHaveBeenCalledWith('Cleared 0 notifications from retry queue');
      expect(monitor.getRetryQueueStatus().totalPending).toBe(0);
    });

    it('should allow manual threshold check', async () => {
      const result = await monitor.runManualCheck();
      
      expect(result).toHaveProperty('totalStudentsChecked');
      expect(result).toHaveProperty('notificationsSent');
      expect(result).toHaveProperty('notificationsFailed');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('timestamp');
      
      expect(typeof result.totalStudentsChecked).toBe('number');
      expect(typeof result.notificationsSent).toBe('number');
      expect(typeof result.notificationsFailed).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(typeof result.executionTime).toBe('number');
      expect(result.timestamp instanceof Date).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle monitoring job errors gracefully', async () => {
      // Mock a database error
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      } as any);

      const result = await monitor.runManualCheck();
      
      expect(result.totalStudentsChecked).toBe(0);
      expect(result.notificationsFailed).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('error');
    });

    it('should not allow concurrent job execution', async () => {
      // Start a job and immediately try to start another
      const promise1 = monitor.runManualCheck();
      const promise2 = monitor.runManualCheck();
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // One should succeed, one should be skipped
      const totalChecked = result1.totalStudentsChecked + result2.totalStudentsChecked;
      expect(totalChecked).toBeGreaterThanOrEqual(0);
      
      // At least one should have the "already running" error
      const hasAlreadyRunningError = result1.errors.some(e => e.error.includes('already running')) ||
                                   result2.errors.some(e => e.error.includes('already running'));
      expect(hasAlreadyRunningError).toBe(true);
    });
  });
});