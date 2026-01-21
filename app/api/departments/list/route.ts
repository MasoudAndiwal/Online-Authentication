/**
 * Departments List API Route
 * 
 * GET /api/departments/list - Get all available departments
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
        { error: 'Students cannot access department list' },
        { status: 403 }
      );
    }

    // Get all unique departments from the teachers table
    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('department')
      .not('department', 'is', null);

    if (error) {
      console.error('Error fetching departments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
      );
    }

    // Get unique departments
    const uniqueDepartments = [...new Set(
      (teachers || [])
        .map(t => t.department)
        .filter(d => d && d.trim() !== '')
    )].sort();

    return NextResponse.json({ departments: uniqueDepartments }, { status: 200 });
  } catch (error) {
    console.error('Error in departments list API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
