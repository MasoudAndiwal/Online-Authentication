/**
 * Mark Messages as Read API Route
 * 
 * POST /api/conversations/[conversationId]/read - Mark all messages as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType } from '@/lib/services/messaging-service'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const userType = session.role.toLowerCase() as UserType

    await messagingService.markMessagesAsRead(
      conversationId,
      session.id,
      userType
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
