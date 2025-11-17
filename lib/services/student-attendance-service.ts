/**
 * Student Attendance Service
 * Handles fetching and calculating attendance data for student dashboard
 */

import { supabase } from '@/lib/supabase';
import type {
  Student,
  AttendanceStats,
  AcademicStatus,
  WeekData,
  DayAttendance,
  SessionAttendance,
  AttendanceRecord,
  UploadedFile,
  AttendanceResponse,
  AttendanceStatus,
} from '@/types/types';

// Thresholds for academic status
const DISQUALIFICATION_THRESHOLD = 20; // Pure absence hours
const CERTIFICATION_THRESHOLD = 30; // Combined absence hours (sick + leave)

/**
 * Get student information by ID
 */
async function getStudentInfo(studentId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('id, first_name, last_name, student_id, phone')
    .eq('id', studentId)
    .single();

  if (error || !data) {
    console.error('Error fetching student:', error);
    return null;
  }

  return {
    id: data.id,
    name: `${data.first_name} ${data.last_name}`,
    studentNumber: data.student_id,
    email: '', // Email not in current schema
  };
}

/**
 * Calculate attendance statistics from records
 */
function calculateStats(records: Array<{ status: string }>): AttendanceStats {
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;
  const sickDays = records.filter((r) => r.status === 'SICK').length;
  const leaveDays = records.filter((r) => r.status === 'LEAVE').length;

  const attendancePercentage =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Calculate absence hours (assuming each day = 1 hour for simplicity)
  // In production, this should be calculated based on actual class hours
  const pureAbsenceHours = absentDays;
  const combinedAbsenceHours = sickDays + leaveDays;

  return {
    totalDays,
    presentDays,
    absentDays,
    sickDays,
    leaveDays,
    attendancePercentage,
    pureAbsenceHours,
    combinedAbsenceHours,
  };
}

/**
 * Determine academic status based on absence hours
 */
function determineAcademicStatus(stats: AttendanceStats): AcademicStatus {
  return {
    isDisqualified: stats.pureAbsenceHours >= DISQUALIFICATION_THRESHOLD,
    needsCertification: stats.combinedAbsenceHours >= CERTIFICATION_THRESHOLD,
    disqualificationThreshold: DISQUALIFICATION_THRESHOLD,
    certificationThreshold: CERTIFICATION_THRESHOLD,
  };
}

/**
 * Get attendance records for a student
 */
async function getAttendanceRecords(
  studentId: string
): Promise<Array<{ id: string; date: string; status: string; subject: string; period: number }>> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('id, date, status, subject, period_number')
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }

  return (
    data?.map((record) => ({
      id: record.id,
      date: record.date,
      status: record.status,
      subject: record.subject || 'Unknown',
      period: record.period_number || 1,
    })) || []
  );
}

/**
 * Get week data for calendar view
 */
function getWeekData(
  records: Array<{ date: string; status: string; subject: string; period: number }>,
  weekOffset: number = 0
): WeekData {
  const today = new Date();
  const currentDay = today.getDay();
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust for Sunday
  
  const monday = new Date(today.setDate(diff));
  monday.setDate(monday.getDate() + weekOffset * 7);
  
  const startDate = new Date(monday);
  const endDate = new Date(monday);
  endDate.setDate(endDate.getDate() + 6);

  const days: DayAttendance[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const dayRecords = records.filter((r) => r.date === dateStr);
    
    let dayStatus: AttendanceStatus | 'future' = 'future';
    if (currentDate <= new Date()) {
      if (dayRecords.length > 0) {
        // Determine overall day status based on sessions
        const statuses = dayRecords.map((r) => r.status.toLowerCase());
        if (statuses.every((s) => s === 'present')) {
          dayStatus = 'present';
        } else if (statuses.some((s) => s === 'absent')) {
          dayStatus = 'absent';
        } else if (statuses.some((s) => s === 'sick')) {
          dayStatus = 'sick';
        } else if (statuses.some((s) => s === 'leave')) {
          dayStatus = 'leave';
        }
      }
    }

    const sessions: SessionAttendance[] = dayRecords.map((r) => ({
      period: r.period,
      courseName: r.subject,
      status: r.status.toLowerCase() as AttendanceStatus,
    }));

    days.push({
      date: dateStr,
      dayName: dayNames[i],
      status: dayStatus,
      sessions,
    });
  }

  return {
    weekNumber: Math.ceil((startDate.getDate() + 6) / 7),
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    days,
  };
}

/**
 * Format recent attendance records
 */
function formatRecentRecords(
  records: Array<{ id: string; date: string; status: string; subject: string; period: number }>
): AttendanceRecord[] {
  return records.slice(0, 10).map((record) => {
    const date = new Date(record.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      id: record.id,
      date: record.date,
      dayOfWeek: dayNames[date.getDay()],
      status: record.status.toLowerCase() as AttendanceStatus,
      courseName: record.subject,
      period: record.period,
    };
  });
}

/**
 * Get uploaded medical certificates
 */
async function getUploadedFiles(studentId: string): Promise<UploadedFile[]> {
  const { data, error } = await supabase
    .from('medical_certificates')
    .select('id, file_name, file_size, upload_date, status, rejection_reason')
    .eq('student_id', studentId)
    .order('upload_date', { ascending: false });

  if (error) {
    console.error('Error fetching uploaded files:', error);
    return [];
  }

  return (
    data?.map((file) => ({
      id: file.id,
      fileName: file.file_name,
      fileSize: file.file_size,
      uploadDate: file.upload_date,
      status: file.status as 'pending' | 'approved' | 'rejected',
      rejectionReason: file.rejection_reason || undefined,
    })) || []
  );
}

/**
 * Get complete attendance data for student dashboard
 */
export async function getStudentAttendanceData(
  studentId: string,
  weekOffset: number = 0
): Promise<AttendanceResponse | null> {
  try {
    // Fetch all required data
    const [student, records, uploadedFiles] = await Promise.all([
      getStudentInfo(studentId),
      getAttendanceRecords(studentId),
      getUploadedFiles(studentId),
    ]);

    if (!student) {
      return null;
    }

    // Calculate statistics and status
    const stats = calculateStats(records);
    const status = determineAcademicStatus(stats);
    const weekData = getWeekData(records, weekOffset);
    const recentRecords = formatRecentRecords(records);

    return {
      student,
      stats,
      status,
      weekData,
      recentRecords,
      uploadedFiles,
    };
  } catch (error) {
    console.error('Error fetching student attendance data:', error);
    return null;
  }
}
