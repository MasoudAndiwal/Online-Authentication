import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Import PDFKit at the top level
const PDFDocument = require('pdfkit')

export async function POST(request: NextRequest) {
  try {
    console.log('PDF generation started')
    
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
    const weekDays: Date[] = []

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

    // Generate array of all days in the week
    for (let i = 0; i < 6; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      weekDays.push(day)
    }

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

    // Create PDF document
    console.log('Creating PDF document')
    
    // Create PDF document
    console.log('Creating PDF document')
    console.log('PDFDocument type:', typeof PDFDocument)
    
    if (typeof PDFDocument !== 'function') {
      console.error('PDFDocument is not a function, it is:', typeof PDFDocument)
      return NextResponse.json(
        { error: 'PDFDocument is not a constructor. Type: ' + typeof PDFDocument },
        { status: 500 }
      )
    }
    
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })
    console.log('PDF document created successfully')

    // Set up response headers
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve, reject) => {
      doc.on('end', () => {
        try {
          console.log('PDF generation completed')
          const pdfBuffer = Buffer.concat(chunks)
          
          const response = new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="attendance-report-${classInfo.name}-${weekStart.toISOString().split('T')[0]}.pdf"`
            }
          })
          
          resolve(response)
        } catch (error) {
          console.error('Error creating PDF response:', error)
          reject(error)
        }
      })

      doc.on('error', (error) => {
        console.error('PDF document error:', error)
        reject(error)
      })

      try {
        console.log('Adding content to PDF')
        
        // Add simple content to PDF first
        doc.fontSize(16)
        doc.text('Weekly Attendance Report', 100, 100)
        doc.moveDown()
        
        doc.fontSize(12)
        doc.text(`Class: ${classInfo?.name || 'Unknown'} - ${classInfo?.session || 'Unknown'}`)
        doc.text(`Period: ${weekStart.toLocaleDateString()} to ${weekEnd.toLocaleDateString()}`)
        doc.text(`Generated: ${new Date().toLocaleDateString()}`)
        doc.moveDown()

        // Simple table approach
        const startX = 50
        let currentY = doc.y + 20
        const rowHeight = 20
        const colWidth = 80

        // Headers
        doc.fontSize(10)
        doc.text('No.', startX, currentY)
        doc.text('Student ID', startX + colWidth, currentY)
        doc.text('Name', startX + colWidth * 2, currentY)
        doc.text('Total Present', startX + colWidth * 3, currentY)

        currentY += rowHeight

        // Student rows - simplified
        if (students && students.length > 0) {
          students.forEach((student, index) => {
            if (currentY > 700) { // Start new page if needed
              doc.addPage()
              currentY = 50
            }

            // Student info - simplified
            doc.text((index + 1).toString(), startX, currentY)
            doc.text(student.student_id || 'N/A', startX + colWidth, currentY)
            doc.text(`${student.first_name || ''} ${student.father_name || ''}`.trim() || 'N/A', startX + colWidth * 2, currentY)

            // Calculate total attendance
            let totalPresent = 0
            weekDays.forEach((day) => {
              for (let period = 1; period <= 6; period++) {
                const status = getAttendanceStatus(student.id, day, period)
                if (status === '✓') totalPresent++
              }
            })

            doc.text(totalPresent.toString(), startX + colWidth * 3, currentY)
            currentY += rowHeight
          })
        } else {
          doc.text('No students found for this class', startX, currentY)
          currentY += rowHeight
        }

        // Add summary
        currentY += 20
        doc.fontSize(12)
        doc.text(`Total Students: ${students?.length || 0}`, startX, currentY)
        currentY += 15
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, startX, currentY)

        console.log('Finalizing PDF')
        doc.end()
      } catch (pdfError) {
        console.error('Error generating PDF content:', pdfError)
        reject(pdfError)
      }
    })

  } catch (error) {
    console.error('Error generating PDF report:', error)
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available'
    
    console.error('Error details:', { errorMessage, errorStack })
    
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF report', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}