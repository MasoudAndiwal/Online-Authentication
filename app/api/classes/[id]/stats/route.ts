import supabase from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: classId } = params

    // Get class information
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('name, session')
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    const classSection = `${classData.name} - ${classData.session}`

    // Get total students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, student_id')
      .eq('class_section', classSection)

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    const totalStudents = students?.length || 0
    const studentIds = students?.map(s => s.id) || []

    // Get attendance records for the current week
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 6 ? 0 : dayOfWeek === 0 ? 1 : dayOfWeek <= 4 ? dayOfWeek + 2 : -3
    
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 5)
    weekEnd.setHours(23, 59, 59, 999)

    // Get attendance records
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('*')
      .eq('class_id', classId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])

    if (attendanceError) {
      console.error('Error fetching attendance:', attendanceError)
    }

    // Calculate statistics
    let totalPresent = 0
    let totalPossible = 0
    const studentAttendance: Record<string, { present: number; total: number }> = {}

    // Initialize student attendance tracking
    studentIds.forEach(studentId => {
      studentAttendance[studentId] = { present: 0, total: 0 }
    })

    // Process attendance records
    attendanceRecords?.forEach(record => {
      const periods = [
        record.period_1_status,
        record.period_2_status,
        record.period_3_status,
        record.period_4_status,
        record.period_5_status,
        record.period_6_status
      ]

      periods.forEach(status => {
        if (status && status !== 'NOT_MARKED') {
          totalPossible++
          if (studentAttendance[record.student_id]) {
            studentAttendance[record.student_id].total++
          }
          
          if (status === 'PRESENT') {
            totalPresent++
            if (studentAttendance[record.student_id]) {
              studentAttendance[record.student_id].present++
            }
          }
        }
      })
    })

    // Calculate average attendance
    const averageAttendance = totalPossible > 0 
      ? Math.round((totalPresent / totalPossible) * 100 * 10) / 10 
      : 0

    // Calculate students at risk (attendance < 75%)
    let studentsAtRisk = 0
    let perfectAttendance = 0

    Object.values(studentAttendance).forEach(({ present, total }) => {
      if (total > 0) {
        const rate = (present / total) * 100
        if (rate < 75) {
          studentsAtRisk++
        }
        if (rate === 100) {
          perfectAttendance++
        }
      }
    })

    return NextResponse.json({
      totalStudents,
      averageAttendance,
      studentsAtRisk,
      perfectAttendance,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching class stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}