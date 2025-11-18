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
 * @param weekNumber - The week number to fetch (1-based)
 * @returns Query result with weekly attendance data, loading state, and error
 */
export function useWeeklyAttendance(studentId: string | undefined, weekNumber: number) {
  return useQuery<WeeklyAttendanceData, Error>({
    queryKey: ['weekly-attendance', studentId, weekNumber],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      const response = await fetch(
        `/api/students/attendance/weekly?studentId=${studentId}&week=${weekNumber}`
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
