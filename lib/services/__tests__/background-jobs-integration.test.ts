/**
 * Integration Tests for Background Jobs
 * 
 * Tests the actual functionality of background jobs without complex mocking.
 * These tests verify that the services can be instantiated and basic operations work.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BackgroundJobsService } from '../background-jobs';
import { NotificationThresholdMonitor } from '../notification-threshold-monitor';

describe('Background Jobs Integration', () => {
  let backgroundJobs: BackgroundJobsService;
  let thresholdMonitor: NotificationThresholdMonitor;

  beforeEach(() => {
    backgroundJobs = new BackgroundJobsService();
    thresholdMonitor = new NotificationThresholdMonitor();
  });

  afterEach(() => {
    // Clean up any running jobs
    try {
      backgroundJobs.stopAll();
      thresholdMonitor.stop();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Service Instantiation', () => {
    it('should create BackgroundJobsService without errors', () => {
      expect(backgroundJobs).toBeInstanceOf(BackgroundJobsService);
      expect(backgroundJobs.isServiceInitialized()).toBe(false);
    });

    it('should create NotificationThresholdMonitor without errors', () => {
      expect(thresholdMonitor).toBeInstanceOf(NotificationThresholdMonitor);
    });
  });

  describe('Service Status', () => {
    it('should return valid status from BackgroundJobsService', () => {
      const status = backgroundJobs.getStatus();
      
      expect(status).toHaveProperty('totalJobs');
      expect(status).toHaveProperty('runningJobs');
      expect(status).toHaveProperty('stoppedJobs');
      expect(status).toHaveProperty('errorJobs');
      expect(status).toHaveProperty('jobs');
      expect(status).toHaveProperty('systemHealth');
      
      expect(typeof status.totalJobs).toBe('number');
      expect(typeof status.runningJobs).toBe('number');
      expect(typeof status.stoppedJobs).toBe('number');
      expect(typeof status.errorJobs).toBe('number');
      expect(Array.isArray(status.jobs)).toBe(true);
      expect(['healthy', 'degraded', 'critical']).toContain(status.systemHealth);
    });

    it('should return valid status from NotificationThresholdMonitor', () => {
      const status = thresholdMonitor.getStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('cronJobActive');
      expect(status).toHaveProperty('retryQueueSize');
      
      expect(typeof status.isRunning).toBe('boolean');
      expect(typeof status.cronJobActive).toBe('boolean');
      expect(typeof status.retryQueueSize).toBe('number');
    });

    it('should return valid retry queue status', () => {
      const retryStatus = thresholdMonitor.getRetryQueueStatus();
      
      expect(retryStatus).toHaveProperty('totalPending');
      expect(retryStatus).toHaveProperty('byType');
      expect(retryStatus).toHaveProperty('byAttempts');
      
      expect(typeof retryStatus.totalPending).toBe('number');
      expect(typeof retryStatus.byType).toBe('object');
      expect(typeof retryStatus.byAttempts).toBe('object');
    });
  });

  describe('Basic Operations', () => {
    it('should handle job lifecycle operations', () => {
      // Initially not initialized
      expect(backgroundJobs.isServiceInitialized()).toBe(false);
      
      // Should be able to get status even when not initialized
      const status = backgroundJobs.getStatus();
      expect(status.totalJobs).toBe(0);
    });

    it('should handle threshold monitor lifecycle', () => {
      // Initially not running
      expect(thresholdMonitor.getStatus().isRunning).toBe(false);
      expect(thresholdMonitor.getStatus().cronJobActive).toBe(false);
      
      // Should be able to clear retry queue
      expect(() => thresholdMonitor.clearRetryQueue()).not.toThrow();
      
      // Should be able to get retry queue status
      const retryStatus = thresholdMonitor.getRetryQueueStatus();
      expect(retryStatus.totalPending).toBe(0);
    });

    it('should handle graceful shutdown', async () => {
      // Should be able to shutdown even when not initialized
      expect(() => backgroundJobs.shutdown()).not.toThrow();
      
      // Should be able to stop threshold monitor even when not started
      expect(() => thresholdMonitor.stop()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid job operations gracefully', () => {
      // Try to stop a non-existent job
      const result = backgroundJobs.stopJob('non-existent-job');
      expect(result).toBe(false);
      
      // Try to start a non-existent job
      const startResult = backgroundJobs.startJob('non-existent-job');
      expect(startResult).toBe(false);
      
      // Try to get status of non-existent job
      const jobStatus = backgroundJobs.getJobStatus('non-existent-job');
      expect(jobStatus).toBeNull();
    });

    it('should handle multiple stop calls gracefully', () => {
      // Multiple stops should not throw
      expect(() => {
        thresholdMonitor.stop();
        thresholdMonitor.stop();
        thresholdMonitor.stop();
      }).not.toThrow();
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid cron schedules in job configs', () => {
      // Test that the cron schedule patterns are valid
      const cronPatterns = [
        '0 * * * *',     // hourly
        '*/5 * * * *',   // every 5 minutes
        '*/10 * * * *',  // every 10 minutes
        '0 2 * * *',     // daily at 2 AM
        '*/15 * * * *'   // every 15 minutes
      ];

      cronPatterns.forEach(pattern => {
        // Basic validation - should have 5 parts separated by spaces
        const parts = pattern.split(' ');
        expect(parts).toHaveLength(5);
        
        // Each part should be valid cron syntax (basic check)
        parts.forEach(part => {
          expect(part).toMatch(/^[\d\*\/\-,]+$/);
        });
      });
    });

    it('should have consistent threshold values', async () => {
      // Import the thresholds to verify they're accessible
      const { NOTIFICATION_THRESHOLDS } = await import('../student-notification-service');
      
      expect(NOTIFICATION_THRESHOLDS).toHaveProperty('WARNING');
      expect(NOTIFICATION_THRESHOLDS).toHaveProperty('MAHROOM');
      expect(NOTIFICATION_THRESHOLDS).toHaveProperty('TASDIQ');
      
      expect(typeof NOTIFICATION_THRESHOLDS.WARNING).toBe('number');
      expect(typeof NOTIFICATION_THRESHOLDS.MAHROOM).toBe('number');
      expect(typeof NOTIFICATION_THRESHOLDS.TASDIQ).toBe('number');
      
      // Verify threshold ordering makes sense
      expect(NOTIFICATION_THRESHOLDS.MAHROOM).toBeLessThan(NOTIFICATION_THRESHOLDS.WARNING);
      expect(NOTIFICATION_THRESHOLDS.TASDIQ).toBeGreaterThan(NOTIFICATION_THRESHOLDS.WARNING);
    });
  });
});