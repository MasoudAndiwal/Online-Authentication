import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

type ClassSession = 'MORNING' | 'AFTERNOON'

interface DbClassRow {
  id: string
  name: string
  session?: string | null
  major?: string | null
  semester?: number | null
  student_count?: number | null
}

interface DbStudentRow {
  class_section: string
}

interface DbTeacherRow {
  classes: string[] | null
}

/**
 * GET /api/teachers/[id]/classes
 * Returns only the classes that the specified teacher teaches
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Get the teacher's classes array
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .select('classes')
      .eq('id', id)
      .single()

    if (teacherError) {
      console.error('Error fetching teacher:', teacherError)
      console.error('Teacher ID:', id)
      return NextResponse.json(
        { error: 'Teacher not found', details: teacherError.message },
        { status: 404 }
      )
    }

    if (!teacher) {
      console.error('Teacher not found in database:', id)
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    const teacherClasses = (teacher as DbTeacherRow).classes || []
    console.log('Teacher classes:', teacherClasses)

    if (teacherClasses.length === 0) {
      // Teacher has no classes assigned
      console.log('Teacher has no classes assigned')
      return NextResponse.json([], { status: 200 })
    }

    // Fetch all classes from database
    const { data: allClasses, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true })

    if (classError) {
      console.error('Error fetching classes:', classError)
      throw classError
    }

    // Fetch students and count by class_section
    let studentCountByClass: Record<string, number> = {}
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('class_section')

    if (!studentsError && students) {
      studentCountByClass = (students as DbStudentRow[]).reduce((acc, s) => {
        const key = s.class_section || ''
        if (key) {
          acc[key] = (acc[key] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    }

    // Filter classes to only include those the teacher teaches
    // Match by class name (e.g., "AI-401-A" matches if teacher has "AI-401-A" in their classes array)
    const teacherClassList = (allClasses as DbClassRow[] || [])
      .filter((cls) => {
        // Check if any of the teacher's classes match this class name
        // Teacher classes might be stored as "AI-401-A - AFTERNOON" or just "AI-401-A"
        return teacherClasses.some((teacherClass) => {
          const normalizedTeacherClass = teacherClass.trim().toUpperCase()
          const normalizedClassName = cls.name.trim().toUpperCase()
          
          // Match if teacher class contains the class name or vice versa
          return normalizedTeacherClass.includes(normalizedClassName) ||
                 normalizedClassName.includes(normalizedTeacherClass)
        })
      })
      .map((cls) => {
        // Create a key that matches how students are stored (ClassName - Session)
        const classKey = `${cls.name} - ${cls.session || 'MORNING'}`
        
        return {
          id: cls.id,
          name: cls.name,
          session: ((cls.session || 'MORNING') as ClassSession),
          major: cls.major ?? '',
          semester: Number(cls.semester ?? 1),
          studentCount: studentCountByClass[classKey] || 0,
        }
      })

    return NextResponse.json(teacherClassList, { status: 200 })
  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to fetch teacher classes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
