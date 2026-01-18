/**
 * Broadcast Messages API Route
 * 
 * POST /api/messages/broadcast - Send a message to all students in a class
 * Only teachers and office users can use this endpoint
 * Supports file attachments via FormData
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, type UserType, type MessageCategory } from '@/lib/services/messaging-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const senderType = session.role.toLowerCase() as UserType

    // Only teachers and office can broadcast
    if (senderType === 'student') {
      return NextResponse.json(
        { error: 'Students cannot send broadcast messages' },
        { status: 403 }
      )
    }

    // Parse FormData to support file attachments
    const formData = await request.formData()
    const classId = formData.get('classId') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as MessageCategory) || 'general'
    
    // Extract file attachments
    const attachments: File[] = []
    const attachmentEntries = formData.getAll('attachments')
    for (const entry of attachmentEntries) {
      if (entry instanceof File) {
        attachments.push(entry)
      }
    }

    if (!classId || !content) {
      return NextResponse.json(
        { error: 'classId and content are required' },
        { status: 400 }
      )
    }

    const senderName = `${session.firstName} ${session.lastName}`.trim() || 'Unknown'
    const result = await messagingService.broadcastToClass(
      {
        id: session.id,
        type: senderType,
        name: senderName,
      },
      classId,
      content,
      category,
      attachments.length > 0 ? attachments : undefined
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error sending broadcast:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send broadcast' },
      { status: 500 }
    )
  }
}
