import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET /api/classes/[id]
 * Fetch a single class by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;

    console.log('[Class API] Fetching class:', classId);

    // Fetch class from database
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError) {
      console.error('[Class API] Error fetching class:', classError);
      if (classError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }
      throw classError;
    }

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Transform class data
    const transformedClass = {
      id: classData.id,
      name: classData.name,
      session: classData.session || 'MORNING',
      major: classData.major || '',
      semester: Number(classData.semester || 1),
      createdAt: classData.created_at,
      updatedAt: classData.updated_at,
    };

    console.log('[Class API] Successfully fetched class');

    return NextResponse.json(transformedClass);

  } catch (error) {
    console.error('[Class API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch class',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
