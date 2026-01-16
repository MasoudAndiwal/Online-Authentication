/**
 * Conversation Messages API Route
 * 
 * GET /api/conversations/[conversationId]/messages - Get messages for a conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType } from '@/lib/services/messaging-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const userType = session.role.toLowerCase() as UserType
    const messages = await messagingService.getMessages(
      conversationId,
      session.id,
      userType,
      limit,
      offset
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
