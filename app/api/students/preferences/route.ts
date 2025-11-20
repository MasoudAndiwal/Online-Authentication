/**
 * Student Notification Preferences API Endpoint
 * 
 * Provides notification preference management functionality.
 * Handles fetching and updating student notification preferences.
 * 
 * Requirements: 8.5 (notification preference management)
 */

import { NextResponse } from 'next/server';
import { withNotificationMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError } from '@/lib/errors/custom-errors';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Validation schema for notification preferences
const NotificationPreferencesSchema = z.object({
  emailEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  attendanceAlerts: z.boolean(),
  fileUpdates: z.boolean(),
  systemAnnouncements: z.boolean()
});

type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

/**
 * GET /api/students/preferences
 * 
 * Fetches notification preferences for the authenticated student.
 * 
 * Query Parameters:
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * 
 * Requirements: 8.5 (preference retrieval)
 */
export const GET = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');

    // Determine which student's preferences to fetch
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only access their own preferences
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only access their own preferences',
        'studentId'
      );
    }

    try {
      const startTime = performance.now();
      
      // Fetch preferences from database
      const { data: preferences, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('student_id', targetStudentId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Database error fetching preferences:', error);
        throw new Error('Failed to fetch notification preferences');
      }

      // If no preferences exist, return defaults
      const defaultPreferences: NotificationPreferences = {
        emailEnabled: true,
        inAppEnabled: true,
        attendanceAlerts: true,
        fileUpdates: true,
        systemAnnouncements: true
      };

      const userPreferences = preferences ? {
        emailEnabled: preferences.email_enabled,
        inAppEnabled: preferences.in_app_enabled,
        attendanceAlerts: preferences.attendance_alerts,
        fileUpdates: preferences.file_updates,
        systemAnnouncements: preferences.system_announcements
      } : defaultPreferences;

      const responseTime = performance.now() - startTime;

      const response = {
        success: true,
        data: {
          studentId: targetStudentId,
          preferences: userPreferences,
          lastUpdated: preferences?.updated_at || null
        },
        meta: {
          hasCustomPreferences: !!preferences,
          responseTime: Math.round(responseTime),
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`
        }
      });

    } catch (error) {
      throw error;
    }
  },
  'get-preferences'
);

/**
 * PUT /api/students/preferences
 * 
 * Updates notification preferences for the authenticated student.
 * 
 * Request Body:
 * - preferences: NotificationPreferences object
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * 
 * Requirements: 8.5 (preference updates with validation)
 */
export const PUT = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const body = await req.json();
    const { preferences, studentId: requestedStudentId } = body;

    // Determine which student's preferences to update
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only update their own preferences
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only update their own preferences',
        'studentId'
      );
    }

    // Validate preferences object
    if (!preferences) {
      throw new ValidationError('Preferences object is required', 'preferences');
    }

    try {
      // Validate preferences schema
      const validatedPreferences = NotificationPreferencesSchema.parse(preferences);
      
      const startTime = performance.now();

      // Check if preferences already exist
      const { data: existingPreferences } = await supabase
        .from('notification_preferences')
        .select('student_id')
        .eq('student_id', targetStudentId)
        .single();

      let result;
      const now = new Date().toISOString();

      if (existingPreferences) {
        // Update existing preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .update({
            email_enabled: validatedPreferences.emailEnabled,
            in_app_enabled: validatedPreferences.inAppEnabled,
            attendance_alerts: validatedPreferences.attendanceAlerts,
            file_updates: validatedPreferences.fileUpdates,
            system_announcements: validatedPreferences.systemAnnouncements,
            updated_at: now
          })
          .eq('student_id', targetStudentId)
          .select();

        if (error) {
          console.error('Database error updating preferences:', error);
          throw new Error('Failed to update notification preferences');
        }

        result = data?.[0];
      } else {
        // Insert new preferences
        const { data, error } = await supabase
          .from('notification_preferences')
          .insert({
            student_id: targetStudentId,
            email_enabled: validatedPreferences.emailEnabled,
            in_app_enabled: validatedPreferences.inAppEnabled,
            attendance_alerts: validatedPreferences.attendanceAlerts,
            file_updates: validatedPreferences.fileUpdates,
            system_announcements: validatedPreferences.systemAnnouncements,
            updated_at: now
          })
          .select();

        if (error) {
          console.error('Database error inserting preferences:', error);
          throw new Error('Failed to create notification preferences');
        }

        result = data?.[0];
      }

      const responseTime = performance.now() - startTime;

      const response = {
        success: true,
        data: {
          studentId: targetStudentId,
          preferences: validatedPreferences,
          updatedAt: now
        },
        meta: {
          operation: existingPreferences ? 'updated' : 'created',
          responseTime: Math.round(responseTime),
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new ValidationError(
          `Invalid preferences: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          'preferences'
        );
      }

      throw error;
    }
  },
  'update-preferences'
);

/**
 * PATCH /api/students/preferences
 * 
 * Partially updates notification preferences for the authenticated student.
 * Only updates the provided fields, leaving others unchanged.
 * 
 * Request Body:
 * - preferences: Partial NotificationPreferences object
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * 
 * Requirements: 8.5 (partial preference updates)
 */
export const PATCH = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const body = await req.json();
    const { preferences, studentId: requestedStudentId } = body;

    // Determine which student's preferences to update
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only update their own preferences
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only update their own preferences',
        'studentId'
      );
    }

    // Validate preferences object
    if (!preferences || typeof preferences !== 'object') {
      throw new ValidationError('Preferences object is required', 'preferences');
    }

    try {
      // Validate partial preferences schema
      const PartialPreferencesSchema = NotificationPreferencesSchema.partial();
      const validatedPreferences = PartialPreferencesSchema.parse(preferences);
      
      // Check if there are any fields to update
      if (Object.keys(validatedPreferences).length === 0) {
        throw new ValidationError('At least one preference field must be provided', 'preferences');
      }

      const startTime = performance.now();

      // Build update object with only provided fields
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (validatedPreferences.emailEnabled !== undefined) {
        updateData.email_enabled = validatedPreferences.emailEnabled;
      }
      if (validatedPreferences.inAppEnabled !== undefined) {
        updateData.in_app_enabled = validatedPreferences.inAppEnabled;
      }
      if (validatedPreferences.attendanceAlerts !== undefined) {
        updateData.attendance_alerts = validatedPreferences.attendanceAlerts;
      }
      if (validatedPreferences.fileUpdates !== undefined) {
        updateData.file_updates = validatedPreferences.fileUpdates;
      }
      if (validatedPreferences.systemAnnouncements !== undefined) {
        updateData.system_announcements = validatedPreferences.systemAnnouncements;
      }

      // Update preferences (will create with defaults if not exists)
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          student_id: targetStudentId,
          ...updateData
        })
        .select();

      if (error) {
        console.error('Database error updating preferences:', error);
        throw new Error('Failed to update notification preferences');
      }

      const result = data?.[0];
      const updatedPreferences = result ? {
        emailEnabled: result.email_enabled,
        inAppEnabled: result.in_app_enabled,
        attendanceAlerts: result.attendance_alerts,
        fileUpdates: result.file_updates,
        systemAnnouncements: result.system_announcements
      } : null;

      const responseTime = performance.now() - startTime;

      const response = {
        success: true,
        data: {
          studentId: targetStudentId,
          preferences: updatedPreferences,
          updatedFields: Object.keys(validatedPreferences),
          updatedAt: updateData.updated_at
        },
        meta: {
          operation: 'partial_update',
          responseTime: Math.round(responseTime),
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`
        }
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        throw new ValidationError(
          `Invalid preferences: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          'preferences'
        );
      }

      throw error;
    }
  },
  'patch-preferences'
);