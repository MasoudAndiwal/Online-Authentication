// Core data types for Student Dashboard

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  email: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'sick' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string;
  dayOfWeek: string;
  status: AttendanceStatus;
  courseName: string;
  period: number;
  notes?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  leaveDays: number;
  attendancePercentage: number;
  pureAbsenceHours: number;
  combinedAbsenceHours: number;
}

export interface AcademicStatus {
  isDisqualified: boolean;        // محروم
  needsCertification: boolean;    // تصدیق طلب
  disqualificationThreshold: number;
  certificationThreshold: number;
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: DayAttendance[];
}

export interface DayAttendance {
  date: string;
  dayName: string;
  status: AttendanceStatus | 'future';
  sessions: SessionAttendance[];
}

export interface SessionAttendance {
  period: number;
  courseName: string;
  status: AttendanceStatus;
  time?: string;
  markedBy?: string;
  markedAt?: string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// API Response types
export interface AttendanceResponse {
  student: Student;
  stats: AttendanceStats;
  status: AcademicStatus;
  weekData: WeekData;
  recentRecords: AttendanceRecord[];
  uploadedFiles: UploadedFile[];
}

export interface UploadRequest {
  file: File;
  studentId: string;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}
