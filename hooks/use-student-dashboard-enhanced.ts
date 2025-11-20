/**
 * Enhanced Student Dashboard Hook with Offline Support
 * Integrates client-side caching with automatic sync on reconnection
 * 
 * Requirements: 6.1, 6.2, 6.4
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback, useRef } from 'react'
import { 
  useStudentMetricsCache,
  useWeeklyAttendanceCache,
  useAttendanceHistoryCache,
  useClassInfoCache,
  useAcademicStatusCache,
  useOfflineStatus,
  useCachedQuery
} from '@/hooks/use-client-cache'
import { 
  type StudentDashboardMetrics,
  type WeekAttendance,
  type AttendanceRecord,
  type ClassInfo,
  type AcademicStatus
} from '@/hooks/use-student-dashboard'

// ============================================================================
// Enhanced Dashboard Metrics Hook
// ============================================================================

/**
 * Enhanced hook for student dashboard metrics with offline support
 */
export function useStudentDashboardMetricsEnhanced(studentId: string | undefined) {
  const cache = useStudentMetricsCache(studentId)
  const offlineStatus = useOfflineStatus()
  
  return useCachedQuery<StudentDashboardMetrics>(
    studentId ? `student-dashboard-metrics-${studentId}` : '',
    {
      queryFn: async () => {
        if (!studentId) {
          throw new Error('Student ID is required')
        }

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

        const result = await response.json()
        
        if (!result.data) {
          throw new Error('Invalid response format')
        }
        
        return result.data
      },
      enabled: !!studentId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      staleThreshold: 24 * 60 * 60 * 1000 // 24 hours
    }
  )
}

// ============================================================================
// Enhanced Weekly Attendance Hook
// ============================================================================

/**
 * Enhanced hook for weekly attendance with offline support
 */
export function useStudentAttendanceEnhanced(
  studentId: string | undefined,
  weekOffset: number = 0
) {
  const cache = useWeeklyAttendanceCache(studentId, weekOffset)
  
  return useCachedQuery<WeekAttendance[]>(
    studentId ? `student-attendance-${studentId}-${weekOffset}` : '',
    {
      queryFn: async () => {
        if (!studentId) {
          throw new Error('Student ID is required')
        }

        // Calculate date range for the week
        const today = new Date()
        const currentDay = today.getDay()
        const diff = currentDay === 6 ? 0 : currentDay === 0 ? -1 : currentDay + 1
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - diff + (weekOffset * 7))
        
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 4)

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
      },
      enabled: !!studentId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      ttl: 2 * 60 * 1000, // 2 minutes
      staleThreshold: 24 * 60 * 60 * 1000 // 24 hours
    }
  )
}

// ============================================================================
// Enhanced Attendance History Hook
// ============================================================================

/**
 * Enhanced hook for attendance history with offline support
 */
export function useAttendanceHistoryEnhanced(
  studentId: string | undefined,
  filters?: {
    startDate?: Date
    endDate?: Date
    statusTypes?: string[]
  }
) {
  const cache = useAttendanceHistoryCache(studentId, filters)
  
  return useCachedQuery<AttendanceRecord[]>(
    studentId ? `attendance-history-${studentId}-${JSON.stringify(filters)}` : '',
    {
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

        const result = await response.json()
        
        // Transform dates from strings to Date objects
        return result.data.map((record: any) => ({
          ...record,
          date: new Date(record.date),
          markedAt: new Date(record.markedAt),
        }))
      },
      enabled: !!studentId,
      refetchOnMount: false, // History doesn't change often
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      ttl: 10 * 60 * 1000, // 10 minutes
      staleThreshold: 24 * 60 * 60 * 1000 // 24 hours
    }
  )
}

// ============================================================================
// Enhanced Class Info Hook
// ============================================================================

/**
 * Enhanced hook for class information with offline support
 */
export function useStudentClassEnhanced(studentId: string | undefined) {
  const cache = useClassInfoCache(studentId)
  
  return useCachedQuery<ClassInfo>(
    studentId ? `student-class-${studentId}` : '',
    {
      queryFn: async () => {
        if (!studentId) {
          throw new Error('Student ID is required')
        }

        const response = await fetch(`/api/students/${studentId}/class`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch class information')
        }

        const result = await response.json()
        return result.data
      },
      enabled: !!studentId,
      refetchOnMount: false, // Class info rarely changes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      ttl: 30 * 60 * 1000, // 30 minutes
      staleThreshold: 24 * 60 * 60 * 1000 // 24 hours
    }
  )
}

// ============================================================================
// Enhanced Academic Status Hook
// ============================================================================

/**
 * Enhanced hook for academic status with offline support
 */
export function useAcademicStatusEnhanced(studentId: string | undefined) {
  const cache = useAcademicStatusCache(studentId)
  
  return useCachedQuery<AcademicStatus>(
    studentId ? `academic-status-${studentId}` : '',
    {
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
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      staleThreshold: 24 * 60 * 60 * 1000 // 24 hours
    }
  )
}

// ============================================================================
// Sync Manager Hook
// ============================================================================

export interface SyncManagerOptions {
  studentId?: string
  enableAutoSync?: boolean
  syncOnReconnect?: boolean
  syncOnWindowFocus?: boolean
  syncInterval?: number
}

/**
 * Hook for managing data synchronization
 */
export function useSyncManager(options: SyncManagerOptions = {}) {
  const {
    studentId,
    enableAutoSync = true,
    syncOnReconnect = true,
    syncOnWindowFocus = true,
    syncInterval = 5 * 60 * 1000 // 5 minutes
  } = options

  const queryClient = useQueryClient()
  const offlineStatus = useOfflineStatus()
  const lastSyncRef = useRef<number>(0)
  const syncTimeoutRef = useRef<NodeJS.Timeout>()

  // Sync function
  const syncData = useCallback(async () => {
    if (!studentId || !offlineStatus.isOnline) {
      return
    }

    const now = Date.now()
    
    // Prevent too frequent syncs
    if (now - lastSyncRef.current < 30000) { // 30 seconds minimum between syncs
      return
    }

    lastSyncRef.current = now

    try {
      console.log('🔄 Syncing student data...')
      
      // Invalidate and refetch all student-related queries
      await Promise.all([
        queryClient.invalidateQueries({ 
          queryKey: [`student-dashboard-metrics-${studentId}`] 
        }),
        queryClient.invalidateQueries({ 
          queryKey: [`student-attendance-${studentId}`] 
        }),
        queryClient.invalidateQueries({ 
          queryKey: [`academic-status-${studentId}`] 
        })
      ])

      console.log('✅ Data sync completed')
    } catch (error) {
      console.error('❌ Data sync failed:', error)
    }
  }, [studentId, offlineStatus.isOnline, queryClient])

  // Sync on reconnection
  useEffect(() => {
    if (!syncOnReconnect || !enableAutoSync) return

    const handleReconnect = (state: any) => {
      // When coming back online after being offline
      if (state.isOnline && state.wasOffline) {
        console.log('🌐 Connection restored, syncing data...')
        setTimeout(syncData, 1000) // Small delay to ensure connection is stable
      }
    }

    // Subscribe to offline status changes
    const unsubscribe = offlineStatus.offlineStatus ? 
      (() => {
        // Manual subscription since we need the previous state
        let wasOffline = false
        const checkConnection = () => {
          const isOnline = navigator.onLine
          if (isOnline && wasOffline) {
            handleReconnect({ isOnline: true, wasOffline: true })
          }
          wasOffline = !isOnline
        }
        
        window.addEventListener('online', checkConnection)
        return () => window.removeEventListener('online', checkConnection)
      })() : 
      () => {}

    return unsubscribe
  }, [syncOnReconnect, enableAutoSync, syncData, offlineStatus])

  // Sync on window focus
  useEffect(() => {
    if (!syncOnWindowFocus || !enableAutoSync) return

    const handleFocus = () => {
      if (offlineStatus.isOnline) {
        syncData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [syncOnWindowFocus, enableAutoSync, offlineStatus.isOnline, syncData])

  // Periodic sync
  useEffect(() => {
    if (!enableAutoSync || !syncInterval) return

    const scheduleNextSync = () => {
      syncTimeoutRef.current = setTimeout(() => {
        if (offlineStatus.isOnline) {
          syncData().finally(scheduleNextSync)
        } else {
          scheduleNextSync()
        }
      }, syncInterval)
    }

    scheduleNextSync()

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [enableAutoSync, syncInterval, offlineStatus.isOnline, syncData])

  // Manual sync function
  const manualSync = useCallback(async () => {
    await syncData()
  }, [syncData])

  return {
    syncData: manualSync,
    lastSync: lastSyncRef.current,
    isOnline: offlineStatus.isOnline,
    canSync: offlineStatus.isOnline && !!studentId
  }
}

// ============================================================================
// Combined Enhanced Dashboard Hook
// ============================================================================

/**
 * Combined hook that provides all enhanced dashboard functionality
 */
export function useEnhancedStudentDashboard(studentId: string | undefined) {
  const metrics = useStudentDashboardMetricsEnhanced(studentId)
  const attendance = useStudentAttendanceEnhanced(studentId, 0)
  const classInfo = useStudentClassEnhanced(studentId)
  const academicStatus = useAcademicStatusEnhanced(studentId)
  const syncManager = useSyncManager({ studentId })

  return {
    metrics,
    attendance,
    classInfo,
    academicStatus,
    sync: syncManager,
    isLoading: metrics.isLoading || attendance.isLoading,
    hasError: !!(metrics.error || attendance.error),
    errors: {
      metrics: metrics.error,
      attendance: attendance.error,
      classInfo: classInfo.error,
      academicStatus: academicStatus.error
    }
  }
}