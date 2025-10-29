/**
 * Attendance Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the Mark Attendance feature.
 * These types are used for frontend state management and will be ready for backend integration.
 */

// ============================================================================
// Attendance Status Types
// ============================================================================

/**
 * Possible attendance statuses for a student
 */
export type AttendanceStatus = 
  | "PRESENT"   // Student is present in class
  | "ABSENT"    // Student is absent without reason
  | "SICK"      // Student is absent due to sickness
  | "LEAVE"     // Student is on approved leave
  | "NOT_MARKED"; // Attendance not yet marked (default state)

/**
 * Session types for classes
 */
export type ClassSession = "MORNING" | "AFTERNOON";

// ============================================================================
// Core Data Models
// ============================================================================

/**
 * Class data structure matching the API response from /api/classes
 */
export interface Class {
  id: string;
  name: string;
  session: ClassSession;
  major: string;
  semester: number;
  studentCount: number;
  teacherCount?: number;
  scheduleCount?: number;
}

/**
 * Student data structure matching the API response from /api/students
 * This is a subset of the full Student model, containing only fields needed for attendance
 */
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  grandFatherName: string;
  studentId: string;
  phone: string;
  classSection: string;
  programs: string;
  semester: string;
  status: "ACTIVE" | "SICK";
}

// ============================================================================
// Attendance Records
// ============================================================================

/**
 * Individual attendance record for a student
 * Stores the attendance status and when it was marked
 */
export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  markedAt: Date;
  markedBy?: string; // Optional: ID of the user who marked attendance
}

/**
 * Complete attendance state for a specific class and date
 * Used for managing attendance data in React state
 */
export interface AttendanceState {
  classId: string;
  date: Date;
  records: Map<string, AttendanceRecord>; // studentId -> AttendanceRecord
}

/**
 * Attendance data for API submission (future backend integration)
 * Converts Map to array for JSON serialization
 */
export interface AttendanceSubmission {
  classId: string;
  date: string; // ISO date string
  records: AttendanceRecord[];
}

// ============================================================================
// Display Models
// ============================================================================

/**
 * Student with attendance status for display in the UI
 * Combines student data with their current attendance status
 */
export interface StudentWithAttendance {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  name: string; // Full name (firstName + lastName)
  classSection: string;
  programs: string;
  semester: string;
  status: AttendanceStatus;
  markedAt?: Date;
}

/**
 * Attendance statistics for a class on a specific date
 * Used for displaying summary cards
 */
export interface AttendanceStatistics {
  total: number;
  present: number;
  absent: number;
  sick: number;
  leave: number;
  notMarked: number;
}

// ============================================================================
// Filter and Search Types
// ============================================================================

/**
 * Filter options for class selection view
 */
export interface ClassFilters {
  search: string;
  session: "ALL" | ClassSession;
}

/**
 * Filter options for student attendance view
 */
export interface StudentFilters {
  search: string;
  status: "ALL" | AttendanceStatus;
}

/**
 * Sort options for student list
 */
export type StudentSortBy = "name" | "studentId" | "status";
export type SortOrder = "asc" | "desc";

export interface StudentSortOptions {
  sortBy: StudentSortBy;
  order: SortOrder;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Loading states for different data fetching operations
 */
export interface LoadingStates {
  classes: boolean;
  students: boolean;
  attendance: boolean;
  saving: boolean;
}

/**
 * Error states for different operations
 */
export interface ErrorStates {
  classes: string | null;
  students: string | null;
  attendance: string | null;
  saving: string | null;
}

// ============================================================================
// Action Types
// ============================================================================

/**
 * Bulk action types for attendance marking
 */
export type BulkAction = 
  | "MARK_ALL_PRESENT"
  | "MARK_ALL_ABSENT"
  | "RESET_ALL";

/**
 * Bulk action payload
 */
export interface BulkActionPayload {
  action: BulkAction;
  studentIds: string[];
  timestamp: Date;
}

// ============================================================================
// API Response Types (Future Backend Integration)
// ============================================================================

/**
 * API response for fetching attendance records
 */
export interface AttendanceApiResponse {
  success: boolean;
  data: AttendanceRecord[];
  message?: string;
}

/**
 * API response for saving attendance
 */
export interface AttendanceSaveResponse {
  success: boolean;
  saved: number;
  failed: number;
  message: string;
  errors?: Array<{
    studentId: string;
    error: string;
  }>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Status badge configuration for UI rendering
 */
export interface StatusBadgeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string; // Icon name from lucide-react
}

/**
 * Status button configuration for UI rendering
 */
export interface StatusButtonConfig {
  status: AttendanceStatus;
  label: string;
  icon: string; // Icon name from lucide-react
  activeColor: string;
  inactiveColor: string;
  activeBgColor: string;
  inactiveBgColor: string;
}

/**
 * Date navigation direction
 */
export type DateNavigationDirection = "previous" | "next";

/**
 * Date range for attendance queries (future use)
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================================================
// Helper Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid AttendanceStatus
 */
export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return (
    typeof value === "string" &&
    ["PRESENT", "ABSENT", "SICK", "LEAVE", "NOT_MARKED"].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid ClassSession
 */
export function isClassSession(value: unknown): value is ClassSession {
  return (
    typeof value === "string" &&
    ["MORNING", "AFTERNOON"].includes(value)
  );
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default attendance status for new records
 */
export const DEFAULT_ATTENDANCE_STATUS: AttendanceStatus = "NOT_MARKED";

/**
 * All possible attendance statuses (excluding NOT_MARKED)
 */
export const MARKABLE_STATUSES: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "SICK",
  "LEAVE",
];

/**
 * All attendance statuses including NOT_MARKED
 */
export const ALL_STATUSES: AttendanceStatus[] = [
  ...MARKABLE_STATUSES,
  "NOT_MARKED",
];
