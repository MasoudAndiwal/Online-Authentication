/**
 * Conversations API Route
 * 
 * GET /api/conversations - Get all conversations for current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType } from '@/lib/services/messaging-service'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userType = session.role.toLowerCase() as UserType
    const conversations = await messagingService.getConversations(
      session.id,
      userType
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
