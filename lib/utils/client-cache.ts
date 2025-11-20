/**
 * Client-Side Caching Utilities
 * Enhanced localStorage wrapper with timestamp tracking and expiration
 * 
 * Requirements: 6.1, 6.2, 6.3
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt?: number
  version?: string
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  version?: string // Cache version for invalidation
}

export interface CacheStats {
  totalEntries: number
  totalSize: number // Approximate size in bytes
  oldestEntry?: number
  newestEntry?: number
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_PREFIX = 'student-dashboard-cache:'
const CACHE_VERSION = '1.0.0'
const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const MAX_CACHE_SIZE = 5 * 1024 * 1024 // 5MB limit

// ============================================================================
// Client Cache Manager
// ============================================================================

export class ClientCacheManager {
  private prefix: string
  private defaultTTL: number

  constructor(prefix: string = CACHE_PREFIX, defaultTTL: number = DEFAULT_TTL) {
    this.prefix = prefix
    this.defaultTTL = defaultTTL
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * Check if localStorage is available
   */
  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false
      }
      
      // Test localStorage functionality
      const testKey = '__cache_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get estimated size of a value in bytes
   */
  private getSize(value: string): number {
    return new Blob([value]).size
  }

  /**
   * Set cache entry with timestamp and expiration
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): boolean {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage not available, cache operation skipped')
      return false
    }

    try {
      const now = Date.now()
      const ttl = options.ttl ?? this.defaultTTL
      const expiresAt = ttl > 0 ? now + ttl : undefined

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt,
        version: options.version ?? CACHE_VERSION
      }

      const serialized = JSON.stringify(entry)
      const size = this.getSize(serialized)

      // Check if adding this entry would exceed size limit
      if (size > MAX_CACHE_SIZE) {
        console.warn(`Cache entry too large: ${size} bytes`)
        return false
      }

      // Clean up expired entries before adding new one
      this.cleanupExpired()

      // Check total cache size and cleanup if needed
      const stats = this.getStats()
      if (stats.totalSize + size > MAX_CACHE_SIZE) {
        this.evictOldest(size)
      }

      localStorage.setItem(this.getKey(key), serialized)
      return true
    } catch (error) {
      console.error('Failed to set cache entry:', error)
      return false
    }
  }

  /**
   * Get cache entry with expiration check
   */
  get<T>(key: string): T | null {
    if (!this.isStorageAvailable()) {
      return null
    }

    try {
      const stored = localStorage.getItem(this.getKey(key))
      if (!stored) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(stored)
      const now = Date.now()

      // Check if entry has expired
      if (entry.expiresAt && now > entry.expiresAt) {
        this.remove(key)
        return null
      }

      // Check version compatibility
      if (entry.version && entry.version !== CACHE_VERSION) {
        this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error('Failed to get cache entry:', error)
      // Remove corrupted entry
      this.remove(key)
      return null
    }
  }

  /**
   * Get cache entry with metadata
   */
  getWithMetadata<T>(key: string): { data: T; metadata: Omit<CacheEntry, 'data'> } | null {
    if (!this.isStorageAvailable()) {
      return null
    }

    try {
      const stored = localStorage.getItem(this.getKey(key))
      if (!stored) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(stored)
      const now = Date.now()

      // Check if entry has expired
      if (entry.expiresAt && now > entry.expiresAt) {
        this.remove(key)
        return null
      }

      // Check version compatibility
      if (entry.version && entry.version !== CACHE_VERSION) {
        this.remove(key)
        return null
      }

      return {
        data: entry.data,
        metadata: {
          timestamp: entry.timestamp,
          expiresAt: entry.expiresAt,
          version: entry.version
        }
      }
    } catch (error) {
      console.error('Failed to get cache entry with metadata:', error)
      this.remove(key)
      return null
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Check if cache entry is stale (older than threshold)
   */
  isStale(key: string, staleThreshold: number = DEFAULT_TTL): boolean {
    const entry = this.getWithMetadata(key)
    if (!entry) {
      return true
    }

    const age = Date.now() - entry.metadata.timestamp
    return age > staleThreshold
  }

  /**
   * Get age of cache entry in milliseconds
   */
  getAge(key: string): number | null {
    const entry = this.getWithMetadata(key)
    if (!entry) {
      return null
    }

    return Date.now() - entry.metadata.timestamp
  }

  /**
   * Remove cache entry
   */
  remove(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      localStorage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error('Failed to remove cache entry:', error)
      return false
    }
  }

  /**
   * Clear all cache entries with this prefix
   */
  clear(): boolean {
    if (!this.isStorageAvailable()) {
      return false
    }

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    }
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    if (!this.isStorageAvailable()) {
      return []
    }

    try {
      const keys = Object.keys(localStorage)
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length))
    } catch (error) {
      console.error('Failed to get cache keys:', error)
      return []
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): number {
    if (!this.isStorageAvailable()) {
      return 0
    }

    let cleanedCount = 0
    const now = Date.now()

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry: CacheEntry = JSON.parse(stored)
              if (entry.expiresAt && now > entry.expiresAt) {
                localStorage.removeItem(key)
                cleanedCount++
              }
            }
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(key)
            cleanedCount++
          }
        }
      })
    } catch (error) {
      console.error('Failed to cleanup expired entries:', error)
    }

    return cleanedCount
  }

  /**
   * Evict oldest entries to make space
   */
  evictOldest(requiredSpace: number): number {
    if (!this.isStorageAvailable()) {
      return 0
    }

    let evictedCount = 0
    let freedSpace = 0

    try {
      const entries: Array<{ key: string; timestamp: number; size: number }> = []

      // Collect all entries with timestamps
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry: CacheEntry = JSON.parse(stored)
              entries.push({
                key,
                timestamp: entry.timestamp,
                size: this.getSize(stored)
              })
            }
          } catch {
            // Remove corrupted entries
            localStorage.removeItem(key)
            evictedCount++
          }
        }
      })

      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp)

      // Remove oldest entries until we have enough space
      for (const entry of entries) {
        if (freedSpace >= requiredSpace) {
          break
        }

        localStorage.removeItem(entry.key)
        freedSpace += entry.size
        evictedCount++
      }
    } catch (error) {
      console.error('Failed to evict oldest entries:', error)
    }

    return evictedCount
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    if (!this.isStorageAvailable()) {
      return {
        totalEntries: 0,
        totalSize: 0
      }
    }

    let totalEntries = 0
    let totalSize = 0
    let oldestEntry: number | undefined
    let newestEntry: number | undefined

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry: CacheEntry = JSON.parse(stored)
              totalEntries++
              totalSize += this.getSize(stored)

              if (!oldestEntry || entry.timestamp < oldestEntry) {
                oldestEntry = entry.timestamp
              }
              if (!newestEntry || entry.timestamp > newestEntry) {
                newestEntry = entry.timestamp
              }
            }
          } catch {
            // Skip corrupted entries
          }
        }
      })
    } catch (error) {
      console.error('Failed to get cache stats:', error)
    }

    return {
      totalEntries,
      totalSize,
      oldestEntry,
      newestEntry
    }
  }
}

// ============================================================================
// Offline Detection Utilities
// ============================================================================

export interface OfflineState {
  isOnline: boolean
  wasOffline: boolean
  offlineSince?: number
  lastOnlineAt?: number
}

export class OfflineDetector {
  private listeners: Set<(state: OfflineState) => void> = new Set()
  private state: OfflineState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false
  }

  constructor() {
    this.setupEventListeners()
    this.loadPersistedState()
  }

  /**
   * Setup online/offline event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      const now = Date.now()
      this.state = {
        isOnline: true,
        wasOffline: this.state.wasOffline || !this.state.isOnline,
        lastOnlineAt: now,
        offlineSince: undefined
      }
      this.persistState()
      this.notifyListeners()
    }

    const handleOffline = () => {
      const now = Date.now()
      this.state = {
        isOnline: false,
        wasOffline: true,
        offlineSince: now,
        lastOnlineAt: this.state.lastOnlineAt
      }
      this.persistState()
      this.notifyListeners()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Also check connection periodically
    setInterval(() => {
      const currentOnlineState = navigator.onLine
      if (currentOnlineState !== this.state.isOnline) {
        if (currentOnlineState) {
          handleOnline()
        } else {
          handleOffline()
        }
      }
    }, 5000) // Check every 5 seconds
  }

  /**
   * Load persisted offline state
   */
  private loadPersistedState(): void {
    try {
      const stored = localStorage.getItem('offline-detector-state')
      if (stored) {
        const persistedState = JSON.parse(stored)
        this.state = {
          ...this.state,
          wasOffline: persistedState.wasOffline || false,
          lastOnlineAt: persistedState.lastOnlineAt,
          offlineSince: persistedState.offlineSince
        }
      }
    } catch (error) {
      console.error('Failed to load persisted offline state:', error)
    }
  }

  /**
   * Persist offline state
   */
  private persistState(): void {
    try {
      localStorage.setItem('offline-detector-state', JSON.stringify({
        wasOffline: this.state.wasOffline,
        lastOnlineAt: this.state.lastOnlineAt,
        offlineSince: this.state.offlineSince
      }))
    } catch (error) {
      console.error('Failed to persist offline state:', error)
    }
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('Error in offline state listener:', error)
      }
    })
  }

  /**
   * Get current offline state
   */
  getState(): OfflineState {
    return { ...this.state }
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.state.isOnline
  }

  /**
   * Check if was offline at some point
   */
  wasOffline(): boolean {
    return this.state.wasOffline
  }

  /**
   * Get offline duration in milliseconds
   */
  getOfflineDuration(): number | null {
    if (!this.state.offlineSince) {
      return null
    }
    return Date.now() - this.state.offlineSince
  }

  /**
   * Get time since last online in milliseconds
   */
  getTimeSinceOnline(): number | null {
    if (!this.state.lastOnlineAt) {
      return null
    }
    return Date.now() - this.state.lastOnlineAt
  }

  /**
   * Subscribe to offline state changes
   */
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Reset offline state (for testing)
   */
  reset(): void {
    this.state = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      wasOffline: false
    }
    this.persistState()
    this.notifyListeners()
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const clientCache = new ClientCacheManager()
export const offlineDetector = new OfflineDetector()

// ============================================================================
// Cache Key Constants
// ============================================================================

export const CACHE_KEYS = {
  STUDENT_METRICS: (studentId: string) => `metrics:${studentId}`,
  WEEKLY_ATTENDANCE: (studentId: string, weekOffset: number) => 
    `attendance:${studentId}:week:${weekOffset}`,
  ATTENDANCE_HISTORY: (studentId: string, filters?: string) => 
    `attendance-history:${studentId}${filters ? `:${filters}` : ''}`,
  CLASS_INFO: (studentId: string) => `class-info:${studentId}`,
  ACADEMIC_STATUS: (studentId: string) => `academic-status:${studentId}`,
  NOTIFICATIONS: (studentId: string) => `notifications:${studentId}`,
} as const

// ============================================================================
// Cache TTL Constants
// ============================================================================

export const CACHE_TTL = {
  STUDENT_METRICS: 5 * 60 * 1000,      // 5 minutes
  WEEKLY_ATTENDANCE: 2 * 60 * 1000,    // 2 minutes
  ATTENDANCE_HISTORY: 10 * 60 * 1000,  // 10 minutes
  CLASS_INFO: 30 * 60 * 1000,          // 30 minutes
  ACADEMIC_STATUS: 5 * 60 * 1000,      // 5 minutes
  NOTIFICATIONS: 1 * 60 * 1000,        // 1 minute
  STALENESS_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours
} as const