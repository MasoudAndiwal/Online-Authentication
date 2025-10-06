import { z } from 'zod';

// Student validation schema
export const StudentCreateSchema = z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    fatherName: z.string().min(1, 'Father name is required').trim(),
    grandFatherName: z.string().min(1, 'Grandfather name is required').trim(),
    studentId: z.string().min(1, 'Student ID is required').trim(),
    dateOfBirth: z.string().optional().nullable(),
    phone: z.string().min(1, 'Phone number is required').trim(),
    fatherPhone: z.string().min(1, 'Father phone number is required').trim(),
    address: z.string().min(1, 'Address is required').trim(),
    programs: z.array(z.string()).min(1, 'At least one program is required'),
    semester: z.string().min(1, 'Semester is required').trim(),
    enrollmentYear: z.string().min(1, 'Enrollment year is required').trim(),
    classSection: z.string().min(1, 'Class section is required').trim(),
    timeSlot: z.string().min(1, 'Time slot is required').trim(),
    username: z.string().min(1, 'Username is required').trim(),
    studentIdRef: z.string().min(1, 'Student ID reference is required').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Teacher validation schema
export const TeacherCreateSchema = z.object({
    firstName: z.string().min(1, 'First name is required').trim(),
    lastName: z.string().min(1, 'Last name is required').trim(),
    fatherName: z.string().min(1, 'Father name is required').trim(),
    grandFatherName: z.string().min(1, 'Grandfather name is required').trim(),
    teacherId: z.string().min(1, 'Teacher ID is required').trim(),
    dateOfBirth: z.string().optional().nullable(),
    phone: z.string().min(1, 'Phone number is required').trim(),
    secondaryPhone: z.string().optional().nullable(),
    address: z.string().min(1, 'Address is required').trim(),
    departments: z.array(z.string()).min(1, 'At least one department is required'),
    qualification: z.string().min(1, 'Qualification is required').trim(),
    experience: z.string().min(1, 'Experience is required').trim(),
    specialization: z.string().min(1, 'Specialization is required').trim(),
    subjects: z.array(z.string()).min(1, 'At least one subject is required'),
    classes: z.array(z.string()).min(1, 'At least one class is required'),
    username: z.string().min(1, 'Username is required').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Export types for TypeScript
export type StudentCreateInput = z.infer<typeof StudentCreateSchema>;
export type TeacherCreateInput = z.infer<typeof TeacherCreateSchema>;
