/**
 * React Hook for Sync Service
 * Provides React integration for the sync service
 * 
 * Requirements: 6.4
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { studentDataSync, type SyncStats } from '@/lib/services/sync-service'
import { useOfflineStatus } from '@/hooks/use-client-cache'

// ============================================================================
// Sync Service Hook
// ============================================================================

export interface UseSyncServiceOptions {
  studentId?: string
  autoSync?: boolean
  syncOnReconnect?: boolean
  syncOnMount?: boolean
  syncInterval?: number
}

export interface SyncServiceResult {
  stats: SyncStats
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  syncAll: () => Promise<void>
  syncMetrics: () => string
  syncAttendance: (weekOffset?: number) => string
  syncAcademicStatus: () => string
  manualSync: () => Promise<void>
}

/**
 * Hook for managing sync service operations
 */
export function useSyncService(options: UseSyncServiceOptions = {}): SyncServiceResult {
  const {
    studentId,
    autoSync = true,
    syncOnReconnect = true,
    syncOnMount = true,
    syncInterval = 5 * 60 * 1000 // 5 minutes
  } = options

  const [stats, setStats] = useState<SyncStats>(studentDataSync.getStats())
  const [isSyncing, setIsSyncing] = useState(false)
  const offlineStatus = useOfflineStatus()
  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncRef = useRef<Date | null>(null)

  // Set student ID when it changes
  useEffect(() => {
    if (studentId) {
      studentDataSync.setStudentId(studentId)
    }
  }, [studentId])

  // Subscribe to sync stats
  useEffect(() => {
    const unsubscribe = studentDataSync.subscribe((newStats) => {
      setStats(newStats)
      if (newStats.lastSyncTime > 0) {
        lastSyncRef.current = new Date(newStats.lastSyncTime)
      }
    })

    return unsubscribe
  }, [])

  // Sync functions
  const syncAll = useCallback(async () => {
    if (!studentId || !offlineStatus.isOnline) return

    setIsSyncing(true)
    try {
      studentDataSync.syncAllData('high')
      await studentDataSync.manualSync()
    } finally {
      setIsSyncing(false)
    }
  }, [studentId, offlineStatus.isOnline])

  const syncMetrics = useCallback(() => {
    if (!studentId) return ''
    return studentDataSync.syncDashboardMetrics('normal')
  }, [studentId])

  const syncAttendance = useCallback((weekOffset: number = 0) => {
    if (!studentId) return ''
    return studentDataSync.syncWeeklyAttendance(weekOffset, 'normal')
  }, [studentId])

  const syncAcademicStatus = useCallback(() => {
    if (!studentId) return ''
    return studentDataSync.syncAcademicStatus('normal')
  }, [studentId])

  const manualSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await studentDataSync.manualSync()
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // Auto sync on mount
  useEffect(() => {
    if (syncOnMount && autoSync && studentId && offlineStatus.isOnline) {
      syncAll()
    }
  }, [syncOnMount, autoSync, studentId, offlineStatus.isOnline, syncAll])

  // Sync on reconnection
  useEffect(() => {
    if (!syncOnReconnect || !autoSync) return

    const handleReconnect = () => {
      if (offlineStatus.isOnline && offlineStatus.wasOffline && studentId) {
        // Auto-syncing on reconnection
        syncAll()
      }
    }

    // Listen for online events
    window.addEventListener('online', handleReconnect)
    return () => window.removeEventListener('online', handleReconnect)
  }, [syncOnReconnect, autoSync, offlineStatus.isOnline, offlineStatus.wasOffline, studentId, syncAll])

  // Periodic sync
  useEffect(() => {
    if (!autoSync || !syncInterval || !studentId) return

    const scheduleSync = () => {
      syncTimeoutRef.current = setTimeout(() => {
        if (offlineStatus.isOnline) {
          syncAll().finally(scheduleSync)
        } else {
          scheduleSync()
        }
      }, syncInterval)
    }

    scheduleSync()

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [autoSync, syncInterval, studentId, offlineStatus.isOnline, syncAll])

  return {
    stats,
    isOnline: offlineStatus.isOnline,
    isSyncing,
    lastSync: lastSyncRef.current,
    syncAll,
    syncMetrics,
    syncAttendance,
    syncAcademicStatus,
    manualSync
  }
}

// ============================================================================
// Sync Status Hook
// ============================================================================

export interface SyncStatusResult {
  isOnline: boolean
  isSyncing: boolean
  queueSize: number
  lastSync: Date | null
  successRate: number
  hasFailures: boolean
}

/**
 * Hook for monitoring sync status
 */
export function useSyncStatus(): SyncStatusResult {
  const [stats, setStats] = useState<SyncStats>(studentDataSync.getStats())
  const [isSyncing, setIsSyncing] = useState(false)
  const offlineStatus = useOfflineStatus()

  useEffect(() => {
    const unsubscribe = studentDataSync.subscribe(setStats)
    return unsubscribe
  }, [])

  const successRate = stats.totalOperations > 0 
    ? (stats.successfulOperations / stats.totalOperations) * 100 
    : 100

  return {
    isOnline: offlineStatus.isOnline,
    isSyncing,
    queueSize: stats.queueSize,
    lastSync: stats.lastSyncTime > 0 ? new Date(stats.lastSyncTime) : null,
    successRate,
    hasFailures: stats.failedOperations > 0
  }
}

// ============================================================================
// Auto Sync Hook
// ============================================================================

export interface AutoSyncOptions {
  studentId?: string
  enabled?: boolean
  syncOnReconnect?: boolean
  syncOnFocus?: boolean
  syncOnVisibilityChange?: boolean
  minSyncInterval?: number
}

/**
 * Hook for automatic synchronization management
 */
export function useAutoSync(options: AutoSyncOptions = {}) {
  const {
    studentId,
    enabled = true,
    syncOnReconnect = true,
    syncOnFocus = true,
    syncOnVisibilityChange = true,
    minSyncInterval = 30000 // 30 seconds minimum between syncs
  } = options

  const lastSyncRef = useRef<number>(0)
  const offlineStatus = useOfflineStatus()

  const shouldSync = useCallback(() => {
    if (!enabled || !studentId || !offlineStatus.isOnline) {
      return false
    }

    const now = Date.now()
    return (now - lastSyncRef.current) >= minSyncInterval
  }, [enabled, studentId, offlineStatus.isOnline, minSyncInterval])

  const performSync = useCallback(async () => {
    if (!shouldSync()) return

    lastSyncRef.current = Date.now()
    
    try {
      studentDataSync.syncAllData('normal')
      await studentDataSync.manualSync()
    } catch (error) {
      console.error('Auto sync failed:', error)
    }
  }, [shouldSync])

  // Sync on reconnection
  useEffect(() => {
    if (!syncOnReconnect) return

    const handleOnline = () => {
      if (shouldSync()) {
        // Auto-syncing on reconnection
        performSync()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncOnReconnect, shouldSync, performSync])

  // Sync on window focus
  useEffect(() => {
    if (!syncOnFocus) return

    const handleFocus = () => {
      if (shouldSync()) {
        // Auto-syncing on focus
        performSync()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [syncOnFocus, shouldSync, performSync])

  // Sync on visibility change
  useEffect(() => {
    if (!syncOnVisibilityChange) return

    const handleVisibilityChange = () => {
      if (!document.hidden && shouldSync()) {
        // Auto-syncing on visibility change
        performSync()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [syncOnVisibilityChange, shouldSync, performSync])

  return {
    performSync,
    canSync: shouldSync(),
    lastSync: lastSyncRef.current > 0 ? new Date(lastSyncRef.current) : null
  }
}