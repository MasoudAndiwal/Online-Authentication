'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ============================================================================
// Type Definitions
// ============================================================================

export interface StudentDashboardMetrics {
  totalClasses: number
  attendanceRate: number
  presentDays: number
  absentDays: number
  sickDays: number
  leaveDays: number
  classAverage: number
  ranking: number
}

export interface AcademicStatus {
  status: 'good' | 'warning' | 'mahroom' | 'tasdiq'
  message: string
  remainingAbsences: number
  mahroomThreshold: number
  tasdiqThreshold: number
}

export interface AttendanceStatistics {
  totalClasses: number
  presentCount: number
  absentCount: number
  sickCount: number
  leaveCount: number
  attendanceRate: number
  classAverage: number
  ranking: number
  remainingAbsences: number
}

export interface WeekAttendance {
  date: Date
  dayName: string
  status: 'present' | 'absent' | 'sick' | 'leave' | 'no-class'
  sessions: SessionAttendance[]
}

export interface SessionAttendance {
  sessionNumber: number
  time: string
  status: 'present' | 'absent' | 'sick' | 'leave'
  markedBy: string
  markedAt: Date
  subject?: string
  teacherName?: string
}

export interface AttendanceRecord {
  id: string
  date: Date
  sessionNumber: number
  status: 'present' | 'absent' | 'sick' | 'leave'
  markedBy: string
  markedAt: Date
  notes?: string
  subject?: string
  teacherName?: string
}

export interface ClassInfo {
  id: string
  name: string
  code: string
  semester: number
  academicYear: string
  credits: number
  room: string
  building: string
  schedule: ClassSchedule[]
  teacher: TeacherInfo
  attendancePolicy: AttendancePolicy
}

export interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
  room: string
  sessionType: 'lecture' | 'lab' | 'tutorial'
}

export interface TeacherInfo {
  id: string
  name: string
  email: string
  officeHours: string
  officeLocation: string
  avatar?: string
}

export interface AttendancePolicy {
  maxAbsences: number
  mahroomThreshold: number
  tasdiqThreshold: number
  policyText: string
}

interface StudentDashboardResponse {
  success: boolean
  data: StudentDashboardMetrics
}

interface AttendanceHistoryResponse {
  success: boolean
  data: AttendanceRecord[]
}

interface ClassInfoResponse {
  success: boolean
  data: ClassInfo
}

// ============================================================================
// Dashboard Metrics Hook
// ============================================================================

/**
 * Hook to fetch student dashboard metrics
 * 
 * Requirements: 1.2, 3.1
 * 
 * @param studentId - The ID of the student
 * @returns Query result with dashboard metrics, loading state, and error
 */
export function useStudentDashboardMetrics(studentId: string | undefined) {
  return useQuery<StudentDashboardMetrics, Error>({
    queryKey: ['student-dashboard-metrics', studentId],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      try {
        const response = await fetch(`/api/students/dashboard?studentId=${studentId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const error: any = new Error(errorData.error || 'Failed to fetch dashboard metrics')
          error.status = response.status
          throw error
        }

        const result: StudentDashboardResponse = await response.json()
        
        // Validate response data
        if (!result.data) {
          throw new Error('Invalid response format')
        }
        
        return result.data
      } catch (error: any) {
        // Network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          const networkError: any = new Error('Network error. Please check your connection.')
          networkError.name = 'NetworkError'
          throw networkError
        }
        throw error
      }
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return false
      }
      // Don't retry on network errors if offline
      if (error.name === 'NetworkError' && !navigator.onLine) {
        return false
      }
      // Retry up to 3 times for server errors and network issues
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Legacy hook name for backward compatibility
 * @deprecated Use useStudentDashboardMetrics instead
 */
export const useStudentDashboard = useStudentDashboardMetrics

// ============================================================================
// Attendance Data Hook
// ============================================================================

/**
 * Hook to fetch student attendance data with weekly breakdown
 * 
 * Requirements: 2.1, 2.2, 2.3, 3.1
 * 
 * @param studentId - The ID of the student
 * @param weekOffset - Week offset from current week (0 = current, -1 = previous, 1 = next)
 * @returns Query result with attendance data
 */
export function useStudentAttendance(
  studentId: string | undefined,
  weekOffset: number = 0
) {
  return useQuery<WeekAttendance[], Error>({
    queryKey: ['student-attendance', studentId, weekOffset],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      try {
        // Calculate date range for the week
        const today = new Date()
        const currentDay = today.getDay()
        const diff = currentDay === 6 ? 0 : currentDay === 0 ? -1 : currentDay + 1 // Saturday = 0
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - diff + (weekOffset * 7))
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 4) // Saturday to Thursday (5 days)

        const response = await fetch(
          `/api/students/attendance/weekly?studentId=${studentId}&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const error: any = new Error(errorData.error || 'Failed to fetch attendance data')
          error.status = response.status
          throw error
        }

        const result = await response.json()
        
        // Validate response data
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error('Invalid response format')
        }
        
        // Transform dates from strings to Date objects
        return result.data.map((day: any) => ({
          ...day,
          date: new Date(day.date),
          sessions: day.sessions.map((session: any) => ({
            ...session,
            markedAt: new Date(session.markedAt),
          })),
        }))
      } catch (error: any) {
        // Network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          const networkError: any = new Error('Network error. Please check your connection.')
          networkError.name = 'NetworkError'
          throw networkError
        }
        throw error
      }
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return false
      }
      // Don't retry on network errors if offline
      if (error.name === 'NetworkError' && !navigator.onLine) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// ============================================================================
// Attendance History Hook
// ============================================================================

/**
 * Hook to fetch complete attendance history with filtering
 * 
 * Requirements: 8.1, 8.2, 8.3
 * 
 * @param studentId - The ID of the student
 * @param filters - Optional filters for date range and status
 * @returns Query result with attendance history
 */
export function useAttendanceHistory(
  studentId: string | undefined,
  filters?: {
    startDate?: Date
    endDate?: Date
    statusTypes?: string[]
  }
) {
  return useQuery<AttendanceRecord[], Error>({
    queryKey: ['attendance-history', studentId, filters],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      const params = new URLSearchParams({ studentId })
      
      if (filters?.startDate) {
        params.append('startDate', filters.startDate.toISOString())
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate.toISOString())
      }
      if (filters?.statusTypes && filters.statusTypes.length > 0) {
        params.append('statusTypes', filters.statusTypes.join(','))
      }

      const response = await fetch(`/api/attendance/history?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch attendance history')
      }

      const result: AttendanceHistoryResponse = await response.json()
      
      // Transform dates from strings to Date objects
      return result.data.map((record) => ({
        ...record,
        date: new Date(record.date),
        markedAt: new Date(record.markedAt),
      }))
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 10, // 10 minutes (history doesn't change often)
  })
}

// ============================================================================
// Class Information Hook
// ============================================================================

/**
 * Hook to fetch student's class information
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * 
 * @param studentId - The ID of the student
 * @returns Query result with class information
 */
export function useStudentClass(studentId: string | undefined) {
  return useQuery<ClassInfo, Error>({
    queryKey: ['student-class', studentId],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      const response = await fetch(`/api/students/${studentId}/class`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch class information')
      }

      const result: ClassInfoResponse = await response.json()
      return result.data
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 30, // 30 minutes (class info rarely changes)
  })
}

// ============================================================================
// Academic Status Hook
// ============================================================================

/**
 * Hook to calculate and fetch academic status based on attendance
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * 
 * @param studentId - The ID of the student
 * @returns Query result with academic status
 */
export function useAcademicStatus(studentId: string | undefined) {
  return useQuery<AcademicStatus, Error>({
    queryKey: ['academic-status', studentId],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      const response = await fetch(`/api/students/${studentId}/academic-status`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch academic status')
      }

      const result = await response.json()
      return result.data
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  })
}

// ============================================================================
// Export Attendance Hook
// ============================================================================

/**
 * Hook to export attendance records
 * 
 * Requirements: 8.4
 * 
 * @returns Mutation for exporting attendance data
 */
export function useExportAttendance() {
  return useMutation({
    mutationFn: async ({
      studentId,
      format,
      filters,
    }: {
      studentId: string
      format: 'pdf' | 'csv'
      filters?: {
        startDate?: Date
        endDate?: Date
        statusTypes?: string[]
      }
    }) => {
      const params = new URLSearchParams({ studentId, format })
      
      if (filters?.startDate) {
        params.append('startDate', filters.startDate.toISOString())
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate.toISOString())
      }
      if (filters?.statusTypes && filters.statusTypes.length > 0) {
        params.append('statusTypes', filters.statusTypes.join(','))
      }

      const response = await fetch(`/api/attendance/export?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to export attendance')
      }

      // Get the blob for download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance-${studentId}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    },
  })
}

// ============================================================================
// Refetch All Student Data Hook
// ============================================================================

/**
 * Hook to refetch all student data at once
 * Useful for refresh buttons or after important updates
 * 
 * @param studentId - The ID of the student
 * @returns Function to trigger refetch of all student data
 */
export function useRefetchStudentData(studentId: string | undefined) {
  const queryClient = useQueryClient()

  return () => {
    if (!studentId) return

    // Invalidate all student-related queries
    queryClient.invalidateQueries({ queryKey: ['student-dashboard-metrics', studentId] })
    queryClient.invalidateQueries({ queryKey: ['student-attendance', studentId] })
    queryClient.invalidateQueries({ queryKey: ['attendance-history', studentId] })
    queryClient.invalidateQueries({ queryKey: ['student-class', studentId] })
    queryClient.invalidateQueries({ queryKey: ['academic-status', studentId] })
  }
}
