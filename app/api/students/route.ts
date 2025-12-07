import { NextRequest, NextResponse } from 'next/server';
import { createStudent, findStudentByStudentId, findStudentByUsername, findStudentByField, getAllStudents } from '@/lib/database/operations';
import { StudentCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { DatabaseError, handleApiError, createUniqueConstraintError } from '@/lib/database/errors';
import { ZodError, ZodIssue } from 'zod';
import type { Student } from '@/lib/database/models';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body using StudentCreateSchema
    const validatedData = StudentCreateSchema.parse(body);

    // Pre-check unique fields (studentId, username, phone) to return clear 409s before DB insert
    const [existingById, existingByUsername, existingByPhone] = await Promise.all([
      findStudentByStudentId(validatedData.studentId),
      findStudentByUsername(validatedData.username),
      findStudentByField('phone' as keyof Student, validatedData.phone),
    ]);

    if (existingById) {
      const { response, status } = createUniqueConstraintError('Student', 'studentId');
      return NextResponse.json(response, { status });
    }

    if (existingByUsername) {
      const { response, status } = createUniqueConstraintError('Student', 'username');
      return NextResponse.json(response, { status });
    }

    if (existingByPhone) {
      const { response, status } = createUniqueConstraintError('Student', 'phone');
      return NextResponse.json(response, { status });
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(validatedData.password);

    // Convert dateOfBirth string to Date if provided
    const dateOfBirth = validatedData.dateOfBirth
      ? new Date(validatedData.dateOfBirth)
      : null;

    // Convert programs array to comma-separated string for DB model
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
      status: validatedData.status || 'ACTIVE',
    });

    // Return created student data excluding password field
    const { password: _password, ...studentWithoutPassword } = student;
    void _password;

    return NextResponse.json(studentWithoutPassword, { status: 201 });

  } catch (error) {
    // Handle validation errors (400)
    if (error instanceof ZodError) {
      console.error('Zod Validation Error:', JSON.stringify(error.issues, null, 2));
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle database errors using Supabase error mapping
    if (error instanceof DatabaseError) {
      console.error('Database Error:', {
        code: error.code,
        message: error.message,
        meta: error.meta,
        originalError: error.originalError
      });
      const { response, status } = handleApiError(error);
      return NextResponse.json(response, { status });
    }

    // Handle server errors (500)
    console.error('Unexpected Error creating student:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while creating the student',
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
    const program = searchParams.get('program') || undefined;
    const classSection = searchParams.get('classSection') || undefined;
    const status = searchParams.get('status') || undefined;

    // Check Supabase connection
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        {
          error: 'Database configuration error. Please contact administrator.',
          details: 'Missing Supabase credentials'
        },
        { status: 500 }
      );
    }

    // Fetch all students with filters
    const students = await getAllStudents({
      search,
      program,
      classSection,
      status,
    });

    // Remove password field from all students
    const studentsWithoutPassword = students.map(({ password: _p, ...student }) => {
      void _p;
      return student;
    });

    return NextResponse.json(studentsWithoutPassword, { status: 200 });

  } catch (error) {
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
    console.error('Error fetching students:', error);
    // Error details omitted in production
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while fetching students'
      },
      { status: 500 }
    );
  }
}
