import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import supabase from '@/lib/supabase'

export type NotificationType = 
  | 'new_message' 
  | 'student_risk' 
  | 'broadcast_success' 
  | 'broadcast_partial'
  | 'system_update' 
  | 'schedule_change';

interface TeacherNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/teacher/notifications
 * Returns notifications for the teacher including unread messages
 */
export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const teacherId = session.id
    const notifications: TeacherNotification[] = []

    // Get unread messages from conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        unread_count,
        last_read_at,
        conversations!inner (
          id,
          last_message_at,
          last_message_preview
        )
      `)
      .eq('user_id', teacherId)
      .eq('user_type', 'teacher')
      .gt('unread_count', 0)
      .order('conversations(last_message_at)', { ascending: false })

    if (!convError && conversations) {
      // Create a notification for each conversation with unread messages
      for (const conv of conversations) {
        const conversation = conv.conversations as unknown as {
          id: string;
          last_message_at: string;
          last_message_preview: string;
        }

        // Get the other participant's name
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_name, user_type')
          .eq('conversation_id', conv.conversation_id)
          .neq('user_id', teacherId)
          .single()

        const senderName = otherParticipant?.user_name || 'Someone'
        const senderType = otherParticipant?.user_type || 'user'

        notifications.push({
          id: `msg-${conv.conversation_id}`,
          type: 'new_message',
          title: `New message from ${senderName}`,
          message: conversation.last_message_preview || 'You have a new message',
          timestamp: conversation.last_message_at,
          isRead: false,
          actionUrl: `/teacher/dashboard/messages?conversation=${conv.conversation_id}`,
          metadata: {
            conversationId: conv.conversation_id,
            unreadCount: conv.unread_count,
            senderName,
            senderType
          }
        })
      }
    }

    // Get system notifications from notifications table (if any exist for teachers)
    const { data: systemNotifications, error: sysError } = await supabase
      .from('notifications')
      .select('*')
      .eq('student_id', teacherId) // Note: This table might be student-specific
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!sysError && systemNotifications) {
      for (const notif of systemNotifications) {
        notifications.push({
          id: notif.id,
          type: notif.type as NotificationType || 'system_update',
          title: notif.title,
          message: notif.message,
          timestamp: notif.created_at,
          isRead: notif.read,
          actionUrl: notif.action_url,
          metadata: notif.metadata as Record<string, unknown>
        })
      }
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    const unreadCount = notifications.filter(n => !n.isRead).length

    return NextResponse.json({
      notifications,
      unreadCount
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching teacher notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/teacher/notifications
 * Mark a notification as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { notificationId } = await request.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    // If it's a message notification (starts with 'msg-')
    if (notificationId.startsWith('msg-')) {
      const conversationId = notificationId.replace('msg-', '')
      
      // Mark messages in this conversation as read
      const { error } = await supabase
        .from('conversation_participants')
        .update({ 
          unread_count: 0,
          last_read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', session.id)

      if (error) {
        console.error('Error marking messages as read:', error)
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
      }
    } else {
      // It's a system notification
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
