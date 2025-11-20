/**
 * Student Notifications API Endpoint
 * 
 * Provides notification management functionality with pagination support.
 * Handles fetching unread notifications and marking notifications as read.
 * 
 * Requirements: 8.1, 8.2, 8.3 (notification management)
 */

import { NextResponse } from 'next/server';
import { withNotificationMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError } from '@/lib/errors/custom-errors';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/students/notifications
 * 
 * Fetches notifications for the authenticated student with pagination support.
 * 
 * Query Parameters:
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * - unreadOnly: Return only unread notifications (default: false)
 * - page: Page number for pagination (default: 1)
 * - limit: Number of notifications per page (default: 20, max: 100)
 * - type: Filter by notification type (optional)
 * 
 * Requirements: 8.1, 8.2, 8.3 (notification retrieval)
 */
export const GET = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const type = searchParams.get('type');

    // Determine which student's notifications to fetch
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only access their own notifications
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only access their own notifications',
        'studentId'
      );
    }

    try {
      const startTime = performance.now();
      
      // Build query
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('student_id', targetStudentId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (unreadOnly) {
        query = query.eq('read', false);
      }

      if (type) {
        query = query.eq('type', type);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: notifications, error, count } = await query;

      if (error) {
        console.error('Database error fetching notifications:', error);
        throw new Error('Failed to fetch notifications');
      }

      const responseTime = performance.now() - startTime;

      // Calculate pagination metadata
      const totalPages = Math.ceil((count || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const response = {
        success: true,
        data: notifications || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage,
          hasPreviousPage
        },
        meta: {
          studentId: targetStudentId,
          unreadOnly,
          type,
          responseTime: Math.round(responseTime),
          generatedAt: new Date().toISOString(),
          requestId: req.requestId
        }
      };

      return NextResponse.json(response, {
        status: 200,
        headers: {
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Total-Count': (count || 0).toString()
        }
      });

    } catch (error) {
      throw error;
    }
  },
  'get-notifications'
);

/**
 * POST /api/students/notifications
 * 
 * Handles notification actions like marking as read.
 * 
 * Request Body:
 * - action: 'mark_read' | 'mark_all_read'
 * - notificationId: ID of notification to mark as read (required for 'mark_read')
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * 
 * Requirements: 8.1, 8.2, 8.3 (notification management)
 */
export const POST = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const body = await req.json();
    const { action, notificationId, studentId: requestedStudentId } = body;

    // Determine which student's notifications to update
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Authorization check: students can only modify their own notifications
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only modify their own notifications',
        'studentId'
      );
    }

    // Validate action
    if (!action || !['mark_read', 'mark_all_read'].includes(action)) {
      throw new ValidationError('Action must be "mark_read" or "mark_all_read"', 'action');
    }

    // Validate notification ID for mark_read action
    if (action === 'mark_read' && !notificationId) {
      throw new ValidationError('Notification ID is required for mark_read action', 'notificationId');
    }

    try {
      const startTime = performance.now();
      let result;

      if (action === 'mark_read') {
        // Mark single notification as read
        const { data, error } = await supabase
          .from('notifications')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('id', notificationId)
          .eq('student_id', targetStudentId)
          .select();

        if (error) {
          console.error('Database error marking notification as read:', error);
          throw new Error('Failed to mark notification as read');
        }

        if (!data || data.length === 0) {
          throw new ValidationError('Notification not found or access denied', 'notificationId');
        }

        result = {
          action: 'mark_read',
          notificationId,
          updatedAt: new Date().toISOString()
        };

      } else if (action === 'mark_all_read') {
        // Mark all unread notifications as read
        const { data, error } = await supabase
          .from('notifications')
          .update({ 
            read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('student_id', targetStudentId)
          .eq('read', false)
          .select('id');

        if (error) {
          console.error('Database error marking all notifications as read:', error);
          throw new Error('Failed to mark all notifications as read');
        }

        result = {
          action: 'mark_all_read',
          updatedCount: data?.length || 0,
          updatedAt: new Date().toISOString()
        };
      }

      const responseTime = performance.now() - startTime;

      const response = {
        success: true,
        data: result,
        meta: {
          studentId: targetStudentId,
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
  'update-notifications'
);

/**
 * DELETE /api/students/notifications
 * 
 * Deletes a specific notification.
 * 
 * Query Parameters:
 * - notificationId: ID of notification to delete (required)
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * 
 * Requirements: 8.1, 8.2, 8.3 (notification management)
 */
export const DELETE = withNotificationMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get('notificationId');
    const requestedStudentId = searchParams.get('studentId');

    // Determine which student's notification to delete
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    if (!notificationId) {
      throw new ValidationError('Notification ID is required', 'notificationId');
    }

    // Authorization check: students can only delete their own notifications
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only delete their own notifications',
        'studentId'
      );
    }

    try {
      const startTime = performance.now();

      // Delete the notification
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('student_id', targetStudentId)
        .select();

      if (error) {
        console.error('Database error deleting notification:', error);
        throw new Error('Failed to delete notification');
      }

      if (!data || data.length === 0) {
        throw new ValidationError('Notification not found or access denied', 'notificationId');
      }

      const responseTime = performance.now() - startTime;

      const response = {
        success: true,
        data: {
          notificationId,
          deletedAt: new Date().toISOString()
        },
        meta: {
          studentId: targetStudentId,
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
  'delete-notification'
);