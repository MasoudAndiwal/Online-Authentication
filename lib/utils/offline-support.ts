/**
 * Offline Support Utilities
 * Provides offline detection, sync queue, and service worker integration
 */

import * as React from 'react'

/**
 * Network status detection
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Sync Queue Item
 */
export interface SyncQueueItem {
  id: string
  type: string
  data: unknown
  timestamp: number
  retryCount: number
  maxRetries: number
}

/**
 * Sync Queue Manager
 * Queues operations when offline and syncs when back online
 */
export class SyncQueue {
  private queue: SyncQueueItem[] = []
  private storageKey = 'teacher-dashboard-sync-queue'
  private isSyncing = false
  private listeners: Set<(queue: SyncQueueItem[]) => void> = new Set()

  constructor() {
    this.loadQueue()
    this.setupOnlineListener()
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.queue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  /**
   * Setup online event listener
   */
  private setupOnlineListener() {
    if (typeof window === 'undefined') return

    window.addEventListener('online', () => {
      this.processQueue()
    })
  }

  /**
   * Add item to queue
   */
  add(type: string, data: unknown, maxRetries: number = 3): string {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const item: SyncQueueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    }

    this.queue.push(item)
    this.saveQueue()

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }

    return id
  }

  /**
   * Remove item from queue
   */
  remove(id: string) {
    this.queue = this.queue.filter(item => item.id !== id)
    this.saveQueue()
  }

  /**
   * Get all queued items
   */
  getAll(): SyncQueueItem[] {
    return [...this.queue]
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length
  }

  /**
   * Clear entire queue
   */
  clear() {
    this.queue = []
    this.saveQueue()
  }

  /**
   * Process queue
   */
  async processQueue() {
    if (this.isSyncing || !navigator.onLine || this.queue.length === 0) {
      return
    }

    this.isSyncing = true

    // Process items one by one
    const itemsToProcess = [...this.queue]
    
    for (const item of itemsToProcess) {
      try {
        await this.processItem(item)
        this.remove(item.id)
      } catch (error) {
        console.error('Failed to process sync item:', error)
        
        // Increment retry count
        item.retryCount++
        
        // Remove if max retries reached
        if (item.retryCount >= item.maxRetries) {
          console.error('Max retries reached for item:', item.id)
          this.remove(item.id)
        } else {
          this.saveQueue()
        }
      }
    }

    this.isSyncing = false
  }

  /**
   * Process individual item (override this method)
   */
  protected async processItem(_item: SyncQueueItem): Promise<void> {
    // This should be overridden by specific implementations
    throw new Error('processItem must be implemented')
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (queue: SyncQueueItem[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify listeners of queue changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getAll()))
  }
}

/**
 * Attendance Sync Queue
 * Specialized queue for attendance data
 */
export class AttendanceSyncQueue extends SyncQueue {
  protected async processItem(item: SyncQueueItem): Promise<void> {
    if (item.type === 'attendance-update') {
      // Make API call to sync attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.data)
      })

      if (!response.ok) {
        throw new Error(`Failed to sync attendance: ${response.statusText}`)
      }
    }
  }
}

/**
 * React Hook for Sync Queue
 */
export function useSyncQueue(queue: SyncQueue) {
  const [queueItems, setQueueItems] = React.useState<SyncQueueItem[]>(queue.getAll())
  const [isSyncing, setIsSyncing] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = queue.subscribe(setQueueItems)
    return () => {
      unsubscribe()
    }
  }, [queue])

  const addToQueue = React.useCallback(
    (type: string, data: unknown, maxRetries?: number) => {
      return queue.add(type, data, maxRetries)
    },
    [queue]
  )

  const processQueue = React.useCallback(async () => {
    setIsSyncing(true)
    await queue.processQueue()
    setIsSyncing(false)
  }, [queue])

  const clearQueue = React.useCallback(() => {
    queue.clear()
  }, [queue])

  return {
    queueItems,
    queueSize: queueItems.length,
    isSyncing,
    addToQueue,
    processQueue,
    clearQueue
  }
}

/**
 * Offline Indicator Component Hook
 */
export function useOfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showIndicator, setShowIndicator] = React.useState(false)

  React.useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true)
    } else {
      // Hide indicator after a delay when back online
      const timer = setTimeout(() => setShowIndicator(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  return {
    isOnline,
    showIndicator
  }
}

/**
 * Service Worker Registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    // Service Worker registered successfully

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available - can trigger update notification
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Cache Management
 */
export class CacheManager {
  private cacheName = 'teacher-dashboard-cache-v1'

  /**
   * Cache data
   */
  async set(key: string, data: unknown, ttl?: number): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(`cache:${key}`, JSON.stringify(item))
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(`cache:${key}`)
      if (!stored) return null

      const item = JSON.parse(stored)
      
      // Check if expired
      if (item.ttl && Date.now() - item.timestamp > item.ttl) {
        this.remove(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Failed to get cached data:', error)
      return null
    }
  }

  /**
   * Remove cached data
   */
  async remove(key: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(`cache:${key}`)
    } catch (error) {
      console.error('Failed to remove cached data:', error)
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache:')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }
}

/**
 * React Hook for Cache
 */
export function useCache<T>(key: string, ttl?: number) {
  const cacheManager = React.useMemo(() => new CacheManager(), [])
  const [cachedData, setCachedData] = React.useState<T | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadCache() {
      const data = await cacheManager.get<T>(key)
      setCachedData(data)
      setIsLoading(false)
    }
    loadCache()
  }, [key, cacheManager])

  const setCache = React.useCallback(
    async (data: T) => {
      await cacheManager.set(key, data, ttl)
      setCachedData(data)
    },
    [key, ttl, cacheManager]
  )

  const clearCache = React.useCallback(async () => {
    await cacheManager.remove(key)
    setCachedData(null)
  }, [key, cacheManager])

  return {
    cachedData,
    isLoading,
    setCache,
    clearCache
  }
}
