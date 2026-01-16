/**
 * Available Recipients API Route
 * 
 * GET /api/messages/recipients - Get available recipients for current user
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
    const recipients = await messagingService.getAvailableRecipients(
      session.id,
      userType
    )

    return NextResponse.json({ recipients })
  } catch (error) {
    console.error('Error fetching recipients:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}
