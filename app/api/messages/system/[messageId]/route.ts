/**
 * System Message Actions API Route
 * 
 * PATCH /api/messages/system/[messageId] - Mark as read or dismiss
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService } from '@/lib/services/messaging-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await params
    const body = await request.json()
    const { action } = body as { action: 'read' | 'dismiss' }

    if (action === 'read') {
      await messagingService.markSystemMessageAsRead(messageId)
    } else if (action === 'dismiss') {
      await messagingService.dismissSystemMessage(messageId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "read" or "dismiss"' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating system message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update message' },
      { status: 500 }
    )
  }
}
