// Enum types matching Prisma schema
export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  SICK = 'SICK'
}

export enum TeacherStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum OfficeRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER'
}

// Student model interface
export interface Student {
  id: string
  firstName: string
  lastName: string
  fatherName: string
  grandFatherName: string
  studentId: string
  dateOfBirth: Date | null
  phone: string
  fatherPhone: string
  address: string
  programs: string
  semester: string
  enrollmentYear: string
  classSection: string
  timeSlot: string
  username: string
  studentIdRef: string
  password: string
  status: StudentStatus
  createdAt: Date
  updatedAt: Date
}

// Teacher model interface
export interface Teacher {
  id: string
  firstName: string
  lastName: string
  fatherName: string
  grandFatherName: string
  teacherId: string
  dateOfBirth: Date | null
  phone: string
  secondaryPhone: string | null
  address: string
  departments: string[]
  qualification: string
  experience: string
  specialization: string
  subjects: string[]
  classes: string[]
  username: string
  password: string
  status: TeacherStatus
  createdAt: Date
  updatedAt: Date
}

// Office model interface
export interface Office {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: OfficeRole
  supabaseUserId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Input types for creating records (without auto-generated fields)
export interface StudentCreateInput {
  firstName: string
  lastName: string
  fatherName: string
  grandFatherName: string
  studentId: string
  dateOfBirth?: Date | null
  phone: string
  fatherPhone: string
  address: string
  programs: string
  semester: string
  enrollmentYear: string
  classSection: string
  timeSlot: string
  username: string
  studentIdRef: string
  password: string
  status?: StudentStatus
}

export interface TeacherCreateInput {
  firstName: string
  lastName: string
  fatherName: string
  grandFatherName: string
  teacherId: string
  dateOfBirth?: Date | null
  phone: string
  secondaryPhone?: string | null
  address: string
  departments: string[]
  qualification: string
  experience: string
  specialization: string
  subjects: string[]
  classes: string[]
  username: string
  password: string
  status?: TeacherStatus
}

export interface OfficeCreateInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  role?: OfficeRole
  supabaseUserId: string
  isActive?: boolean
}

// Update types for modifying records
export interface StudentUpdateInput {
  firstName?: string
  lastName?: string
  fatherName?: string
  grandFatherName?: string
  studentId?: string
  dateOfBirth?: Date | null
  phone?: string
  fatherPhone?: string
  address?: string
  programs?: string
  semester?: string
  enrollmentYear?: string
  classSection?: string
  timeSlot?: string
  username?: string
  studentIdRef?: string
  password?: string
  status?: StudentStatus
}

export interface TeacherUpdateInput {
  firstName?: string
  lastName?: string
  fatherName?: string
  grandFatherName?: string
  teacherId?: string
  dateOfBirth?: Date | null
  phone?: string
  secondaryPhone?: string | null
  address?: string
  departments?: string[]
  qualification?: string
  experience?: string
  specialization?: string
  subjects?: string[]
  classes?: string[]
  username?: string
  password?: string
  status?: TeacherStatus
}

export interface OfficeUpdateInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  role?: OfficeRole
  supabaseUserId?: string
  isActive?: boolean
}

// Database table names (matching Prisma schema @map directives)
export const TABLE_NAMES = {
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  OFFICE_STAFF: 'office_staff'
} as const