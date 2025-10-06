import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { Prisma } from '@/app/generated/prisma';
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

    // Convert studentId to number
    const studentIdNumber = parseInt(validatedData.studentId, 10);
    if (isNaN(studentIdNumber)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: [{ field: 'studentId', message: 'Student ID must be a valid number' }],
        },
        { status: 400 }
      );
    }

    // Convert programs array to comma-separated string
    const programsString = validatedData.programs.join(', ');

    // Create student record using Prisma client
    const student = await prisma.student.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        fatherName: validatedData.fatherName,
        grandFatherName: validatedData.grandFatherName,
        studentId: studentIdNumber,
        dateOfBirth,
        phone: validatedData.phone,
        fatherPhone: validatedData.fatherPhone,
        address: validatedData.address,
        programs: programsString,
        CurrentSemester: validatedData.semester,
        enrollmentYear: validatedData.enrollmentYear,
        classSection: validatedData.classSection,
        timeSlot: validatedData.timeSlot,
        username: validatedData.username,
        studentIdRef: validatedData.studentIdRef,
        password: hashedPassword,
      },
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

    // Handle Prisma unique constraint violations (409)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        return NextResponse.json(
          {
            error: `A student with this ${field} already exists`,
            details: { field, message: 'Duplicate value' },
          },
          { status: 409 }
        );
      }
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
