import { z } from 'zod';

// Common validation patterns
const namePattern = /^[A-Za-z\s]+$/;
const numbersOnlyPattern = /^\d+$/;
const phonePattern = /^\d{10}$/;
const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
const yearPattern = /^\d{4}$/;
const alphanumericPattern = /^[A-Za-z0-9\s]+$/;
const usernamePattern = /^[A-Za-z]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,12}$/;

// Student validation schema
export const StudentCreateSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(30, 'First name must be 30 characters or less')
        .regex(namePattern, 'First name must contain only letters')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(30, 'Last name must be 30 characters or less')
        .regex(namePattern, 'Last name must contain only letters')
        .trim(),
    fatherName: z.string()
        .min(1, 'Father name is required')
        .max(30, 'Father name must be 30 characters or less')
        .regex(namePattern, 'Father name must contain only letters')
        .trim(),
    grandFatherName: z.string()
        .min(1, 'Grandfather name is required')
        .max(30, 'Grandfather name must be 30 characters or less')
        .regex(namePattern, 'Grandfather name must contain only letters')
        .trim(),
    studentId: z.string()
        .min(4, 'Student ID must be at least 4 digits')
        .max(10, 'Student ID must be 10 digits or less')
        .regex(numbersOnlyPattern, 'Student ID must contain only numbers')
        .trim(),
    dateOfBirth: z.string()
        .regex(datePattern, 'Date must be in YYYY/MM/DD format')
        .optional()
        .nullable()
        .or(z.literal('')),
    phone: z.string()
        .regex(phonePattern, 'Phone number must be exactly 10 digits')
        .trim(),
    fatherPhone: z.string()
        .regex(phonePattern, 'Father phone number must be exactly 10 digits')
        .trim(),
    address: z.string()
        .regex(alphanumericPattern, 'Address must contain only letters and numbers')
        .optional()
        .or(z.literal('')),
    programs: z.array(z.string()).min(1, 'At least one program is required'),
    semester: z.string()
        .min(1, 'Current semester is required')
        .max(4, 'Semester must be 4 characters or less')
        .regex(numbersOnlyPattern, 'Semester must contain only numbers')
        .trim(),
    enrollmentYear: z.string()
        .regex(yearPattern, 'Enrollment year must be in YYYY format')
        .trim(),
    classSection: z.string().min(1, 'Class section is required').trim(),
    timeSlot: z.string().min(1, 'Time slot is required').trim(),
    username: z.string()
        .min(1, 'Username is required')
        .regex(usernamePattern, 'Username must contain only letters')
        .trim(),
    studentIdRef: z.string().min(1, 'Student ID reference is required').trim(),
    password: z.string()
        .min(6, 'Password must be 6-12 characters')
        .max(12, 'Password must be 6-12 characters')
        .regex(passwordPattern, 'Password must include uppercase, lowercase, and number'),
});

// Teacher validation schema
export const TeacherCreateSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(30, 'First name must be 30 characters or less')
        .regex(namePattern, 'First name must contain only letters')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(30, 'Last name must be 30 characters or less')
        .regex(namePattern, 'Last name must contain only letters')
        .trim(),
    fatherName: z.string()
        .min(1, 'Father name is required')
        .max(30, 'Father name must be 30 characters or less')
        .regex(namePattern, 'Father name must contain only letters')
        .trim(),
    grandFatherName: z.string()
        .min(1, 'Grandfather name is required')
        .max(30, 'Grandfather name must be 30 characters or less')
        .regex(namePattern, 'Grandfather name must contain only letters')
        .trim(),
    teacherId: z.string()
        .min(4, 'Teacher ID must be at least 4 digits')
        .max(10, 'Teacher ID must be 10 digits or less')
        .regex(numbersOnlyPattern, 'Teacher ID must contain only numbers')
        .trim(),
    dateOfBirth: z.string()
        .regex(datePattern, 'Date must be in YYYY/MM/DD format')
        .optional()
        .nullable()
        .or(z.literal('')),
    phone: z.string()
        .regex(phonePattern, 'Phone number must be exactly 10 digits')
        .trim(),
    secondaryPhone: z.string()
        .regex(phonePattern, 'Secondary phone number must be exactly 10 digits')
        .optional()
        .or(z.literal('')),
    address: z.string()
        .regex(alphanumericPattern, 'Address must contain only letters and numbers')
        .optional()
        .or(z.literal('')),
    departments: z.array(z.string()).min(1, 'At least one department is required'),
    qualification: z.string().min(1, 'Qualification is required').trim(),
    experience: z.string()
        .regex(numbersOnlyPattern, 'Experience must contain only numbers')
        .min(1, 'Experience is required')
        .trim(),
    specialization: z.string()
        .regex(alphanumericPattern, 'Specialization must contain only letters and numbers')
        .min(1, 'Specialization is required')
        .trim(),
    subjects: z.array(z.string()).min(1, 'At least one subject is required'),
    classes: z.array(z.string()).min(1, 'At least one class is required'),
    employmentType: z.string().min(1, 'Employment type is required').trim(),
    username: z.string()
        .min(1, 'Username is required')
        .regex(usernamePattern, 'Username must contain only letters')
        .trim(),
    password: z.string()
        .min(6, 'Password must be 6-12 characters')
        .max(12, 'Password must be 6-12 characters')
        .regex(passwordPattern, 'Password must include uppercase, lowercase, and number'),
});

// Export types for TypeScript
export type StudentCreateInput = z.infer<typeof StudentCreateSchema>;
export type TeacherCreateInput = z.infer<typeof TeacherCreateSchema>;
