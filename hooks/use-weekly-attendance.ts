'use client'

import { useQuery } from '@tanstack/react-query'
import type { DayAttendance } from '@/types/types'

export interface WeeklyAttendanceData {
  weekNumber: number
  startDate: string
  endDate: string
  days: DayAttendance[]
}

interface WeeklyAttendanceResponse {
  success: boolean
  data: WeeklyAttendanceData
}

/**
 * Hook to fetch weekly attendance data for a student
 * @param studentId - The ID of the student
 * @param weekOffset - Week offset relative to current week (0 = current, -1 = last week, 1 = next week)
 * @returns Query result with weekly attendance data, loading state, and error
 */
export function useWeeklyAttendance(studentId: string | undefined, weekOffset: number) {
  return useQuery<WeeklyAttendanceData, Error>({
    queryKey: ['weekly-attendance', studentId, weekOffset],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      // Get session data to include in request
      const sessionData = localStorage.getItem('user_session');
      
      const response = await fetch(
        `/api/students/attendance/weekly?studentId=${studentId}&week=${weekOffset}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(sessionData && { 'x-session-data': sessionData }),
          },
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch weekly attendance')
      }

      const result: WeeklyAttendanceResponse = await response.json()
      return result.data
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
