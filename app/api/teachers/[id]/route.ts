import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/auth/server-session';

// Create Supabase client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

/**
 * GET /api/teachers/[id]
 * Fetch teacher profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get session for access control
    const session = await getServerSession(request);
    
    // Teachers can only access their own profile
    if (session?.role === 'TEACHER' && session.id !== id) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own profile.' },
        { status: 403 }
      );
    }

    const supabase = getSupabase();

    // Fetch teacher by ID
    const { data: teacher, error } = await supabase
      .from('teachers')
      .select(`
        id,
        first_name,
        last_name,
        father_name,
        grandfather_name,
        teacher_id,
        date_of_birth,
        phone,
        secondary_phone,
        address,
        departments,
        qualification,
        experience,
        specialization,
        subjects,
        classes,
        username,
        status,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error || !teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedTeacher = {
      id: teacher.id,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      fatherName: teacher.father_name,
      grandFatherName: teacher.grandfather_name,
      teacherId: teacher.teacher_id,
      dateOfBirth: teacher.date_of_birth,
      phone: teacher.phone,
      secondaryPhone: teacher.secondary_phone,
      address: teacher.address,
      departments: teacher.departments || [],
      qualification: teacher.qualification,
      experience: teacher.experience,
      specialization: teacher.specialization,
      subjects: teacher.subjects || [],
      classes: teacher.classes || [],
      username: teacher.username,
      status: teacher.status,
      createdAt: teacher.created_at,
    };

    return NextResponse.json(transformedTeacher, { status: 200 });

  } catch (error) {
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the teacher' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/teachers/[id]
 * Update teacher profile (personal and professional information)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get session for access control
    const session = await getServerSession(request);
    
    // Teachers can only update their own profile
    if (session?.role === 'TEACHER' && session.id !== id) {
      return NextResponse.json(
        { error: 'Access denied. You can only update your own profile.' },
        { status: 403 }
      );
    }

    const supabase = getSupabase();

    // Map frontend camelCase to database snake_case
    const fieldMapping: Record<string, string> = {
      phone: 'phone',
      secondaryPhone: 'secondary_phone',
      address: 'address',
      dateOfBirth: 'date_of_birth',
      qualification: 'qualification',
      experience: 'experience',
      specialization: 'specialization',
      status: 'status',
    };

    const updateData: Record<string, string | null> = {};
    
    for (const [frontendField, dbField] of Object.entries(fieldMapping)) {
      if (body[frontendField] !== undefined) {
        // Handle date field - convert empty string to null
        if (frontendField === 'dateOfBirth') {
          updateData[dbField] = body[frontendField] ? body[frontendField] : null;
        } else {
          updateData[dbField] = body[frontendField];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update teacher
    const { data: updatedTeacher, error } = await supabase
      .from('teachers')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Transform response
    const transformedTeacher = {
      id: updatedTeacher.id,
      firstName: updatedTeacher.first_name,
      lastName: updatedTeacher.last_name,
      phone: updatedTeacher.phone,
      secondaryPhone: updatedTeacher.secondary_phone,
      address: updatedTeacher.address,
      dateOfBirth: updatedTeacher.date_of_birth,
      qualification: updatedTeacher.qualification,
      experience: updatedTeacher.experience,
      specialization: updatedTeacher.specialization,
    };

    return NextResponse.json(transformedTeacher, { status: 200 });

  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the teacher' },
      { status: 500 }
    );
  }
}
