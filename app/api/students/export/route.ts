/**
 * Student Data Export API Endpoint
 * 
 * Provides data export functionality with strict rate limiting and audit logging.
 * Supports CSV and PDF formats for attendance data.
 * 
 * Requirements: 4.2 (strict rate limiting), 5.1 (audit logging)
 */

import { NextResponse } from 'next/server';
import { withExportMiddleware, EnhancedRequest } from '@/lib/middleware/api-middleware-stack';
import { ValidationError } from '@/lib/errors/custom-errors';
import { getAuditLoggerService } from '@/lib/services/audit-logger-service';
import { supabase } from '@/lib/supabase';

const auditLogger = getAuditLoggerService();

/**
 * GET /api/students/export
 * 
 * Exports student attendance data in specified format.
 * 
 * Query Parameters:
 * - studentId: Student identifier (optional, defaults to authenticated user)
 * - format: Export format - 'csv' or 'pdf' (required)
 * - startDate: Start date for export range (ISO format, optional)
 * - endDate: End date for export range (ISO format, optional)
 * - includeDetails: Include detailed session information (default: false)
 * 
 * Rate Limiting: 5 requests per hour per user
 * 
 * Requirements: 4.2 (strict rate limiting), 5.1 (audit logging)
 */
export const GET = withExportMiddleware(
  async (req: EnhancedRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');
    const format = searchParams.get('format');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Determine which student's data to export
    const targetStudentId = requestedStudentId || req.user?.id;
    
    if (!targetStudentId) {
      throw new ValidationError('Student ID is required', 'studentId');
    }

    // Validate format parameter
    if (!format || !['csv', 'pdf'].includes(format.toLowerCase())) {
      throw new ValidationError('Format must be either "csv" or "pdf"', 'format');
    }

    // Authorization check: students can only export their own data
    if (req.user?.role === 'STUDENT' && req.user.id !== targetStudentId) {
      throw new ValidationError(
        'Students can only export their own data',
        'studentId'
      );
    }

    // Validate date range
    let parsedStartDate: Date | null = null;
    let parsedEndDate: Date | null = null;
    
    if (startDate) {
      parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        throw new ValidationError('Invalid start date format', 'startDate');
      }
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        throw new ValidationError('Invalid end date format', 'endDate');
      }
    }

    // Validate date range logic
    if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
      throw new ValidationError('Start date must be before end date', 'dateRange');
    }

    // Limit export range to 1 year maximum
    if (parsedStartDate && parsedEndDate) {
      const daysDiff = Math.abs(parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        throw new ValidationError('Export range cannot exceed 365 days', 'dateRange');
      }
    }

    try {
      const startTime = performance.now();
      
      // Fetch attendance data for export
      const attendanceData = await fetchAttendanceForExport(
        targetStudentId,
        parsedStartDate,
        parsedEndDate,
        includeDetails
      );

      // Generate export based on format
      let exportResult: { data: any; filename: string; contentType: string };
      
      if (format.toLowerCase() === 'csv') {
        exportResult = await generateCSVExport(attendanceData, targetStudentId);
      } else {
        exportResult = await generatePDFExport(attendanceData, targetStudentId);
      }

      const responseTime = performance.now() - startTime;

      // Log export action for audit trail (Requirement 5.1)
      await auditLogger.log({
        userId: req.user?.id || 'unknown',
        action: 'data_export',
        resource: 'attendance_data',
        resourceId: targetStudentId,
        metadata: {
          format: format.toLowerCase(),
          startDate: parsedStartDate?.toISOString(),
          endDate: parsedEndDate?.toISOString(),
          includeDetails,
          recordCount: attendanceData.length,
          responseTime: Math.round(responseTime),
          filename: exportResult.filename,
          userAgent: req.headers.get('user-agent') || 'unknown'
        },
        ipAddress: req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
        success: true
      });

      // Return file download response
      return new NextResponse(exportResult.data, {
        status: 200,
        headers: {
          'Content-Type': exportResult.contentType,
          'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
          'X-Request-ID': req.requestId,
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Export-Records': attendanceData.length.toString()
        }
      });

    } catch (error) {
      // Log failed export attempt
      await auditLogger.log({
        userId: req.user?.id || 'unknown',
        action: 'data_export',
        resource: 'attendance_data',
        resourceId: targetStudentId,
        metadata: {
          format: format?.toLowerCase(),
          startDate: parsedStartDate?.toISOString(),
          endDate: parsedEndDate?.toISOString(),
          includeDetails,
          error: error instanceof Error ? error.message : 'Unknown error',
          userAgent: req.headers.get('user-agent') || 'unknown'
        },
        ipAddress: req.headers.get('x-forwarded-for') || 
                  req.headers.get('x-real-ip') || 
                  'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  },
  'export-attendance-data'
);

/**
 * Fetch attendance data for export
 */
async function fetchAttendanceForExport(
  studentId: string,
  startDate: Date | null,
  endDate: Date | null,
  includeDetails: boolean
): Promise<any[]> {
  try {
    let query = supabase
      .from('attendance_records')
      .select(`
        date,
        period,
        status,
        marked_by,
        marked_at,
        ${includeDetails ? `
        schedule_entries (
          subject,
          start_time,
          end_time,
          teachers (
            first_name,
            last_name
          )
        )
        ` : ''}
      `)
      .eq('student_id', studentId)
      .order('date', { ascending: true })
      .order('period', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0]);
    }

    const { data: attendanceRecords, error } = await query;

    if (error) {
      console.error('Database error fetching attendance for export:', error);
      throw new Error('Failed to fetch attendance data');
    }

    return attendanceRecords || [];

  } catch (error) {
    console.error('Error fetching attendance for export:', error);
    throw error;
  }
}

/**
 * Generate CSV export
 */
async function generateCSVExport(
  attendanceData: any[],
  studentId: string
): Promise<{ data: string; filename: string; contentType: string }> {
  const headers = [
    'Date',
    'Period',
    'Status',
    'Subject',
    'Time',
    'Marked By',
    'Marked At'
  ];

  const csvRows = [headers.join(',')];

  attendanceData.forEach(record => {
    const row = [
      record.date,
      record.period.toString(),
      record.status,
      record.schedule_entries?.subject || 'Unknown',
      record.schedule_entries ? 
        `${record.schedule_entries.start_time}-${record.schedule_entries.end_time}` : 
        'Unknown',
      record.schedule_entries?.teachers ? 
        `${record.schedule_entries.teachers.first_name} ${record.schedule_entries.teachers.last_name}` : 
        record.marked_by || 'Unknown',
      record.marked_at || ''
    ];

    // Escape commas and quotes in CSV
    const escapedRow = row.map(field => {
      const stringField = String(field || '');
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    });

    csvRows.push(escapedRow.join(','));
  });

  const csvContent = csvRows.join('\n');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `attendance_${studentId}_${timestamp}.csv`;

  return {
    data: csvContent,
    filename,
    contentType: 'text/csv; charset=utf-8'
  };
}

/**
 * Generate PDF export (simplified implementation)
 */
async function generatePDFExport(
  attendanceData: any[],
  studentId: string
): Promise<{ data: string; filename: string; contentType: string }> {
  // For now, return a simple text-based PDF content
  // In a real implementation, you would use a PDF library like jsPDF or Puppeteer
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `attendance_${studentId}_${timestamp}.pdf`;

  // Simple text content (in real implementation, generate actual PDF)
  const pdfContent = `
ATTENDANCE REPORT
Student ID: ${studentId}
Generated: ${new Date().toLocaleString()}

Total Records: ${attendanceData.length}

${attendanceData.map(record => 
  `${record.date} - Period ${record.period}: ${record.status} (${record.schedule_entries?.subject || 'Unknown'})`
).join('\n')}

End of Report
  `.trim();

  return {
    data: pdfContent,
    filename,
    contentType: 'application/pdf'
  };
}