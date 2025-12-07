// import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_request: NextRequest) {
  try {
    // Return "Coming Soon" message instead of generating PDF
    return NextResponse.json(
      { 
        message: 'PDF Report Generation - Coming Soon!',
        status: 'feature_not_available',
        description: 'PDF report generation feature is currently under development and will be available soon.',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )

    /* 
    // ===== COMMENTED OUT - PDF GENERATION CODE =====
    // This code will be uncommented when PDF feature is ready
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { classId, dateRange, customStartDate, customEndDate } = body

    if (!classId) {
      console.error('Missing classId')
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      )
    }

    // Determine week dates
    let weekStart: Date
    let weekEnd: Date

    console.log('Processing date range:', dateRange)

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
        console.error('Missing custom dates')
        return NextResponse.json(
          { error: 'Custom date range requires both start and end dates' },
          { status: 400 }
        )
      }
      weekStart = new Date(customStartDate)
      weekEnd = new Date(customEndDate)
    }

    console.log('Date range:', { weekStart, weekEnd })

    // Fetch class information
    console.log('Fetching class info for ID:', classId)
    const { data: classInfo, error: classError } = await supabase
      .from('classes')
      .select('id, name, semester, major, session')
      .eq('id', classId)
      .single()

    if (classError) {
      console.error('Class fetch error:', classError)
      return NextResponse.json(
        { error: 'Class not found: ' + classError.message },
        { status: 404 }
      )
    }

    console.log('Class info:', classInfo)
    const classSection = `${classInfo.name} - ${classInfo.session}`

    // Fetch students
    console.log('Fetching students for section:', classSection)
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, student_id, first_name, last_name, father_name, grandfather_name')
      .eq('class_section', classSection)
      .order('student_id', { ascending: true })

    if (studentsError) {
      console.error('Students fetch error:', studentsError)
      return NextResponse.json(
        { error: 'Failed to fetch students: ' + studentsError.message },
        { status: 500 }
      )
    }

    console.log('Students found:', students?.length || 0)

    // Fetch attendance records
    console.log('Fetching attendance records')
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance_records_new')
      .select('*')
      .eq('class_id', classId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError)
      return NextResponse.json(
        { error: 'Failed to fetch attendance records: ' + attendanceError.message },
        { status: 500 }
      )
    }

    console.log('Attendance records found:', attendanceRecords?.length || 0)

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

    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf')
    
    // Create PDF document
    console.log('Creating PDF document with jsPDF')
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Generate array of all days in the week
    const weekDays: Date[] = []
    for (let i = 0; i < 6; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      weekDays.push(day)
    }

    // Helper function to check day status (same as Excel template)
    function getDayStatus(studentId: string, date: Date, records: typeof attendanceRecords): 'SICK' | 'LEAVE' | 'NORMAL' {
      const dateStr = date.toISOString().split('T')[0]
      const record = records?.find(r => r.student_id === studentId && r.date === dateStr)

      if (!record) return 'NORMAL'

      const periods = [
        record.period_1_status,
        record.period_2_status,
        record.period_3_status,
        record.period_4_status,
        record.period_5_status,
        record.period_6_status
      ]

      // If any period is SICK, the whole day is SICK
      if (periods.some((status: string) => status === 'SICK')) {
        return 'SICK'
      }

      // If any period is LEAVE, the whole day is LEAVE
      if (periods.some((status: string) => status === 'LEAVE')) {
        return 'LEAVE'
      }

      return 'NORMAL'
    }

    // Add content to PDF - Simplified header to avoid RTL issues
    doc.setFontSize(18)
    doc.text('Weekly Attendance Report', 148, 20, { align: 'center' })
    
    // Class information section
    doc.setFontSize(12)
    doc.text(`Class: ${classInfo?.name || 'Unknown'}`, 20, 35)
    doc.text(`Department: ${classInfo?.major || 'Unknown'}`, 150, 35)
    doc.text(`Semester: ${classInfo?.semester || 'Unknown'}`, 20, 45)
    doc.text(`Session: ${classInfo?.session || 'Unknown'}`, 150, 45)
    
    // Date range information
    doc.setFontSize(10)
    doc.text(`From: ${weekStart.toLocaleDateString()} To: ${weekEnd.toLocaleDateString()}`, 20, 55)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 200, 55)

    // Create detailed table with dates and periods like Excel template
    let yPosition = 70
    const lineHeight = 12
    const cellWidth = 8
    
    // Table headers - simplified to avoid RTL issues
    doc.setFontSize(8)
    
    // Student info headers (left to right layout)
    doc.text('No.', 10, yPosition)
    doc.text('Student ID', 25, yPosition)
    doc.text('Name', 50, yPosition)
    doc.text('Father Name', 80, yPosition)
    doc.text('Grandfather', 110, yPosition)
    
    // Date headers for each day
    let xPosition = 140
    const dayNamesEng = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu']
    
    weekDays.forEach((day, index) => {
      const dayDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      // Day header
      doc.setFontSize(7)
      doc.text(dayNamesEng[index], xPosition + (cellWidth * 3), yPosition - 8, { align: 'center' })
      doc.text(dayDate, xPosition + (cellWidth * 3), yPosition - 4, { align: 'center' })
      
      // Period headers (1-6)
      doc.setFontSize(6)
      for (let period = 1; period <= 6; period++) {
        doc.text(period.toString(), xPosition + (period - 1) * cellWidth + 4, yPosition)
      }
      
      xPosition += cellWidth * 6 + 2 // Move to next day
    })
    
    // Summary headers
    doc.setFontSize(8)
    doc.text('Present', xPosition + 5, yPosition)
    doc.text('Absent', xPosition + 20, yPosition)
    doc.text('Sick', xPosition + 35, yPosition)
    doc.text('Leave', xPosition + 50, yPosition)
    doc.text('Total', xPosition + 65, yPosition)

    yPosition += lineHeight + 5

    // Student rows
    if (students && students.length > 0) {
      students.forEach((student, index) => {
        if (yPosition > 180) { // Start new page if needed
          doc.addPage()
          yPosition = 20
          
          // Redraw headers on new page
          doc.setFontSize(8)
          
          // Student info headers
          doc.text('No.', 10, yPosition)
          doc.text('Student ID', 25, yPosition)
          doc.text('Name', 50, yPosition)
          doc.text('Father Name', 80, yPosition)
          doc.text('Grandfather', 110, yPosition)
          
          // Date headers
          let headerX = 140
          weekDays.forEach((day, index) => {
            const dayDate = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            doc.setFontSize(7)
            doc.text(dayNamesEng[index], headerX + (cellWidth * 3), yPosition - 8, { align: 'center' })
            doc.text(dayDate, headerX + (cellWidth * 3), yPosition - 4, { align: 'center' })
            
            doc.setFontSize(6)
            for (let period = 1; period <= 6; period++) {
              doc.text(period.toString(), headerX + (period - 1) * cellWidth + 4, yPosition)
            }
            
            headerX += cellWidth * 6 + 2
          })
          
          // Summary headers
          doc.setFontSize(8)
          doc.text('Present', headerX + 5, yPosition)
          doc.text('Absent', headerX + 20, yPosition)
          doc.text('Sick', headerX + 35, yPosition)
          doc.text('Leave', headerX + 50, yPosition)
          doc.text('Total', headerX + 65, yPosition)
          
          yPosition += lineHeight + 5
        }

        // Student info
        doc.setFontSize(8)
        doc.text((index + 1).toString(), 10, yPosition) // Number
        doc.text(student.student_id || 'N/A', 25, yPosition) // Student ID
        doc.text(student.first_name || 'N/A', 50, yPosition) // Name
        doc.text(student.father_name || 'N/A', 80, yPosition) // Father Name
        doc.text(student.grandfather_name || 'N/A', 110, yPosition) // Grandfather Name

        // Attendance for each day and period
        let attendanceX = 140
        let presentCount = 0
        let absentCount = 0
        let sickCount = 0
        let leaveCount = 0

        weekDays.forEach((day) => {
          // Check if this is a sick or leave day
          const dayStatus = getDayStatus(student.id, day, attendanceRecords)
          
          if (dayStatus === 'SICK') {
            // Show "SICK" across all 6 periods for this day
            doc.setFontSize(7)
            doc.text('SICK', attendanceX + (cellWidth * 3), yPosition, { align: 'center' })
            sickCount += 6
          } else if (dayStatus === 'LEAVE') {
            // Show "LEAVE" across all 6 periods for this day
            doc.setFontSize(7)
            doc.text('LEAVE', attendanceX + (cellWidth * 3), yPosition, { align: 'center' })
            leaveCount += 6
          } else {
            // Normal day - show individual period attendance
            doc.setFontSize(7)
            for (let period = 1; period <= 6; period++) {
              const status = getAttendanceStatus(student.id, day, period)
              const periodX = attendanceX + (period - 1) * cellWidth + 4
              
              if (status === '✓') {
                doc.text('P', periodX, yPosition, { align: 'center' })
                presentCount++
              } else if (status === '✗') {
                doc.text('A', periodX, yPosition, { align: 'center' })
                absentCount++
              } else if (status === '') {
                // Empty cell - no attendance recorded
                doc.text('-', periodX, yPosition, { align: 'center' })
              }
            }
          }
          
          attendanceX += cellWidth * 6 + 2 // Move to next day
        })

        // Summary columns
        doc.setFontSize(8)
        doc.text(presentCount.toString(), attendanceX + 5, yPosition) // Present
        doc.text(absentCount.toString(), attendanceX + 20, yPosition) // Absent
        doc.text(sickCount.toString(), attendanceX + 35, yPosition) // Sick
        doc.text(leaveCount.toString(), attendanceX + 50, yPosition) // Leave
        doc.text((presentCount + absentCount + sickCount + leaveCount).toString(), attendanceX + 65, yPosition) // Total

        yPosition += lineHeight
      })
    } else {
      doc.text('No students found for this class', 20, yPosition)
    }

    // Add summary and signature section
    yPosition += 15
    
    // Summary section
    doc.setFontSize(12)
    doc.text(`Total Students: ${students?.length || 0}`, 20, yPosition)
    
    yPosition += 20
    
    // Signature section
    doc.setLineWidth(1)
    doc.line(20, yPosition, 280, yPosition) // Top border
    
    yPosition += 10
    
    // Teacher signature
    doc.setFontSize(12)
    doc.text('Teacher Signature:', 20, yPosition)
    
    // Report date
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 180, yPosition)
    
    yPosition += 15
    
    // Signature line
    doc.setLineWidth(0.5)
    doc.line(20, yPosition, 120, yPosition) // Signature line
    
    // Additional info
    yPosition += 8
    doc.setFontSize(10)
    doc.text('Teacher Name & Signature', 20, yPosition)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    console.log('PDF generation completed')
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="attendance-report-${classInfo.name}-${weekStart.toISOString().split('T')[0]}.pdf"`
      }
    })
    
    // ===== END OF COMMENTED CODE =====
    */

  } catch {
    return NextResponse.json(
      { 
        message: 'PDF Report Generation - Coming Soon!',
        status: 'feature_not_available',
        error: 'Feature temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  }
}