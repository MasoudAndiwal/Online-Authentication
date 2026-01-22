/**
 * Broadcast History API Route
 * 
 * GET /api/messages/broadcast/history - Get broadcast history for current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/server-session'
import { supabase } from '@/lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.id) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const senderType = session.role?.toUpperCase() || 'OFFICE'

    // Only teachers and office can view broadcast history
    if (senderType === 'STUDENT') {
      return NextResponse.json(
        { error: 'Students cannot access broadcast history' },
        { status: 403 }
      )
    }

    // Fetch broadcasts from database
    const { data: broadcasts, error } = await supabase
      .from('broadcast_messages')
      .select(`
        id,
        sender_id,
        sender_type,
        sender_name,
        class_id,
        class_name,
        content,
        category,
        total_recipients,
        delivered_count,
        created_at
      `)
      .eq('sender_id', session.id)
      .eq('sender_type', senderType)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching broadcast history:', error)
      return NextResponse.json(
        { error: 'Failed to fetch broadcast history' },
        { status: 500 }
      )
    }

    // For each broadcast, get the read count
    const broadcastsWithReadCount = await Promise.all(
      (broadcasts || []).map(async (broadcast) => {
        // Count how many recipients have read the message (read_at is not null)
        const { data: recipients, error: recipientsError } = await supabase
          .from('broadcast_recipients')
          .select('read_at')
          .eq('broadcast_id', broadcast.id)

        if (recipientsError) {
          console.error('Error fetching recipients for broadcast:', broadcast.id, recipientsError)
          return {
            ...broadcast,
            readCount: 0,
          }
        }

        const readCount = recipients?.filter(r => r.read_at !== null).length || 0

        return {
          id: broadcast.id,
          className: broadcast.class_name,
          content: broadcast.content,
          category: broadcast.category,
          totalRecipients: broadcast.total_recipients,
          deliveredCount: broadcast.delivered_count,
          readCount,
          createdAt: broadcast.created_at,
        }
      })
    )

    return NextResponse.json({ broadcasts: broadcastsWithReadCount })
  } catch (error) {
    console.error('Error in broadcast history API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
