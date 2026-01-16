/**
 * Forward Message API Route
 * 
 * POST /api/messages/forward - Forward a message to another user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType } from '@/lib/services/messaging-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, recipientId, recipientType } = body as {
      messageId: string
      recipientId: string
      recipientType: UserType
    }

    if (!messageId || !recipientId || !recipientType) {
      return NextResponse.json(
        { error: 'messageId, recipientId, and recipientType are required' },
        { status: 400 }
      )
    }

    const userType = session.role.toLowerCase() as UserType
    const senderName = `${session.firstName} ${session.lastName}`.trim() || 'Unknown'
    
    const message = await messagingService.forwardMessage(
      {
        id: session.id,
        type: userType,
        name: senderName,
      },
      messageId,
      recipientId,
      recipientType
    )

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error forwarding message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to forward message' },
      { status: 500 }
    )
  }
}
