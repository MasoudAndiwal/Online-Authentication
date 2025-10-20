import { NextRequest, NextResponse } from 'next/server';
import { findStudentById, updateStudent, deleteStudent } from '@/lib/database/operations';
import type { Student } from '@/lib/database/models';
import { DatabaseError, handleApiError } from '@/lib/database/errors';
import { ZodError } from 'zod';
import { hashPassword } from '@/lib/utils/password';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch student by ID
    const student = await findStudentById(id);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Remove password field and keep strong typing
    const { password: _p, ...studentWithoutPassword } = student as Student;
    void _p;

    return NextResponse.json(studentWithoutPassword, { status: 200 });

  } catch (error) {
    // Handle database errors
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the student' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if student exists
    const existingStudent = await findStudentById(id);
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
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
    if (body.studentId !== undefined) updateData.studentId = body.studentId;
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.fatherPhone !== undefined) updateData.fatherPhone = body.fatherPhone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.programs !== undefined) {
      // Convert array to comma-separated string if it's an array
      updateData.programs = Array.isArray(body.programs) 
        ? body.programs.join(', ') 
        : body.programs;
    }
    if (body.semester !== undefined) updateData.semester = body.semester;
    if (body.enrollmentYear !== undefined) updateData.enrollmentYear = body.enrollmentYear;
    if (body.classSection !== undefined) updateData.classSection = body.classSection;
    if (body.timeSlot !== undefined) updateData.timeSlot = body.timeSlot;
    if (body.username !== undefined) updateData.username = body.username;
    if (body.studentIdRef !== undefined) updateData.studentIdRef = body.studentIdRef;
    if (body.status !== undefined) updateData.status = body.status;

    // Hash password if provided
    if (body.password !== undefined && body.password) {
      updateData.password = await hashPassword(body.password);
    }

    // Update student
    const updatedStudent = await updateStudent(id, updateData);

    // Remove password field and keep strong typing
    const { password: _p2, ...studentWithoutPassword } = updatedStudent as Student;
    void _p2;

    return NextResponse.json(studentWithoutPassword, { status: 200 });

  } catch (error) {
    // Handle validation errors (400)
    if (error instanceof ZodError) {
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
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the student' },
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

    // Check if student exists
    const existingStudent = await findStudentById(id);
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Delete student
    await deleteStudent(id);

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    // Handle database errors
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the student' },
      { status: 500 }
    );
  }
}
