/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { createStudent, findStudentByStudentId, findStudentByUsername, findStudentByField, getAllStudents } from '@/lib/database/operations';
import { StudentCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { DatabaseError, handleApiError, createUniqueConstraintError } from '@/lib/database/errors';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/students called ===');
  try {
    // Parse request body
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    // Validate request body using StudentCreateSchema
    const validatedData = StudentCreateSchema.parse(body);
    console.log('Validation passed');

    // Pre-check unique fields (studentId, username, phone) to return clear 409s before DB insert
    const [existingById, existingByUsername, existingByPhone] = await Promise.all([
      findStudentByStudentId(validatedData.studentId),
      findStudentByUsername(validatedData.username),
      findStudentByField('phone' as any, validatedData.phone),
    ]);
    console.log('Unique checks completed');

    if (existingById) {
      console.log('Student ID already exists');
      const { response, status } = createUniqueConstraintError('Student', 'studentId');
      return NextResponse.json(response, { status });
    }

    if (existingByUsername) {
      console.log('Username already exists');
      const { response, status } = createUniqueConstraintError('Student', 'username');
      return NextResponse.json(response, { status });
    }

    if (existingByPhone) {
      console.log('Phone already exists');
      const { response, status } = createUniqueConstraintError('Student', 'phone');
      return NextResponse.json(response, { status });
    }

    // Hash password before storing
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(validatedData.password);
    console.log('Password hashed successfully');

    // Convert dateOfBirth string to Date if provided
    const dateOfBirth = validatedData.dateOfBirth
      ? new Date(validatedData.dateOfBirth)
      : null;
    console.log('Date of birth processed:', dateOfBirth);

    // Convert programs array to comma-separated string for DB model
    const programsString = validatedData.programs.join(', ');
    console.log('Programs string:', programsString);

    // Create student record using Supabase operations
    console.log('Creating student in database...');
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
    console.log('Student created successfully');

    // Return created student data excluding password field
    const { password, ...studentWithoutPassword } = student;

    return NextResponse.json(studentWithoutPassword, { status: 201 });

  } catch (error) {
    // Handle validation errors (400)
    if (error instanceof ZodError) {
      console.error('Zod Validation Error:', JSON.stringify(error.issues, null, 2));
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
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
      error: error
    });
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while creating the student',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET /api/students called ===');
  try {
    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const program = searchParams.get('program') || undefined;
    const classSection = searchParams.get('classSection') || undefined;
    const status = searchParams.get('status') || undefined;

    console.log('Filters:', { search, program, classSection, status });

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

    console.log('Supabase URL configured:', !!supabaseUrl);
    console.log('Fetching students from database...');

    // Fetch all students with filters
    const students = await getAllStudents({
      search,
      program,
      classSection,
      status,
    });

    console.log(`Successfully fetched ${students.length} students`);

    // Remove password field from all students
    const studentsWithoutPassword = students.map(({ password, ...student }) => student);

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
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack,
    });
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred while fetching students',
        details: (error as any)?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
