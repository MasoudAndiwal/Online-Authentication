/**
 * Schedule Message API Route
 * 
 * POST /api/messages/schedule - Schedule a message for later delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { officeMessagingService } from '@/lib/services/office/messaging/messaging-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only office users can schedule messages
    if (session.role.toLowerCase() !== 'office') {
      return NextResponse.json(
        { error: 'Only office users can schedule messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { conversationId, recipientId, draft, scheduledFor } = body;

    // Validate required fields
    if (!conversationId || !recipientId || !draft || !scheduledFor) {
      return NextResponse.json(
        { error: 'conversationId, recipientId, draft, and scheduledFor are required' },
        { status: 400 }
      );
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(scheduledFor);
    const now = new Date();
    
    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    // Set current user for the service
    const userName = `${session.firstName} ${session.lastName}`.trim() || 'Office User';
    officeMessagingService.setCurrentUser({
      id: session.id,
      role: 'office',
      name: userName,
    });

    // Schedule the message
    const scheduled = await officeMessagingService.scheduleMessage({
      conversationId,
      recipientId,
      draft,
      scheduledFor: scheduledDate,
    });

    return NextResponse.json({ scheduled }, { status: 201 });
  } catch (error) {
    console.error('Error scheduling message:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule message' },
      { status: 500 }
    );
  }
}
