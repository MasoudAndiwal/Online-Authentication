import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

type ClassSession = 'MORNING' | 'AFTERNOON'
type DbClassRow = {
  id: string
  name: string
  session?: string | null
  major?: string | null
  semester?: number | null
  student_count?: number | null
}
type DbEntryRow = { class_id: string }
type DbStudentRow = { class_section: string }
type DbTeacherRow = { classes: string[] | null }

function mapClassRow(
  cls: DbClassRow, 
  scheduleCountByClass: Record<string, number>,
  studentCountByClass: Record<string, number>,
  teacherCountByClass: Record<string, number>
) {
  // Create a key that matches how students/teachers are stored (ClassName - Session)
  const classKey = `${cls.name} - ${cls.session || 'MORNING'}`
  
  return {
    id: cls.id,
    name: cls.name,
    session: ((cls.session || 'MORNING') as ClassSession),
    major: cls.major ?? '',
    semester: Number(cls.semester ?? 1),
    studentCount: studentCountByClass[classKey] || 0, // Dynamic count from students table
    teacherCount: teacherCountByClass[classKey] || 0, // Dynamic count from teachers table
    scheduleCount: scheduleCountByClass[cls.id] || 0,
  }
}

export async function GET() {
  try {
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true })

    if (classError) throw classError

    const classIds = (classes as DbClassRow[] | null || []).map((c) => c.id)

    // Fetch schedule entries count
    let scheduleCountByClass: Record<string, number> = {}
    if (classIds.length > 0) {
      const { data: entries, error: entriesError } = await supabase
        .from('schedule_entries')
        .select('class_id')

      if (!entriesError && entries) {
        scheduleCountByClass = (entries as DbEntryRow[]).reduce((acc, e) => {
          const key: string = e.class_id
          acc[key] = (acc[key] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
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

    // Fetch teachers and count by classes array
    let teacherCountByClass: Record<string, number> = {}
    const { data: teachers, error: teachersError } = await supabase
      .from('teachers')
      .select('classes')

    if (!teachersError && teachers) {
      teacherCountByClass = (teachers as DbTeacherRow[]).reduce((acc, t) => {
        const classesArray = t.classes || []
        classesArray.forEach((className) => {
          acc[className] = (acc[className] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>)
    }

    const payload = (classes as DbClassRow[] | null || []).map((cls) => 
      mapClassRow(cls, scheduleCountByClass, studentCountByClass, teacherCountByClass)
    )
    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, session, major, semester } = body || {}

    if (!name || !session) {
      return NextResponse.json({ error: 'name and session are required' }, { status: 400 })
    }

    let inserted: DbClassRow | null = null

    const tryFullInsert = await supabase
      .from('classes')
      .insert({ name, session, major, semester })
      .select('*')
      .single()

    if (tryFullInsert.error) {
      const tryMinimalInsert = await supabase
        .from('classes')
        .insert({ name, session })
        .select('*')
        .single()
      if (tryMinimalInsert.error) {
        throw tryMinimalInsert.error
      }
      inserted = tryMinimalInsert.data as DbClassRow
    } else {
      inserted = tryFullInsert.data as DbClassRow
    }

    // For newly created class, counts are 0
    const payload = mapClassRow(inserted, {}, {}, {})
    return NextResponse.json(payload, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
