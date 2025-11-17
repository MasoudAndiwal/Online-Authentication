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
 * Convert column number to Excel column letter (e.g., 1 -> A, 27 -> AA)
 */
function getColumnLetter(columnNumber: number): string {
  let result = '';
  while (columnNumber > 0) {
    columnNumber--; // Make it 0-based
    result = String.fromCharCode(65 + (columnNumber % 26)) + result;
    columnNumber = Math.floor(columnNumber / 26);
  }
  return result;
}

/**
 * Get day-level status for a student (SICK or LEAVE takes precedence over individual periods)
 */
function getDayStatus(
  studentId: string,
  date: Date,
  attendanceRecords: AttendanceRecord[]
): 'SICK' | 'LEAVE' | 'NORMAL' {
  const dateStr = date.toISOString().split('T')[0];
  const record = attendanceRecords.find(
    r => r.student_id === studentId && r.date === dateStr
  );

  if (!record) return 'NORMAL';

  const periods = [
    record.period_1_status,
    record.period_2_status,
    record.period_3_status,
    record.period_4_status,
    record.period_5_status,
    record.period_6_status
  ];

  // If any period is SICK, the whole day is SICK
  if (periods.some(status => status === 'SICK')) {
    return 'SICK';
  }

  // If any period is LEAVE, the whole day is LEAVE
  if (periods.some(status => status === 'LEAVE')) {
    return 'LEAVE';
  }

  return 'NORMAL';
}

/**
 * Calculate attendance summary for a student with proper sick/leave handling
 */
function calculateAttendanceSummary(
  studentId: string,
  attendanceRecords: AttendanceRecord[],
  weekDays: Date[]
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

  // Process each day
  weekDays.forEach(day => {
    const dayStatus = getDayStatus(studentId, day, attendanceRecords);
    
    if (dayStatus === 'SICK') {
      // If sick for the day, count as 6 sick periods
      sickCount += 6;
    } else if (dayStatus === 'LEAVE') {
      // If on leave for the day, count as 6 leave periods
      leaveCount += 6;
    } else {
      // Normal day - count individual periods
      const dateStr = day.toISOString().split('T')[0];
      const record = studentRecords.find(r => r.date === dateStr);
      
      if (record) {
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
        }
      }
    }
  });

  return { presentCount, absentCount, sickCount, leaveCount };
}

/**
 * Get attendance status for a specific student, date, and period
 * Returns null for sick/leave days (will be handled by day-level merging)
 */
function getAttendanceStatus(
  studentId: string,
  date: Date,
  period: number,
  attendanceRecords: AttendanceRecord[]
): string | null {
  const dateStr = date.toISOString().split('T')[0];
  const record = attendanceRecords.find(
    r => r.student_id === studentId && r.date === dateStr
  );

  if (!record) return '';

  // Check if this is a sick or leave day
  const dayStatus = getDayStatus(studentId, date, attendanceRecords);
  if (dayStatus === 'SICK' || dayStatus === 'LEAVE') {
    return null; // Will be handled by day-level merging
  }

  const statusKey = `period_${period}_status` as keyof AttendanceRecord;
  const status = record[statusKey] as string;

  if (status === 'PRESENT') return '✓';
  if (status === 'ABSENT') return 'X';
  
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
    const templateRow = worksheet.getRow(startRow); // Get the template row for formatting
    const templateSignatureRowNumber = 28; // Signature is at row 28 in template
    
    // First, save the signature row content before we potentially overwrite it
    const signatureRowBackup = worksheet.getRow(templateSignatureRowNumber);
    const signatureData: Record<number, {
      value: unknown;
      style: unknown;
      border: unknown;
      fill: unknown;
      font: unknown;
      alignment: unknown;
    }> = {};
    signatureRowBackup.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (cell.value || cell.style) {
        signatureData[colNumber] = {
          value: cell.value,
          style: cell.style ? { ...cell.style } : null,
          border: cell.border ? { ...cell.border } : null,
          fill: cell.fill ? { ...cell.fill } : null,
          font: cell.font ? { ...cell.font } : null,
          alignment: cell.alignment ? { ...cell.alignment } : null,
        };
      }
    });
    const signatureRowHeight = signatureRowBackup.height;
    
    // Save merged cells that include the signature row
    const mergedCellsToMove: string[] = [];
    worksheet.model.merges.forEach((merge: string) => {
      // Check if this merge includes row 28
      const match = merge.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (match) {
        const startRow = parseInt(match[2]);
        const endRow = parseInt(match[4]);
        if (startRow <= templateSignatureRowNumber && endRow >= templateSignatureRowNumber) {
          mergedCellsToMove.push(merge);
        }
      }
    });
    
    // Always remove signature merged cells first (for any number of students)
    console.log(`Removing all signature merges from rows 28-38`);
    
    // Method 1: Remove specific known merges
    const knownSignatureMerges = ['A28:AU28', 'A28:AU38'];
    knownSignatureMerges.forEach((merge) => {
      const index = worksheet.model.merges.indexOf(merge);
      if (index > -1) {
        worksheet.model.merges.splice(index, 1);
        console.log(`Removed known merge: ${merge}`);
      }
    });
    
    // Method 2: Remove any merge that includes rows 28-38
    const mergesToRemove: string[] = [];
    worksheet.model.merges.forEach((merge: string) => {
      const match = merge.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
      if (match) {
        const startRow = parseInt(match[2]);
        const endRow = parseInt(match[4]);
        // If any part of the merge touches rows 28-38, remove it
        if ((startRow >= 28 && startRow <= 38) || (endRow >= 28 && endRow <= 38) || 
            (startRow < 28 && endRow > 38)) {
          mergesToRemove.push(merge);
        }
      }
    });
    
    // Remove the signature merges
    mergesToRemove.forEach((merge) => {
      const index = worksheet.model.merges.indexOf(merge);
      if (index > -1) {
        worksheet.model.merges.splice(index, 1);
        console.log(`Removed merge: ${merge}`);
      }
    });
    
    // Method 3: Force unmerge specific cells if still merged
    try {
      // Try to unmerge the signature area directly
      for (let row = 28; row <= 38; row++) {
        worksheet.unMergeCells(`A${row}:AU${row}`);
        console.log(`Force unmerged row ${row}`);
      }
    } catch {
      console.log(`Force unmerge completed (some may not have been merged)`);
    }
    
    console.log(`Signature merge removal completed`);

    students.forEach((student, index) => {
      const currentRowNumber = startRow + index;
      const row = worksheet.getRow(currentRowNumber);
      
      // If this row is in the signature area (28-38), completely reset it first
      if (currentRowNumber >= 28 && currentRowNumber <= 38) {
        console.log(`Resetting signature row ${currentRowNumber} for student data`);
        
        // Clear all cells completely
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.value = null;
          cell.style = {};
          cell.border = {};
          // Skip fill property to avoid type issues
          cell.font = {};
          cell.alignment = {};
        });
      }
      
      // Always copy formatting from template row for consistency
      // Copy row height
      row.height = 62.1; // Use student height consistently
      
      // Copy cell styles from template row to new row
      templateRow.eachCell({ includeEmpty: true }, (templateCell, colNumber) => {
        const newCell = row.getCell(colNumber);
        
        // Copy style
        if (templateCell.style) {
          newCell.style = { ...templateCell.style };
        }
        
        // Copy border
        if (templateCell.border) {
          newCell.border = { ...templateCell.border };
        }
        
        // Copy fill
        if (templateCell.fill) {
          newCell.fill = { ...templateCell.fill };
        }
        
        // Copy font
        if (templateCell.font) {
          newCell.font = { ...templateCell.font };
        }
        
        // Copy alignment
        if (templateCell.alignment) {
          newCell.alignment = { ...templateCell.alignment };
        }
      });
      
      const summary = calculateAttendanceSummary(student.id, attendanceRecords, weekDays);
      
      // RTL table: Student info on the RIGHT side
      // AU8 = Column 47, AT8 = Column 46, AS8 = Column 45, AR8 = Column 44, AQ8 = Column 43
      row.getCell('AU').value = index + 1; // شماره (Number) - AU8
      
      // Name column (AT) with top and bottom borders
      const nameCell = row.getCell('AT');
      nameCell.value = student.first_name; // اسم (Name) - AT8
      nameCell.border = {
        ...nameCell.border,
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      };
      
      // Father name column (AS) with top and bottom borders
      const fatherNameCell = row.getCell('AS');
      fatherNameCell.value = student.father_name; // ولدیت (Father Name) - AS8
      fatherNameCell.border = {
        ...fatherNameCell.border,
        top: { style: 'thin' },
        bottom: { style: 'thin' }
      };
      
      row.getCell('AR').value = student.grandfather_name; // Grandfather Name - AR8
      row.getCell('AQ').value = student.student_id; // نمبر اساس (ID Number) - AQ8
      
      // Middle: Attendance for each day and period (AP8 down to G8, RIGHT to LEFT)
      // AP = Column 42, G = Column 7
      let colIndex = 42; // Start from AP (column 42)
      const dayMerges: string[] = []; // Track merges for sick/leave days
      
      weekDays.forEach((day) => {
        const dayStatus = getDayStatus(student.id, day, attendanceRecords);
        const dayStartCol = colIndex - 5; // Start of this day's 6 periods
        const dayEndCol = colIndex; // End of this day's 6 periods
        
        if (dayStatus === 'SICK' || dayStatus === 'LEAVE') {
          // Merge the 6 cells for this day
          const startColLetter = getColumnLetter(dayStartCol);
          const endColLetter = getColumnLetter(dayEndCol);
          const mergeRange = `${startColLetter}${currentRowNumber}:${endColLetter}${currentRowNumber}`;
          
          try {
            worksheet.mergeCells(mergeRange);
            dayMerges.push(mergeRange);
            
            // Set the status in the first cell of the merged range
            const firstCell = row.getCell(dayEndCol); // Right-most cell (AP, AJ, etc.)
            firstCell.value = dayStatus === 'SICK' ? 'مریض' : 'رخصت';
            
            // Style the merged cell
            firstCell.alignment = { horizontal: 'center', vertical: 'middle' };
            firstCell.font = { bold: true, size: 36 };
            firstCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // White background
            };
            firstCell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            };
            
            console.log(`Merged ${mergeRange} for ${dayStatus} - Student: ${student.first_name}`);
          } catch (error) {
            console.log(`Could not merge ${mergeRange}:`, error);
          }
          
          // Skip the 6 periods for this day
          colIndex -= 6;
        } else {
          // Normal day - fill individual periods
          for (let period = 1; period <= 6; period++) {
            if (colIndex >= 7) { // Stop at G (column 7)
              const status = getAttendanceStatus(student.id, day, period, attendanceRecords);
              if (status !== null) {
                row.getCell(colIndex).value = status;
              }
              colIndex--;
            }
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
    
    console.log(`Added ${students.length} student rows to the report`);



    // Add new signature at the end (for all cases)
    const lastStudentRow = startRow + students.length - 1;
    const newSignatureRowNumber = lastStudentRow + 1;
    
    // Check if we have signature data to restore
    if (Object.keys(signatureData).length > 0) {
      const newSignatureRow = worksheet.getRow(newSignatureRowNumber);
      
      // Keep original signature row height (not student height)
      if (signatureRowHeight) {
        newSignatureRow.height = signatureRowHeight;
      }
      
      // Restore signature row content and formatting
      Object.keys(signatureData).forEach((colNumber) => {
        const colNum = parseInt(colNumber);
        const cellData = signatureData[colNum];
        const newCell = newSignatureRow.getCell(colNum);
        
        // Restore value
        if (cellData.value !== undefined && cellData.value !== null) {
          newCell.value = cellData.value as ExcelJS.CellValue;
        }
        
        // Restore style but override height-related properties
        if (cellData.style && typeof cellData.style === 'object') {
          newCell.style = cellData.style as Partial<ExcelJS.Style>;
        }
        
        // Restore border but ensure we add thick top border
        if (cellData.border && typeof cellData.border === 'object') {
          const border = { ...cellData.border } as Partial<ExcelJS.Borders>;
          // Force thick top border for signature row
          border.top = { style: 'thick' };
          newCell.border = border;
        } else {
          // If no border data, at least add thick top border
          newCell.border = {
            top: { style: 'thick' }
          };
        }
        
        // Restore fill
        if (cellData.fill && typeof cellData.fill === 'object') {
          newCell.fill = cellData.fill as ExcelJS.Fill;
        }
        
        // Restore font
        if (cellData.font && typeof cellData.font === 'object') {
          newCell.font = cellData.font as Partial<ExcelJS.Font>;
        }
        
        // Restore alignment
        if (cellData.alignment && typeof cellData.alignment === 'object') {
          newCell.alignment = cellData.alignment as Partial<ExcelJS.Alignment>;
        }
      });
      
      newSignatureRow.commit();
      
      // Add two separate signature merges as requested
      try {
        // Right side merge: AQ to AU (student info area)
        const rightMerge = `AQ${newSignatureRowNumber}:AU${newSignatureRowNumber}`;
        worksheet.mergeCells(rightMerge);
        console.log(`Added right signature merge: ${rightMerge}`);
        
        // Left side merge: B to AP (attendance and summary area)  
        const leftMerge = `B${newSignatureRowNumber}:AP${newSignatureRowNumber}`;
        worksheet.mergeCells(leftMerge);
        console.log(`Added left signature merge: ${leftMerge}`);
        
        // Apply styling to the merged areas
        // Right side (AQ:AU) - for signature text
        for (let col = 43; col <= 47; col++) { // AQ=43 to AU=47
          const cell = worksheet.getRow(newSignatureRowNumber).getCell(col);
          if (col === 43) { // First cell gets the signature text
            cell.value = 'امضاء استاد مربوطه';
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.font = { bold: true, size: 26 };
          cell.border = {
            top: { style: 'thick' },
            bottom: { style: 'thick' },
            left: col === 43 ? { style: 'thick' } : undefined,
            right: col === 47 ? { style: 'thick' } : undefined
          };
        }
        
        // Left side (B:AP) - empty signature area
        for (let col = 2; col <= 42; col++) { // B=2 to AP=42
          const cell = worksheet.getRow(newSignatureRowNumber).getCell(col);
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
            top: { style: 'thick' },
            bottom: { style: 'thick' },
            left: col === 2 ? { style: 'thick' } : undefined,
            right: col === 42 ? { style: 'thick' } : undefined
          };
        }
        
      } catch (error) {
        console.log(`Could not create signature merges:`, error);
      }
      
      console.log(`Added signature at row ${newSignatureRowNumber}`);
                
    }

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
