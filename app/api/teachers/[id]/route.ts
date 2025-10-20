import { NextRequest, NextResponse } from 'next/server';
import { findTeacherById, updateTeacher, deleteTeacher } from '@/lib/database/operations';
import type { Teacher } from '@/lib/database/models';
import { DatabaseError, handleApiError } from '@/lib/database/errors';
import { ZodError } from 'zod';
import { hashPassword } from '@/lib/utils/password';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch teacher by ID
    const teacher = await findTeacherById(id);

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Remove password field and keep strong typing
    const { password: _p, ...teacherWithoutPassword } = teacher as Teacher;
    void _p;

    return NextResponse.json(teacherWithoutPassword, { status: 200 });

  } catch (error) {
    // Handle database errors
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error fetching teacher:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the teacher' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== PUT /api/teachers/[id] called ===');
  try {
    const { id } = await params;
    console.log('Teacher ID:', id);
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Check if teacher exists
    const existingTeacher = await findTeacherById(id);
    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Only include fields that are provided in the request
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName;
    if (body.grandFatherName !== undefined) updateData.grandFatherName = body.grandFatherName;
    if (body.teacherId !== undefined) updateData.teacherId = body.teacherId;
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.secondaryPhone !== undefined) updateData.secondaryPhone = body.secondaryPhone;
    if (body.address !== undefined) updateData.address = body.address;
    
    // Convert comma-separated strings to arrays if needed
    if (body.departments !== undefined) {
      updateData.departments = Array.isArray(body.departments) 
        ? body.departments 
        : body.departments.split(',').map((d: string) => d.trim()).filter((d: string) => d.length > 0);
    }
    
    if (body.qualification !== undefined) updateData.qualification = body.qualification;
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.specialization !== undefined) updateData.specialization = body.specialization;
    
    // Convert comma-separated strings to arrays if needed
    if (body.subjects !== undefined) {
      updateData.subjects = Array.isArray(body.subjects) 
        ? body.subjects 
        : body.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    }
    
    if (body.classes !== undefined) {
      updateData.classes = Array.isArray(body.classes) 
        ? body.classes 
        : body.classes.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    }
    
    if (body.username !== undefined) updateData.username = body.username;
    if (body.status !== undefined) updateData.status = body.status;

    // Hash password if provided
    if (body.password !== undefined && body.password) {
      updateData.password = await hashPassword(body.password);
    }

    // Update teacher
    console.log('Updating teacher with data:', JSON.stringify(updateData, null, 2));
    const updatedTeacher = await updateTeacher(id, updateData);

    // Remove password field and keep strong typing
    const { password: _p2, ...teacherWithoutPassword } = updatedTeacher as Teacher;
    void _p2;

    return NextResponse.json(teacherWithoutPassword, { status: 200 });

  } catch (error) {
    // Handle validation errors (400)
    if (error instanceof ZodError) {
      console.error('Zod Validation Error:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors
    if (error instanceof DatabaseError) {
      console.error('Database Error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error updating teacher:', error);
    console.error('Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while updating the teacher',
        details: (error as Error)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // PATCH is the same as PUT for partial updates
  return PUT(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if teacher exists
    const existingTeacher = await findTeacherById(id);
    if (!existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Delete teacher
    await deleteTeacher(id);

    return NextResponse.json(
      { message: 'Teacher deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    // Handle database errors
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error deleting teacher:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the teacher' },
      { status: 500 }
    );
  }
}
