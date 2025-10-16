import { NextRequest, NextResponse } from 'next/server';
import { createTeacher, findTeacherByTeacherId, findTeacherByUsername, findTeacherByField, getAllTeachers } from '@/lib/database/operations';
import { TeacherCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { DatabaseError, handleApiError, createUniqueConstraintError } from '@/lib/database/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    console.log(body)

    // Validate request body using TeacherCreateSchema
    const validatedData = TeacherCreateSchema.parse(body);

    // Pre-check unique fields to return clear 409s before DB insert
    const [existingById, existingByUsername, existingByPhone] = await Promise.all([
      findTeacherByTeacherId(validatedData.teacherId),
      findTeacherByUsername(validatedData.username),
      findTeacherByField('phone' as any, validatedData.phone),
    ]);

    if (existingById) {
      const { response, status } = createUniqueConstraintError('Teacher', 'teacherId');
      return NextResponse.json(response, { status });
    }

    if (existingByUsername) {
      const { response, status } = createUniqueConstraintError('Teacher', 'username');
      return NextResponse.json(response, { status });
    }

    if (existingByPhone) {
      const { response, status } = createUniqueConstraintError('Teacher', 'phone');
      return NextResponse.json(response, { status });
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(validatedData.password);

    // Convert dateOfBirth string to Date if provided
    const dateOfBirth = validatedData.dateOfBirth 
      ? new Date(validatedData.dateOfBirth) 
      : null;

    // Create teacher record using Supabase operations
    const teacher = await createTeacher({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      fatherName: validatedData.fatherName,
      grandFatherName: validatedData.grandFatherName,
      teacherId: validatedData.teacherId,
      dateOfBirth,
      phone: validatedData.phone,
      secondaryPhone: validatedData.secondaryPhone || null,
      address: validatedData.address || '',
      departments: validatedData.departments,
      qualification: validatedData.qualification,
      experience: validatedData.experience,
      specialization: validatedData.specialization,
      subjects: validatedData.subjects,
      classes: validatedData.classes,
      username: validatedData.username,
      password: hashedPassword,
    });

    // Return created teacher data excluding password field
    const { password, ...teacherWithoutPassword } = teacher;

    return NextResponse.json(teacherWithoutPassword, { status: 201 });

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
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while creating the teacher',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const department = searchParams.get('department') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const status = searchParams.get('status') || undefined;

    // Fetch all teachers with filters
    const teachers = await getAllTeachers({
      search,
      department,
      subject,
      status,
    });

    // Remove password field from all teachers
    const teachersWithoutPassword = teachers.map(({ password, ...teacher }) => teacher);

    return NextResponse.json(teachersWithoutPassword, { status: 200 });

  } catch (error) {
    // Handle database errors
    if (error instanceof DatabaseError) {
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while fetching teachers',
      },
      { status: 500 }
    );
  }
}
