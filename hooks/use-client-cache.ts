/**
 * React Hooks for Client-Side Caching
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  clientCache, 
  offlineDetector, 
  CACHE_KEYS, 
  CACHE_TTL,
  type OfflineState,
  type CacheStats 
} from '@/lib/utils/client-cache'

// ============================================================================
// Client Cache Hook
// ============================================================================

export interface UseCacheOptions {
  ttl?: number
  staleThreshold?: number
  enableOfflineMode?: boolean
}

export interface CacheResult<T> {
  data: T | null
  isLoading: boolean
  isStale: boolean
  age: number | null
  lastUpdated: number | null
  setCache: (data: T) => void
  clearCache: () => void
  refresh: () => void
}

/**
 * Hook for managing cached data with staleness detection
 */
export function useClientCache<T>(
  key: string, 
  options: UseCacheOptions = {}
): CacheResult<T> {
  const {
    ttl = CACHE_TTL.STUDENT_METRICS,
    staleThreshold = CACHE_TTL.STALENESS_THRESHOLD,
    enableOfflineMode = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const mountedRef = useRef(true)

  // Load initial data from cache
  useEffect(() => {
    const loadFromCache = () => {
      const cached = clientCache.getWithMetadata<T>(key)
      if (cached && mountedRef.current) {
        setData(cached.data)
        setLastUpdated(cached.metadata.timestamp)
      }
      setIsLoading(false)
    }

    loadFromCache()
    
    return () => {
      mountedRef.current = false
    }
  }, [key])

  // Calculate derived values
  const age = lastUpdated ? Date.now() - lastUpdated : null
  const isStale = age ? age > staleThreshold : true

  // Set cache data
  const setCache = useCallback((newData: T) => {
    const success = clientCache.set(key, newData, { ttl })
    if (success && mountedRef.current) {
      setData(newData)
      setLastUpdated(Date.now())
    }
  }, [key, ttl])

  // Clear cache data
  const clearCache = useCallback(() => {
    clientCache.remove(key)
    if (mountedRef.current) {
      setData(null)
      setLastUpdated(null)
    }
  }, [key])

  // Refresh cache (reload from storage)
  const refresh = useCallback(() => {
    const cached = clientCache.getWithMetadata<T>(key)
    if (cached && mountedRef.current) {
      setData(cached.data)
      setLastUpdated(cached.metadata.timestamp)
    } else if (mountedRef.current) {
      setData(null)
      setLastUpdated(null)
    }
  }, [key])

  return {
    data,
    isLoading,
    isStale,
    age,
    lastUpdated,
    setCache,
    clearCache,
    refresh
  }
}

// ============================================================================
// Offline Status Hook
// ============================================================================

export interface OfflineStatus extends OfflineState {
  offlineDuration: number | null
  timeSinceOnline: number | null
  showOfflineIndicator: boolean
}

/**
 * Hook for monitoring offline status with enhanced information
 */
export function useOfflineStatus(): OfflineStatus {
  const [state, setState] = useState<OfflineState>(offlineDetector.getState())
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false)

  useEffect(() => {
    const unsubscribe = offlineDetector.subscribe((newState) => {
      setState(newState)
      
      // Show indicator when going offline
      if (!newState.isOnline) {
        setShowOfflineIndicator(true)
      } else {
        // Hide indicator after delay when coming back online
        setTimeout(() => setShowOfflineIndicator(false), 3000)
      }
    })

    return unsubscribe
  }, [])

  return {
    ...state,
    offlineDuration: offlineDetector.getOfflineDuration(),
    timeSinceOnline: offlineDetector.getTimeSinceOnline(),
    showOfflineIndicator: showOfflineIndicator || !state.isOnline
  }
}

// ============================================================================
// Cache Statistics Hook
// ============================================================================

/**
 * Hook for monitoring cache statistics
 */
export function useCacheStats(): CacheStats & { refresh: () => void } {
  const [stats, setStats] = useState<CacheStats>(() => clientCache.getStats())

  const refresh = useCallback(() => {
    setStats(clientCache.getStats())
  }, [])

  useEffect(() => {
    // Refresh stats periodically
    const interval = setInterval(refresh, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [refresh])

  return {
    ...stats,
    refresh
  }
}

// ============================================================================
// Cache Cleanup Hook
// ============================================================================

/**
 * Hook for automatic cache cleanup
 */
export function useCacheCleanup(options: {
  cleanupInterval?: number
  maxCacheAge?: number
  enabled?: boolean
} = {}) {
  const {
    cleanupInterval = 5 * 60 * 1000, // 5 minutes
    maxCacheAge = 24 * 60 * 60 * 1000, // 24 hours
    enabled = true
  } = options

  useEffect(() => {
    if (!enabled) return

    const cleanup = () => {
      try {
        // Clean up expired entries
        const expiredCount = clientCache.cleanupExpired()
        
        // Get stats to check if further cleanup needed
        const stats = clientCache.getStats()
        
        // If cache is too large, evict oldest entries
        if (stats.totalSize > 4 * 1024 * 1024) { // 4MB threshold
          clientCache.evictOldest(1024 * 1024) // Free 1MB
        }

        // Cache cleanup completed - expiredCount entries removed
      } catch (error) {
        console.error('Cache cleanup failed:', error)
      }
    }

    // Run initial cleanup
    cleanup()

    // Set up periodic cleanup
    const interval = setInterval(cleanup, cleanupInterval)

    return () => clearInterval(interval)
  }, [cleanupInterval, maxCacheAge, enabled])
}

// ============================================================================
// Cached Query Hook
// ============================================================================

export interface CachedQueryOptions<T> extends UseCacheOptions {
  queryFn: () => Promise<T>
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
}

export interface CachedQueryResult<T> extends CacheResult<T> {
  error: Error | null
  isFetching: boolean
  refetch: () => Promise<void>
}

/**
 * Hook that combines caching with data fetching
 */
export function useCachedQuery<T>(
  key: string,
  options: CachedQueryOptions<T>
): CachedQueryResult<T> {
  const {
    queryFn,
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    ...cacheOptions
  } = options

  const cache = useClientCache<T>(key, cacheOptions)
  const [error, setError] = useState<Error | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const offlineStatus = useOfflineStatus()
  const fetchingRef = useRef(false)

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!enabled || fetchingRef.current) return

    fetchingRef.current = true
    setIsFetching(true)
    setError(null)

    try {
      const result = await queryFn()
      cache.setCache(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      console.error(`Failed to fetch data for key ${key}:`, error)
    } finally {
      setIsFetching(false)
      fetchingRef.current = false
    }
  }, [enabled, queryFn, cache, key])

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Initial fetch on mount
  useEffect(() => {
    if (enabled && refetchOnMount && (!cache.data || cache.isStale)) {
      // Only fetch if online or no cached data exists
      if (offlineStatus.isOnline || !cache.data) {
        fetchData()
      }
    }
  }, [enabled, refetchOnMount, cache.data, cache.isStale, offlineStatus.isOnline, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return

    const handleFocus = () => {
      if (cache.isStale && offlineStatus.isOnline) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, enabled, cache.isStale, offlineStatus.isOnline, fetchData])

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect || !enabled) return

    const unsubscribe = offlineDetector.subscribe((state) => {
      // When coming back online, refetch if data is stale
      if (state.isOnline && state.wasOffline && cache.isStale) {
        fetchData()
      }
    })

    return unsubscribe
  }, [refetchOnReconnect, enabled, cache.isStale, fetchData])

  return {
    ...cache,
    error,
    isFetching,
    refetch
  }
}

// ============================================================================
// Student Dashboard Cache Hooks
// ============================================================================

/**
 * Hook for caching student dashboard metrics
 */
export function useStudentMetricsCache(studentId: string | undefined) {
  return useClientCache(
    studentId ? CACHE_KEYS.STUDENT_METRICS(studentId) : '',
    {
      ttl: CACHE_TTL.STUDENT_METRICS,
      staleThreshold: CACHE_TTL.STALENESS_THRESHOLD,
      enableOfflineMode: true
    }
  )
}

/**
 * Hook for caching weekly attendance data
 */
export function useWeeklyAttendanceCache(
  studentId: string | undefined, 
  weekOffset: number = 0
) {
  return useClientCache(
    studentId ? CACHE_KEYS.WEEKLY_ATTENDANCE(studentId, weekOffset) : '',
    {
      ttl: CACHE_TTL.WEEKLY_ATTENDANCE,
      staleThreshold: CACHE_TTL.STALENESS_THRESHOLD,
      enableOfflineMode: true
    }
  )
}

/**
 * Hook for caching attendance history
 */
export function useAttendanceHistoryCache(
  studentId: string | undefined,
  filters?: any
) {
  const filtersKey = filters ? JSON.stringify(filters) : undefined
  
  return useClientCache(
    studentId ? CACHE_KEYS.ATTENDANCE_HISTORY(studentId, filtersKey) : '',
    {
      ttl: CACHE_TTL.ATTENDANCE_HISTORY,
      staleThreshold: CACHE_TTL.STALENESS_THRESHOLD,
      enableOfflineMode: true
    }
  )
}

/**
 * Hook for caching class information
 */
export function useClassInfoCache(studentId: string | undefined) {
  return useClientCache(
    studentId ? CACHE_KEYS.CLASS_INFO(studentId) : '',
    {
      ttl: CACHE_TTL.CLASS_INFO,
      staleThreshold: CACHE_TTL.STALENESS_THRESHOLD,
      enableOfflineMode: true
    }
  )
}

/**
 * Hook for caching academic status
 */
export function useAcademicStatusCache(studentId: string | undefined) {
  return useClientCache(
    studentId ? CACHE_KEYS.ACADEMIC_STATUS(studentId) : '',
    {
      ttl: CACHE_TTL.ACADEMIC_STATUS,
      staleThreshold: CACHE_TTL.STALENESS_THRESHOLD,
      enableOfflineMode: true
    }
  )
}