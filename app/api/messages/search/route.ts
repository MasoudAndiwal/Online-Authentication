/**
 * Message Search API Route
 * 
 * GET /api/messages/search?q=query - Search messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType } from '@/lib/services/messaging-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const userType = session.role.toLowerCase() as UserType
    const messages = await messagingService.searchMessages(
      session.id,
      userType,
      query.trim(),
      limit
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error searching messages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 }
    )
  }
}
