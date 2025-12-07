'use client'

import { useQuery } from '@tanstack/react-query'

export interface TrendDataPoint {
  label: string
  value: number
  present: number
  absent: number
  sick: number
  leave: number
}

interface AttendanceTrendsResponse {
  success: boolean
  data: TrendDataPoint[]
}

/**
 * Hook to fetch attendance trend data for charts
 * @param studentId - The ID of the student
 * @param type - 'weekly' or 'monthly' trends
 * @returns Query result with trend data
 */
export function useAttendanceTrends(
  studentId: string | undefined,
  type: 'weekly' | 'monthly' = 'weekly'
) {
  return useQuery<TrendDataPoint[], Error>({
    queryKey: ['attendance-trends', studentId, type],
    queryFn: async () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }

      const response = await fetch(
        `/api/students/attendance/trends?studentId=${studentId}&type=${type}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch attendance trends')
      }

      const result: AttendanceTrendsResponse = await response.json()
      return result.data
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
