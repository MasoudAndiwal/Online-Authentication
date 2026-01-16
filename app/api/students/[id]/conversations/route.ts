/**
 * Student Conversations API Route (Backward Compatibility)
 * 
 * GET /api/students/[id]/conversations - Get conversations for a specific student
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService } from '@/lib/services/messaging-service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: studentId } = await params
    const userRole = session.role.toLowerCase()

    // Verify the user is requesting their own conversations or is admin
    if (session.id !== studentId && userRole !== 'office') {
      return NextResponse.json(
        { error: 'You do not have access to this data' },
        { status: 403 }
      )
    }

    const conversations = await messagingService.getConversations(studentId, 'student')

    // Transform to match expected format
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      recipientType: conv.otherParticipant.type,
      recipientName: conv.otherParticipant.name,
      recipientAvatar: conv.otherParticipant.avatar,
      lastMessage: conv.lastMessagePreview || '',
      lastMessageAt: conv.lastMessageAt?.toISOString() || new Date().toISOString(),
      unreadCount: conv.unreadCount,
    }))

    return NextResponse.json({ conversations: transformedConversations })
  } catch (error) {
    console.error('Error fetching student conversations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
