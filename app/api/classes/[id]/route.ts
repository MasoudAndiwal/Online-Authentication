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

function mapClassRow(cls: DbClassRow, scheduleCount: number, studentCount: number) {
  return {
    id: cls.id,
    name: cls.name,
    session: ((cls.session || 'MORNING') as ClassSession),
    major: cls.major ?? '',
    semester: Number(cls.semester ?? 1),
    studentCount: studentCount || 0, // Dynamic count from students table
    scheduleCount: scheduleCount || 0,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: cls, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!cls) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let entriesCount = 0
    const { data: entries, error: e2 } = await supabase
      .from('schedule_entries')
      .select('id')
      .eq('class_id', id)

    if (!e2 && entries) {
      entriesCount = entries.length
    }

    // Count students assigned to this class
    const classKey = `${cls.name} - ${cls.session || 'MORNING'}`
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('class_section', classKey)
    
    const studentCount = students?.length || 0

    const payload = mapClassRow(cls as DbClassRow, entriesCount, studentCount)
    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, session, major, semester } = body || {}

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (session !== undefined) updateData.session = session
    if (major !== undefined) updateData.major = major
    if (semester !== undefined) updateData.semester = semester

    // Try full update first, fallback if columns missing
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from('classes').update(updateData).eq('id', id)
      if (error && (major !== undefined || semester !== undefined)) {
        const fallback: Record<string, unknown> = {}
        if (name !== undefined) fallback.name = name
        if (session !== undefined) fallback.session = session
        const { error: e2 } = await supabase.from('classes').update(fallback).eq('id', id)
        if (e2) throw e2
      } else if (error) {
        throw error
      }
    }

    // Return updated row
    const { data: cls, error: sErr } = await supabase.from('classes').select('*').eq('id', id).single()
    if (sErr) throw sErr

    const { data: entries } = await supabase.from('schedule_entries').select('id').eq('class_id', id)
    
    // Count students assigned to this class
    const classKey = `${cls.name} - ${cls.session || 'MORNING'}`
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('class_section', classKey)
    
    const studentCount = students?.length || 0
    
    const payload = mapClassRow(cls, entries?.length || 0, studentCount)
    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase.from('classes').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ message: 'Class deleted' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}
