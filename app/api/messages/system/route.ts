/**
 * System Messages API Route
 * 
 * GET /api/messages/system - Get system messages for current user
 * POST /api/messages/system - Create a system message (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType, type CreateSystemMessageInput } from '@/lib/services/messaging-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeRead = searchParams.get('includeRead') === 'true'

    const userType = session.role.toLowerCase() as UserType
    const messages = await messagingService.getSystemMessages(
      session.id,
      userType,
      includeRead
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching system messages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch system messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only office/admin can create system messages
    const userRole = session.role.toLowerCase()
    if (userRole !== 'office') {
      return NextResponse.json(
        { error: 'Only office users can create system messages' },
        { status: 403 }
      )
    }

    const body = await request.json() as CreateSystemMessageInput

    const message = await messagingService.createSystemMessage(body)

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating system message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create system message' },
      { status: 500 }
    )
  }
}
