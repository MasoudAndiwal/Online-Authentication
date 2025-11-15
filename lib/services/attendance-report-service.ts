import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';
import * as path from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Types
interface AttendanceRecord {
  student_id: string;
  class_id: string;
  date: string;
  period_1_status: string;
  period_2_status: string;
  period_3_status: string;
  period_4_status: string;
  period_5_status: string;
  period_6_status: string;
}

interface StudentInfo {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  father_name: string;
  grandfather_name: string;
}

interface ClassInfo {
  id: string;
  name: string;
  semester: number;
  major: string;
  session: string;
}

/**
 * Get week start (Saturday) and end (Thursday) dates
 */
function getWeekDates(date: Date): { start: Date; end: Date; days: Date[] } {
  const d = new Date(date);
  const day = d.getDay();
  
  // In Afghanistan, week starts on Saturday (day 6)
  const diff = day === 6 ? 0 : day === 0 ? 1 : day <= 4 ? day + 2 : -3;
  
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 5); // Saturday to Thursday = 5 days
  end.setHours(23, 59, 59, 999);
  
  // Generate array of all days in the week
  const days: Date[] = [];
  for (let i = 0; i < 6; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  
  return { start, end, days };
}

/**
 * Fetch class information
 */
async function fetchClassInfo(classId: string): Promise<ClassInfo> {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, semester, major, session')
    .eq('id', classId)
    .single();

  if (error) throw new Error(`Failed to fetch class info: ${error.message}`);
  return data;
}

/**
 * Fetch students for a class
 */
async function fetchStudents(classSection: string): Promise<StudentInfo[]> {
  const { data, error } = await supabase
    .from('students')
    .select('id, student_id, first_name, last_name, father_name, grandfather_name')
    .eq('class_section', classSection)
    .order('first_name', { ascending: true });

  if (error) throw new Error(`Failed to fetch students: ${error.message}`);
  return data || [];
}

/**
 * Fetch attendance records for a week
 */
async function fetchAttendanceRecords(
  classId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance_records_new')
    .select('*')
    .eq('class_id', classId)
    .gte('date', weekStart.toISOString().split('T')[0])
    .lte('date', weekEnd.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw new Error(`Failed to fetch attendance records: ${error.message}`);
  return data || [];
}

/**
 * Calculate attendance summary for a student
 */
function calculateAttendanceSummary(
  studentId: string,
  attendanceRecords: AttendanceRecord[]
): {
  presentCount: number;
  absentCount: number;
  sickCount: number;
  leaveCount: number;
} {
  let presentCount = 0;
  let absentCount = 0;
  let sickCount = 0;
  let leaveCount = 0;

  const studentRecords = attendanceRecords.filter(r => r.student_id === studentId);

  for (const record of studentRecords) {
    const periods = [
      record.period_1_status,
      record.period_2_status,
      record.period_3_status,
      record.period_4_status,
      record.period_5_status,
      record.period_6_status
    ];

    for (const status of periods) {
      if (status === 'PRESENT') presentCount++;
      else if (status === 'ABSENT') absentCount++;
      else if (status === 'SICK') sickCount++;
      else if (status === 'LEAVE') leaveCount++;
    }
  }

  return { presentCount, absentCount, sickCount, leaveCount };
}

/**
 * Get attendance status for a specific student, date, and period
 */
function getAttendanceStatus(
  studentId: string,
  date: Date,
  period: number,
  attendanceRecords: AttendanceRecord[]
): string {
  const dateStr = date.toISOString().split('T')[0];
  const record = attendanceRecords.find(
    r => r.student_id === studentId && r.date === dateStr
  );

  if (!record) return '';

  const statusKey = `period_${period}_status` as keyof AttendanceRecord;
  const status = record[statusKey] as string;

  if (status === 'PRESENT') return '✓';
  if (status === 'ABSENT') return 'X';
  if (status === 'SICK') return 'مریض';
  if (status === 'LEAVE') return 'رخصت';
  
  return '';
}

/**
 * Main function to generate attendance report using template
 */
export async function generateAttendanceReport(
  classId: string,
  dateRange: 'current-week' | 'last-week' | 'custom',
  customStartDate?: Date,
  customEndDate?: Date
): Promise<{ excel: Buffer; classInfo: ClassInfo }> {
  try {
    // Determine week dates
    let weekStart: Date;
    let weekEnd: Date;
    let weekDays: Date[];

    if (dateRange === 'current-week') {
      const today = new Date();
      const week = getWeekDates(today);
      weekStart = week.start;
      weekEnd = week.end;
      weekDays = week.days;
    } else if (dateRange === 'last-week') {
      const today = new Date();
      const lastWeekDate = new Date(today);
      lastWeekDate.setDate(today.getDate() - 7);
      const week = getWeekDates(lastWeekDate);
      weekStart = week.start;
      weekEnd = week.end;
      weekDays = week.days;
    } else {
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom date range requires both start and end dates');
      }
      weekStart = customStartDate;
      weekEnd = customEndDate;
      const week = getWeekDates(weekStart);
      weekDays = week.days;
    }

    // Fetch data
    const classInfo = await fetchClassInfo(classId);
    const classSection = `${classInfo.name} - ${classInfo.session}`;
    const students = await fetchStudents(classSection);
    const attendanceRecords = await fetchAttendanceRecords(classId, weekStart, weekEnd);

    console.log(`Generating report for ${students.length} students with ${attendanceRecords.length} attendance records`);

    // Load template
    const templatePath = path.join(process.cwd(), 'public/reports/report-Test/attendance.xlsx');
    console.log('Loading template from:', templatePath);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    console.log('Template loaded successfully');
    console.log('Available worksheets:', workbook.worksheets.map(ws => ({ name: ws.name, id: ws.id })));

    // Get the first worksheet from the template
    const worksheet = workbook.worksheets[0];
    
    if (!worksheet) {
      throw new Error('Template worksheet not found');
    }
    
    console.log('Using worksheet:', worksheet.name)

    // Update header information (adjust row numbers based on your template)
    // You'll need to identify the exact cells in your template
    // For now, I'll add data starting from a specific row
    
    // Start adding student data from row 8 (based on template structure)
    const startRow = 8;
    
    students.forEach((student, index) => {
      const row = worksheet.getRow(startRow + index);
      const summary = calculateAttendanceSummary(student.id, attendanceRecords);
      
      // RTL table: Student info on the RIGHT side
      // AU8 = Column 47, AT8 = Column 46, AS8 = Column 45, AR8 = Column 44, AQ8 = Column 43
      row.getCell('AU').value = index + 1; // شماره (Number) - AU8
      row.getCell('AT').value = student.first_name; // اسم (Name) - AT8
      row.getCell('AS').value = student.father_name; // ولدیت (Father Name) - AS8
      row.getCell('AR').value = student.grandfather_name; // Grandfather Name - AR8
      row.getCell('AQ').value = student.student_id; // نمبر اساس (ID Number) - AQ8
      
      // Middle: Attendance for each day and period (AP8 down to G8, RIGHT to LEFT)
      // AP = Column 42, G = Column 7
      let colIndex = 42; // Start from AP (column 42)
      weekDays.forEach(day => {
        for (let period = 1; period <= 6; period++) {
          if (colIndex >= 7) { // Stop at G (column 7)
            const status = getAttendanceStatus(student.id, day, period, attendanceRecords);
            row.getCell(colIndex).value = status;
            colIndex--;
          }
        }
      });
      
      // Left side: Summary
      // F8 = Column 6, E8 = Column 5, D8 = Column 4, C8 = Column 3, B8 = Column 2
      row.getCell('F').value = summary.presentCount; // حاضر (Present) - F8
      row.getCell('E').value = summary.absentCount; // غیرحاضر (Absent) - E8
      row.getCell('D').value = summary.sickCount; // مریض (Sick) - D8
      row.getCell('C').value = summary.leaveCount; // رخصت (Leave) - C8
      row.getCell('B').value = summary.presentCount + summary.absentCount + summary.sickCount + summary.leaveCount; // مجموعه (Total) - B8
      
      row.commit();
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      excel: Buffer.from(buffer),
      classInfo
    };
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
}
