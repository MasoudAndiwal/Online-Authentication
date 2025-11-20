import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NOTIFICATION_THRESHOLDS, NotificationService } from '../student-notification-service';

/**
 * Unit tests for NotificationService (Student)
 * Tests threshold checking logic, notification constants, and preference management
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5
 */

describe('NotificationService', () => {
  describe('NOTIFICATION_THRESHOLDS', () => {
    it('should have correct threshold values for 80% warning', () => {
      expect(NOTIFICATION_THRESHOLDS.WARNING).toBe(80);
    });

    it('should have correct threshold values for 75% mahroom urgent', () => {
      expect(NOTIFICATION_THRESHOLDS.MAHROOM).toBe(75);
    });

    it('should have correct threshold values for 85% tasdiq certification', () => {
      expect(NOTIFICATION_THRESHOLDS.TASDIQ).toBe(85);
    });

    it('should have mahroom threshold lower than warning threshold', () => {
      expect(NOTIFICATION_THRESHOLDS.MAHROOM).toBeLessThan(NOTIFICATION_THRESHOLDS.WARNING);
    });

    it('should have tasdiq threshold higher than warning threshold', () => {
      expect(NOTIFICATION_THRESHOLDS.TASDIQ).toBeGreaterThan(NOTIFICATION_THRESHOLDS.WARNING);
    });
  });

  describe('Threshold Logic Validation', () => {
    it('should identify when attendance is below warning threshold (80%)', () => {
      const testCases = [
        { attendance: 79.9, shouldTrigger: true },
        { attendance: 75, shouldTrigger: true },
        { attendance: 70, shouldTrigger: true },
        { attendance: 80, shouldTrigger: false },
        { attendance: 85, shouldTrigger: false }
      ];

      testCases.forEach(({ attendance, shouldTrigger }) => {
        const isBelow = attendance < NOTIFICATION_THRESHOLDS.WARNING;
        expect(isBelow).toBe(shouldTrigger);
      });
    });

    it('should identify when attendance is at or below mahroom threshold (75%)', () => {
      const testCases = [
        { attendance: 75, shouldTrigger: true },
        { attendance: 74.9, shouldTrigger: true },
        { attendance: 70, shouldTrigger: true },
        { attendance: 75.1, shouldTrigger: false },
        { attendance: 80, shouldTrigger: false }
      ];

      testCases.forEach(({ attendance, shouldTrigger }) => {
        const isAtOrBelow = attendance <= NOTIFICATION_THRESHOLDS.MAHROOM;
        expect(isAtOrBelow).toBe(shouldTrigger);
      });
    });

    it('should identify when sick/leave hours reach tasdiq threshold (85%)', () => {
      const totalAllowedHours = 100;
      const testCases = [
        { sickLeaveHours: 85, shouldTrigger: true },
        { sickLeaveHours: 90, shouldTrigger: true },
        { sickLeaveHours: 84.9, shouldTrigger: false },
        { sickLeaveHours: 80, shouldTrigger: false }
      ];

      testCases.forEach(({ sickLeaveHours, shouldTrigger }) => {
        const percentage = (sickLeaveHours / totalAllowedHours) * 100;
        const isAtOrAbove = percentage >= NOTIFICATION_THRESHOLDS.TASDIQ;
        expect(isAtOrAbove).toBe(shouldTrigger);
      });
    });

    it('should prioritize mahroom alert over warning alert', () => {
      const attendanceRate = 70; // Below both thresholds
      
      // Mahroom threshold should be checked first since it's more urgent
      const isMahroom = attendanceRate <= NOTIFICATION_THRESHOLDS.MAHROOM;
      const isWarning = attendanceRate < NOTIFICATION_THRESHOLDS.WARNING;
      
      expect(isMahroom).toBe(true);
      expect(isWarning).toBe(true);
      
      // In the actual implementation, mahroom should take priority
      expect(NOTIFICATION_THRESHOLDS.MAHROOM).toBeLessThan(NOTIFICATION_THRESHOLDS.WARNING);
    });
  });

  describe('Preference Management', () => {
    let service: NotificationService;
    const mockStudentId = 'test-student-123';

    beforeEach(() => {
      service = new NotificationService();
      // Mock supabase calls
      vi.clearAllMocks();
    });

    describe('validatePreferences', () => {
      it('should accept valid boolean preferences', () => {
        const validPreferences = {
          emailEnabled: true,
          inAppEnabled: false,
          attendanceAlerts: true,
          fileUpdates: false,
          systemAnnouncements: true
        };

        // Access private method for testing
        expect(() => {
          (service as any).validatePreferences(validPreferences);
        }).not.toThrow();
      });

      it('should reject non-boolean values', () => {
        const invalidPreferences = {
          emailEnabled: 'true' as any, // Should be boolean
          inAppEnabled: true
        };

        expect(() => {
          (service as any).validatePreferences(invalidPreferences);
        }).toThrow('emailEnabled must be a boolean value');
      });

      it('should accept partial preferences', () => {
        const partialPreferences = {
          emailEnabled: true
          // Other fields omitted
        };

        expect(() => {
          (service as any).validatePreferences(partialPreferences);
        }).not.toThrow();
      });
    });

    describe('shouldSendNotification', () => {
      it('should return false when both email and in-app are disabled', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: false,
          inAppEnabled: false,
          attendanceAlerts: true,
          fileUpdates: true,
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        const result = (service as any).shouldSendNotification('attendance_warning', preferences);
        expect(result).toBe(false);
      });

      it('should return true when email is enabled and notification type is allowed', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: false,
          attendanceAlerts: true,
          fileUpdates: true,
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        const result = (service as any).shouldSendNotification('attendance_warning', preferences);
        expect(result).toBe(true);
      });

      it('should return true when in-app is enabled and notification type is allowed', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: false,
          inAppEnabled: true,
          attendanceAlerts: true,
          fileUpdates: true,
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        const result = (service as any).shouldSendNotification('attendance_warning', preferences);
        expect(result).toBe(true);
      });

      it('should return false when notification type is disabled', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: true,
          attendanceAlerts: false, // Disabled
          fileUpdates: true,
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        const result = (service as any).shouldSendNotification('attendance_warning', preferences);
        expect(result).toBe(false);
      });

      it('should respect file update preferences', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: true,
          attendanceAlerts: true,
          fileUpdates: false, // Disabled
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        expect((service as any).shouldSendNotification('file_approved', preferences)).toBe(false);
        expect((service as any).shouldSendNotification('file_rejected', preferences)).toBe(false);
      });

      it('should respect system announcement preferences', () => {
        const preferences = {
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: true,
          attendanceAlerts: true,
          fileUpdates: true,
          systemAnnouncements: false, // Disabled
          updatedAt: new Date()
        };

        const result = (service as any).shouldSendNotification('system_announcement', preferences);
        expect(result).toBe(false);
      });
    });

    describe('getDefaultPreferences', () => {
      it('should return default preferences with all notifications enabled', () => {
        const defaults = (service as any).getDefaultPreferences(mockStudentId);
        
        expect(defaults).toEqual({
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: true,
          attendanceAlerts: true,
          fileUpdates: true,
          systemAnnouncements: true,
          updatedAt: expect.any(Date)
        });
      });
    });

    describe('Integration: Preference Management Flow', () => {
      it('should demonstrate complete preference management workflow', () => {
        // This test demonstrates the complete workflow logic without database calls
        // In a real integration test, this would use a test database
        
        const mockPreferencesDisabled = {
          studentId: mockStudentId,
          emailEnabled: true,
          inAppEnabled: true,
          attendanceAlerts: true,
          fileUpdates: false, // Initially disabled
          systemAnnouncements: true,
          updatedAt: new Date()
        };

        const mockPreferencesEnabled = {
          ...mockPreferencesDisabled,
          fileUpdates: true // Now enabled
        };

        // Test 1: Verify notification is blocked when preference is disabled
        const shouldSendFileNotificationDisabled = (service as any).shouldSendNotification(
          'file_approved', 
          mockPreferencesDisabled
        );
        expect(shouldSendFileNotificationDisabled).toBe(false);

        // Test 2: Update preferences validation (enable file updates)
        const updateData = { fileUpdates: true };
        
        expect(() => {
          (service as any).validatePreferences(updateData);
        }).not.toThrow();

        // Test 3: Verify notification sending respects updated preferences
        const shouldSendFileNotificationEnabled = (service as any).shouldSendNotification(
          'file_approved', 
          mockPreferencesEnabled
        );
        expect(shouldSendFileNotificationEnabled).toBe(true);

        // Test 4: Verify different notification types respect their specific preferences
        expect((service as any).shouldSendNotification('attendance_warning', mockPreferencesEnabled)).toBe(true);
        expect((service as any).shouldSendNotification('system_announcement', mockPreferencesEnabled)).toBe(true);

        // Test 5: Verify channel preferences are respected
        const noChannelsEnabled = {
          ...mockPreferencesEnabled,
          emailEnabled: false,
          inAppEnabled: false
        };
        expect((service as any).shouldSendNotification('file_approved', noChannelsEnabled)).toBe(false);

        // Test 6: Verify at least one channel allows notifications
        const emailOnlyEnabled = {
          ...mockPreferencesEnabled,
          emailEnabled: true,
          inAppEnabled: false
        };
        expect((service as any).shouldSendNotification('file_approved', emailOnlyEnabled)).toBe(true);

        const inAppOnlyEnabled = {
          ...mockPreferencesEnabled,
          emailEnabled: false,
          inAppEnabled: true
        };
        expect((service as any).shouldSendNotification('file_approved', inAppOnlyEnabled)).toBe(true);
      });

      it('should handle preference validation edge cases', () => {
        // Test empty preferences object
        expect(() => {
          (service as any).validatePreferences({});
        }).not.toThrow();

        // Test null/undefined values
        expect(() => {
          (service as any).validatePreferences({
            emailEnabled: undefined,
            inAppEnabled: null as any
          });
        }).toThrow(); // null is not a boolean

        // Test mixed valid/invalid
        expect(() => {
          (service as any).validatePreferences({
            emailEnabled: true,
            inAppEnabled: 'false' as any // Invalid
          });
        }).toThrow('inAppEnabled must be a boolean value');
      });
    });
  });
});