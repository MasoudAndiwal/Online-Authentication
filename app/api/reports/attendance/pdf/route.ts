import supabase from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, dateRange, customStartDate, customEndDate } = body

    // Determine week dates
    let weekStart: Date
    let weekEnd: Date
    const weekDays: Date[] = []

    if (dateRange === 'current-week') {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 6 ? 0 : dayOfWeek === 0 ? 1 : dayOfWeek <= 4 ? dayOfWeek + 2 : -3
      
      weekStart = new Date(today)
      weekStart.setDate(today.getDate() - diff)
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 5)
      weekEnd.setHours(23, 59, 59, 999)
    } else if (dateRange === 'last-week') {
      const today = new Date()
      const lastWeekDate = new Date(today)
      lastWeekDate.setDate(today.getDate() - 7)
      const dayOfWeek = lastWeekDate.getDay()
      const diff = dayOfWeek === 6 ? 0 : dayOfWeek === 0 ? 1 : dayOfWeek <= 4 ? dayOfWeek + 2 : -3
      
      weekStart = new Date(lastWeekDate)
      weekStart.setDate(lastWeekDate.getDate() - diff)
      weekStart.setHours(0, 0, 0, 0)
      
      weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 5)
      weekEnd.setHours(23, 59, 59, 999)
    } else {
      if (!customStartDate || !customEndDate) {
        return NextResponse.json(
          { error: 'Custom date range requires both start and end dates' },
          { status: 400 }
        )
      }
      weekStart = new Date(customStartDate)
      weekEnd = new Date(customEndDate)
    }

    // Generate array of all days in the week
    for (let i = 0; i < 6; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      weekDays.push(day)
    }

    // Fetch class information
    const { data: classInfo, error: classError } = await supabase
      .from('classes')
      .select('id, name, semester, major, session')
      .eq('id', classId)
      .single()

    if (classError) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    const classSection = `${classInfo.name} - ${classInfo.session}`

    // Fetch students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, student_id, first_name, last_name, father_name, grandfather_name')
      .eq('class_section', classSection)
      .order('student_id', { ascending: true })

    if (studentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: 500 }
      )
    }

    // Fetch attendance records
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('*')
      .eq('class_id', classId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError)
    }

    // Helper function to get attendance status
    function getAttendanceStatus(studentId: string, date: Date, period: number): string {
      const dateStr = date.toISOString().split('T')[0]
      const record = attendanceRecords?.find(
        r => r.student_id === studentId && r.date === dateStr
      )

      if (!record) return ''

      const statusKey = `period_${period}_status` as keyof typeof record
      const status = record[statusKey] as string

      if (status === 'PRESENT') return '✓'
      if (status === 'ABSENT') return '✗'
      if (status === 'SICK') return 'مریض'
      if (status === 'LEAVE') return 'رخصت'
      
      return ''
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })

    // Set up response headers
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        
        const response = new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="attendance-report-${classInfo.name}-${weekStart.toISOString().split('T')[0]}.pdf"`
          }
        })
        
        resolve(response)
      })

      // Add content to PDF
      doc.fontSize(16).text('Weekly Attendance Report', { align: 'center' })
      doc.moveDown()
      
      doc.fontSize(12)
      doc.text(`Class: ${classInfo.name} - ${classInfo.session}`)
      doc.text(`Period: ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`)
      doc.moveDown()

      // Create table headers
      const startX = 50
      let currentY = doc.y
      const rowHeight = 25
      const colWidth = 60

      // Headers
      doc.fontSize(10)
      doc.text('No.', startX, currentY, { width: colWidth, align: 'center' })
      doc.text('Student ID', startX + colWidth, currentY, { width: colWidth, align: 'center' })
      doc.text('Name', startX + colWidth * 2, currentY, { width: colWidth * 2, align: 'center' })
      
      // Date headers
      weekDays.forEach((day, index) => {
        const x = startX + colWidth * 4 + (index * colWidth)
        doc.text(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), x, currentY, { width: colWidth, align: 'center' })
      })

      doc.text('Total', startX + colWidth * 10, currentY, { width: colWidth, align: 'center' })

      currentY += rowHeight

      // Student rows
      students?.forEach((student, index) => {
        if (currentY > 500) { // Start new page if needed
          doc.addPage()
          currentY = 50
        }

        // Student info
        doc.text((index + 1).toString(), startX, currentY, { width: colWidth, align: 'center' })
        doc.text(student.student_id, startX + colWidth, currentY, { width: colWidth, align: 'center' })
        doc.text(`${student.first_name} ${student.father_name}`, startX + colWidth * 2, currentY, { width: colWidth * 2, align: 'center' })

        // Attendance for each day
        let totalPresent = 0
        weekDays.forEach((day, dayIndex) => {
          const x = startX + colWidth * 4 + (dayIndex * colWidth)
          let dayPresent = 0
          
          // Check all 6 periods for this day
          for (let period = 1; period <= 6; period++) {
            const status = getAttendanceStatus(student.id, day, period)
            if (status === '✓') dayPresent++
          }
          
          totalPresent += dayPresent
          doc.text(dayPresent.toString(), x, currentY, { width: colWidth, align: 'center' })
        })

        doc.text(totalPresent.toString(), startX + colWidth * 10, currentY, { width: colWidth, align: 'center' })
        currentY += rowHeight
      })

      // Add summary
      doc.moveDown()
      doc.fontSize(12)
      doc.text(`Total Students: ${students?.length || 0}`)
      doc.text(`Report Generated: ${new Date().toLocaleString()}`)

      doc.end()
    })

  } catch (error) {
    console.error('Error generating PDF report:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}