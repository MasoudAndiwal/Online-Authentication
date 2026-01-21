/**
 * Classes List API Route
 * 
 * GET /api/classes/list - Get all available classes
 * Used for broadcast message recipient selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server-session';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and office can access this
    if (session.role.toLowerCase() === 'student') {
      return NextResponse.json(
        { error: 'Students cannot access class list' },
        { status: 403 }
      );
    }

    // Get all unique classes from the classes table
    const { data: classes, error } = await supabase
      .from('classes')
      .select('id, name, session')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500 }
      );
    }

    // Format classes for dropdown
    const formattedClasses = (classes || []).map(cls => ({
      id: cls.id,
      name: cls.name,
      session: cls.session,
      displayName: `${cls.name} - ${cls.session}`,
    }));

    return NextResponse.json({ classes: formattedClasses }, { status: 200 });
  } catch (error) {
    console.error('Error in classes list API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
