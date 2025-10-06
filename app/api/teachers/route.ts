import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TeacherCreateSchema } from '@/lib/validations/user.validation';
import { hashPassword } from '@/lib/utils/password';
import { Prisma } from '@/app/generated/prisma';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request body using TeacherCreateSchema
    const validatedData = TeacherCreateSchema.parse(body);

    // Hash password before storing
    const hashedPassword = await hashPassword(validatedData.password);

    // Convert dateOfBirth string to Date if provided
    const dateOfBirth = validatedData.dateOfBirth 
      ? new Date(validatedData.dateOfBirth) 
      : null;

    // Create teacher record using Prisma client
    // Note: qualification field is validated but not stored in current schema
    const teacher = await prisma.teacher.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        fatherName: validatedData.fatherName,
        grandFatherName: validatedData.grandFatherName,
        teacherId: validatedData.teacherId,
        dateOfBirth,
        phone: validatedData.phone,
        secondaryPhone: validatedData.secondaryPhone || null,
        address: validatedData.address,
        departments: validatedData.departments,
        experience: validatedData.experience,
        specialization: validatedData.specialization,
        subjects: validatedData.subjects,
        classes: validatedData.classes,
        username: validatedData.username,
        password: hashedPassword,
      },
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

    // Handle Prisma unique constraint violations (409)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        return NextResponse.json(
          {
            error: `A teacher with this ${field} already exists`,
            details: { field, message: 'Duplicate value' },
          },
          { status: 409 }
        );
      }
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
