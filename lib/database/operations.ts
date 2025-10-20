/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase'
import {
    Student,
    Teacher,
    Office,
    StudentCreateInput,
    TeacherCreateInput,
    OfficeCreateInput,
    StudentUpdateInput,
    TeacherUpdateInput,
    OfficeUpdateInput,
    StudentStatus,
    TeacherStatus,
    OfficeRole,
    TABLE_NAMES
} from './models'
import {
    handleDatabaseOperation,
    handleCreateError,
    handleUpdateError,
    isRecordNotFoundError,
    DatabaseError,
    PrismaErrorCode
} from './errors'

// Student operations
export async function createStudent(data: StudentCreateInput): Promise<Student> {
    return handleDatabaseOperation(async () => {
        // Transform camelCase input to snake_case for database
        const studentData = {
            first_name: data.firstName,
            last_name: data.lastName,
            father_name: data.fatherName,
            grandfather_name: data.grandFatherName,
            student_id: data.studentId,
            date_of_birth: data.dateOfBirth?.toISOString() || null,
            phone: data.phone,
            father_phone: data.fatherPhone,
            address: data.address,
            programs: data.programs,
            semester: data.semester,
            enrollment_year: data.enrollmentYear,
            class_section: data.classSection,
            time_slot: data.timeSlot,
            username: data.username,
            student_id_ref: data.studentIdRef,
            password: data.password,
            status: data.status || StudentStatus.ACTIVE,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.STUDENTS)
            .insert(studentData)
            .select()
            .single()

        if (error) {
            handleCreateError(error, 'Student')
        }

        return transformStudentFromDb(result)
    })
}

export async function findStudentByField(field: keyof Student, value: any): Promise<Student | null> {
    return handleDatabaseOperation(async () => {
        // Map camelCase field names to snake_case database field names
        const fieldMap: Record<keyof Student, string> = {
            id: 'id',
            firstName: 'first_name',
            lastName: 'last_name',
            fatherName: 'father_name',
            grandFatherName: 'grandfather_name',
            studentId: 'student_id',
            dateOfBirth: 'date_of_birth',
            phone: 'phone',
            fatherPhone: 'father_phone',
            address: 'address',
            programs: 'programs',
            semester: 'semester',
            enrollmentYear: 'enrollment_year',
            classSection: 'class_section',
            timeSlot: 'time_slot',
            username: 'username',
            studentIdRef: 'student_id_ref',
            password: 'password',
            status: 'status',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }

        const dbField = fieldMap[field]

        const { data, error } = await supabase
            .from(TABLE_NAMES.STUDENTS)
            .select('*')
            .eq(dbField, value)
            .single()

        if (error) {
            if (isRecordNotFoundError(error)) {
                return null
            }
            throw error
        }

        return transformStudentFromDb(data)
    })
}

export async function updateStudent(id: string, data: StudentUpdateInput): Promise<Student> {
    return handleDatabaseOperation(async () => {
        // Transform camelCase input to snake_case for database
        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        // Only include fields that are provided
        if (data.firstName !== undefined) updateData.first_name = data.firstName
        if (data.lastName !== undefined) updateData.last_name = data.lastName
        if (data.fatherName !== undefined) updateData.father_name = data.fatherName
        if (data.grandFatherName !== undefined) updateData.grandfather_name = data.grandFatherName
        if (data.studentId !== undefined) updateData.student_id = data.studentId
        if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth?.toISOString() || null
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.fatherPhone !== undefined) updateData.father_phone = data.fatherPhone
        if (data.address !== undefined) updateData.address = data.address
        if (data.programs !== undefined) updateData.programs = data.programs
        if (data.semester !== undefined) updateData.semester = data.semester
        if (data.enrollmentYear !== undefined) updateData.enrollment_year = data.enrollmentYear
        if (data.classSection !== undefined) updateData.class_section = data.classSection
        if (data.timeSlot !== undefined) updateData.time_slot = data.timeSlot
        if (data.username !== undefined) updateData.username = data.username
        if (data.studentIdRef !== undefined) updateData.student_id_ref = data.studentIdRef
        if (data.password !== undefined) updateData.password = data.password
        if (data.status !== undefined) updateData.status = data.status

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.STUDENTS)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            handleUpdateError(error, 'Student')
        }

        if (!result) {
            throw new DatabaseError(
                'Student not found or update failed',
                PrismaErrorCode.RECORD_NOT_FOUND,
                {},
                null
            )
        }

        return transformStudentFromDb(result)
    })
}

// Teacher operations
export async function createTeacher(data: TeacherCreateInput): Promise<Teacher> {
    return handleDatabaseOperation(async () => {
        // Transform camelCase input to snake_case for database
        const teacherData = {
            first_name: data.firstName,
            last_name: data.lastName,
            father_name: data.fatherName,
            grandfather_name: data.grandFatherName,
            teacher_id: data.teacherId,
            date_of_birth: data.dateOfBirth?.toISOString() || null,
            phone: data.phone,
            secondary_phone: data.secondaryPhone || null,
            address: data.address,
            departments: data.departments,
            qualification: data.qualification,
            experience: data.experience,
            specialization: data.specialization,
            subjects: data.subjects,
            classes: data.classes,
            username: data.username,
            password: data.password,
            status: data.status || TeacherStatus.ACTIVE,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.TEACHERS)
            .insert(teacherData)
            .select()
            .single()

        if (error) {
            handleCreateError(error, 'Teacher')
        }

        return transformTeacherFromDb(result)
    })
}

export async function findTeacherByField(field: keyof Teacher, value: any): Promise<Teacher | null> {
    return handleDatabaseOperation(async () => {
        // Map camelCase field names to snake_case database field names
        const fieldMap: Record<keyof Teacher, string> = {
            id: 'id',
            firstName: 'first_name',
            lastName: 'last_name',
            fatherName: 'father_name',
            grandFatherName: 'grandfather_name',
            teacherId: 'teacher_id',
            dateOfBirth: 'date_of_birth',
            phone: 'phone',
            secondaryPhone: 'secondary_phone',
            address: 'address',
            departments: 'departments',
            qualification: 'qualification',
            experience: 'experience',
            specialization: 'specialization',
            subjects: 'subjects',
            classes: 'classes',
            username: 'username',
            password: 'password',
            status: 'status',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }

        const dbField = fieldMap[field]

        const { data, error } = await supabase
            .from(TABLE_NAMES.TEACHERS)
            .select('*')
            .eq(dbField, value)
            .single()

        if (error) {
            if (isRecordNotFoundError(error)) {
                return null
            }
            throw error
        }

        return transformTeacherFromDb(data)
    })
}

export async function updateTeacher(id: string, data: TeacherUpdateInput): Promise<Teacher> {
    return handleDatabaseOperation(async () => {
        // Transform camelCase input to snake_case for database
        const updateData: any = {
            updated_at: new Date().toISOString()
        }

        // Only include fields that are provided
        if (data.firstName !== undefined) updateData.first_name = data.firstName
        if (data.lastName !== undefined) updateData.last_name = data.lastName
        if (data.fatherName !== undefined) updateData.father_name = data.fatherName
        if (data.grandFatherName !== undefined) updateData.grandfather_name = data.grandFatherName
        if (data.teacherId !== undefined) updateData.teacher_id = data.teacherId
        if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth?.toISOString() || null
        if (data.phone !== undefined) updateData.phone = data.phone
        if (data.secondaryPhone !== undefined) updateData.secondary_phone = data.secondaryPhone
        if (data.address !== undefined) updateData.address = data.address
        if (data.departments !== undefined) updateData.departments = data.departments
        if (data.qualification !== undefined) updateData.qualification = data.qualification
        if (data.experience !== undefined) updateData.experience = data.experience
        if (data.specialization !== undefined) updateData.specialization = data.specialization
        if (data.subjects !== undefined) updateData.subjects = data.subjects
        if (data.classes !== undefined) updateData.classes = data.classes
        if (data.username !== undefined) updateData.username = data.username
        if (data.password !== undefined) updateData.password = data.password
        if (data.status !== undefined) updateData.status = data.status

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.TEACHERS)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            handleUpdateError(error, 'Teacher')
        }

        if (!result) {
            throw new DatabaseError(
                'Teacher not found or update failed',
                PrismaErrorCode.RECORD_NOT_FOUND,
                {},
                null
            )
        }

        return transformTeacherFromDb(result)
    })
}

// Office operations
export async function createOffice(data: OfficeCreateInput): Promise<Office> {
    return handleDatabaseOperation(async () => {
        const officeData = {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            username: data.username,
            password: data.password,
            role: data.role || OfficeRole.STAFF,
            supabase_user_id: data.supabaseUserId,
            is_active: data.isActive !== undefined ? data.isActive : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.OFFICE_STAFF)
            .insert(officeData)
            .select()
            .single()

        if (error) {
            handleCreateError(error, 'Office')
        }

        return transformOfficeFromDb(result)
    })
}

export async function findOfficeByField(field: keyof Office, value: any): Promise<Office | null> {
    return handleDatabaseOperation(async () => {
        // Convert camelCase to snake_case for database field names
        const dbField = camelToSnakeCase(field)

        const { data, error } = await supabase
            .from(TABLE_NAMES.OFFICE_STAFF)
            .select('*')
            .eq(dbField, value)
            .single()

        if (error) {
            if (isRecordNotFoundError(error)) {
                return null
            }
            throw error
        }

        return transformOfficeFromDb(data)
    })
}

export async function updateOffice(id: string, data: OfficeUpdateInput): Promise<Office> {
    return handleDatabaseOperation(async () => {
        const updateData = {
            ...data,
            updated_at: new Date().toISOString()
        }

        const { data: result, error } = await supabase
            .from(TABLE_NAMES.OFFICE_STAFF)
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            handleUpdateError(error, 'Office')
        }

        if (!result) {
            throw new DatabaseError(
                'Office staff not found or update failed',
                PrismaErrorCode.RECORD_NOT_FOUND,
                {},
                null
            )
        }

        return transformOfficeFromDb(result)
    })
}

// Utility functions for data transformation
function transformStudentFromDb(dbRecord: any): Student {
    return {
        id: dbRecord.id,
        firstName: dbRecord.first_name,
        lastName: dbRecord.last_name,
        fatherName: dbRecord.father_name,
        grandFatherName: dbRecord.grandfather_name,
        studentId: dbRecord.student_id,
        dateOfBirth: dbRecord.date_of_birth ? new Date(dbRecord.date_of_birth) : null,
        phone: dbRecord.phone,
        fatherPhone: dbRecord.father_phone,
        address: dbRecord.address,
        programs: dbRecord.programs,
        semester: dbRecord.semester,
        enrollmentYear: dbRecord.enrollment_year,
        classSection: dbRecord.class_section,
        timeSlot: dbRecord.time_slot,
        username: dbRecord.username,
        studentIdRef: dbRecord.student_id_ref,
        password: dbRecord.password,
        status: dbRecord.status as StudentStatus,
        createdAt: new Date(dbRecord.created_at),
        updatedAt: new Date(dbRecord.updated_at)
    }
}

function transformTeacherFromDb(dbRecord: any): Teacher {
    return {
        id: dbRecord.id,
        firstName: dbRecord.first_name,
        lastName: dbRecord.last_name,
        fatherName: dbRecord.father_name,
        grandFatherName: dbRecord.grandfather_name,
        teacherId: dbRecord.teacher_id,
        dateOfBirth: dbRecord.date_of_birth ? new Date(dbRecord.date_of_birth) : null,
        phone: dbRecord.phone,
        secondaryPhone: dbRecord.secondary_phone,
        address: dbRecord.address,
        departments: dbRecord.departments,
        qualification: dbRecord.qualification,
        experience: dbRecord.experience,
        specialization: dbRecord.specialization,
        subjects: dbRecord.subjects,
        classes: dbRecord.classes,
        username: dbRecord.username,
        password: dbRecord.password,
        status: dbRecord.status as TeacherStatus,
        createdAt: new Date(dbRecord.created_at),
        updatedAt: new Date(dbRecord.updated_at)
    }
}

function transformOfficeFromDb(dbRecord: any): Office {
    return {
        id: dbRecord.id,
        firstName: dbRecord.first_name,
        lastName: dbRecord.last_name,
        email: dbRecord.email,
        phone: dbRecord.phone,
        username: dbRecord.username,
        password: dbRecord.password,
        role: dbRecord.role as OfficeRole,
        supabaseUserId: dbRecord.supabase_user_id,
        isActive: dbRecord.is_active,
        createdAt: new Date(dbRecord.created_at),
        updatedAt: new Date(dbRecord.updated_at)
    }
}

// Helper function to convert camelCase to snake_case
function camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// Additional utility functions for common queries
export async function findStudentById(id: string): Promise<Student | null> {
    return findStudentByField('id', id)
}

export async function findStudentByUsername(username: string): Promise<Student | null> {
    return findStudentByField('username', username)
}

export async function findStudentByStudentId(studentId: string): Promise<Student | null> {
    return findStudentByField('studentId', studentId)
}

export async function findTeacherById(id: string): Promise<Teacher | null> {
    return findTeacherByField('id', id)
}

export async function findTeacherByUsername(username: string): Promise<Teacher | null> {
    return findTeacherByField('username', username)
}

export async function findTeacherByTeacherId(teacherId: string): Promise<Teacher | null> {
    return findTeacherByField('teacherId', teacherId)
}

export async function findOfficeById(id: string): Promise<Office | null> {
    return findOfficeByField('id', id)
}

export async function findOfficeByEmail(email: string): Promise<Office | null> {
    return findOfficeByField('email', email)
}

export async function findOfficeBySupabaseUserId(supabaseUserId: string): Promise<Office | null> {
    return findOfficeByField('supabaseUserId', supabaseUserId)
}

export async function findOfficeByUsername(username: string): Promise<Office | null> {
    return findOfficeByField('username', username)
}

// Get all students with optional filters
export async function getAllStudents(filters?: {
    search?: string;
    program?: string;
    classSection?: string;
    status?: string;
}): Promise<Student[]> {
    return handleDatabaseOperation(async () => {
        let query = supabase
            .from(TABLE_NAMES.STUDENTS)
            .select('*')
            .order('created_at', { ascending: false })

        // Apply search filter (searches across multiple fields)
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`
            query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},student_id.ilike.${searchTerm},programs.ilike.${searchTerm}`)
        }

        // Apply program filter
        if (filters?.program) {
            query = query.ilike('programs', `%${filters.program}%`)
        }

        // Apply class section filter
        if (filters?.classSection) {
            query = query.eq('class_section', filters.classSection)
        }

        // Apply status filter
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return (data || []).map(transformStudentFromDb)
    })
}

// Get all teachers with optional filters
export async function getAllTeachers(filters?: {
    search?: string;
    department?: string;
    subject?: string;
    status?: string;
}): Promise<Teacher[]> {
    return handleDatabaseOperation(async () => {
        let query = supabase
            .from(TABLE_NAMES.TEACHERS)
            .select('*')
            .order('created_at', { ascending: false })

        // Apply search filter (searches across multiple fields)
        if (filters?.search) {
            const searchTerm = `%${filters.search}%`
            query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},teacher_id.ilike.${searchTerm},departments.ilike.${searchTerm},subjects.ilike.${searchTerm}`)
        }

        // Apply department filter
        if (filters?.department) {
            query = query.ilike('departments', `%${filters.department}%`)
        }

        // Apply subject filter
        if (filters?.subject) {
            query = query.ilike('subjects', `%${filters.subject}%`)
        }

        // Apply status filter
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }

        const { data, error } = await query

        if (error) {
            throw error
        }

        return (data || []).map(transformTeacherFromDb)
    })
}

// Delete teacher by ID
export async function deleteTeacher(id: string): Promise<void> {
    return handleDatabaseOperation(async () => {
        const { error } = await supabase
            .from(TABLE_NAMES.TEACHERS)
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }
    })
}

// Delete student by ID
export async function deleteStudent(id: string): Promise<void> {
    return handleDatabaseOperation(async () => {
        const { error } = await supabase
            .from(TABLE_NAMES.STUDENTS)
            .delete()
            .eq('id', id)

        if (error) {
            throw error
        }
    })
}