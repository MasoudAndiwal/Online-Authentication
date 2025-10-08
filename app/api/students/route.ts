import { NextRequest, NextResponse } from 'next/server';
import { createStudent } from '@/lib/database/operations';
import { StudentCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { DatabaseError, handleApiError } from '@/lib/database/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body using StudentCreateSchema
    const validatedData = StudentCreateSchema.parse(body);

    // Hash password before storing
    const hashedPassword = await hashPassword(validatedData.password);

    // Convert dateOfBirth string to Date if provided
    const dateOfBirth = validatedData.dateOfBirth
      ? new Date(validatedData.dateOfBirth)
      : null;

    // Convert programs array to comma-separated string
    const programsString = validatedData.programs.join(', ');

    // Create student record using Supabase operations
    const student = await createStudent({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      fatherName: validatedData.fatherName,
      grandFatherName: validatedData.grandFatherName,
      studentId: validatedData.studentId,
      dateOfBirth,
      phone: validatedData.phone,
      fatherPhone: validatedData.fatherPhone,
      address: validatedData.address || '',
      programs: programsString,
      semester: validatedData.semester,
      enrollmentYear: validatedData.enrollmentYear,
      classSection: validatedData.classSection,
      timeSlot: validatedData.timeSlot,
      username: validatedData.username,
      studentIdRef: validatedData.studentIdRef,
      password: hashedPassword,
    });

    // Return created student data excluding password field
    const { password, ...studentWithoutPassword } = student;

    return NextResponse.json(studentWithoutPassword, { status: 201 });

  } catch (error) {
    // Handle validation errors (400)
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors using Supabase error mapping
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error creating student:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while creating the student',
      },
      { status: 500 }
    );
  }
}
