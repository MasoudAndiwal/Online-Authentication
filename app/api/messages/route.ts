/**
 * Messages API Route
 * 
 * Handles sending messages with file attachments
 * POST /api/messages - Send a new message
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { messagingService, canSendMessageTo, isFileAllowed, type UserType, type MessageCategory } from '@/lib/services/messaging-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    const recipientId = formData.get('recipientId') as string
    const recipientType = formData.get('recipientType') as UserType
    const content = formData.get('content') as string
    const category = (formData.get('category') as MessageCategory) || 'general'
    const conversationId = formData.get('conversationId') as string | null

    // Validate required fields
    if (!recipientId || !recipientType || !content) {
      return NextResponse.json(
        { error: 'recipientId, recipientType, and content are required' },
        { status: 400 }
      )
    }

    const senderType = session.role.toLowerCase() as UserType
    
    // Check permission
    if (!canSendMessageTo(senderType, recipientType)) {
      if (senderType === 'student' && recipientType === 'office') {
        return NextResponse.json(
          { error: 'Students cannot send messages to office' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'You do not have permission to message this user' },
        { status: 403 }
      )
    }

    // Process attachments
    const attachments: File[] = []
    const files = formData.getAll('attachments') as File[]
    
    for (const file of files) {
      if (file && file.size > 0) {
        // Validate file for students
        if (senderType === 'student') {
          const validation = isFileAllowed(senderType, file)
          if (!validation.allowed) {
            return NextResponse.json(
              { error: validation.reason },
              { status: 400 }
            )
          }
        }
        attachments.push(file)
      }
    }

    // Send message
    const senderName = `${session.firstName} ${session.lastName}`.trim() || 'Unknown'
    const message = await messagingService.sendMessage(
      {
        id: session.id,
        type: senderType,
        name: senderName,
      },
      {
        conversationId: conversationId || undefined,
        recipientId,
        recipientType,
        content,
        category,
        attachments,
      }
    )

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    )
  }
}
