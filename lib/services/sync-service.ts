/**
 * Sync Service for Offline Data Management
 * Handles background synchronization and conflict resolution
 * 
 * Requirements: 6.4
 */

import { clientCache, offlineDetector, CACHE_KEYS, CACHE_TTL } from '@/lib/utils/client-cache'

// ============================================================================
// Types
// ============================================================================

export interface SyncOperation {
  id: string
  type: 'fetch' | 'update' | 'delete'
  resource: string
  data?: any
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'high' | 'normal' | 'low'
}

export interface SyncResult {
  success: boolean
  operation: SyncOperation
  error?: Error
  data?: any
}

export interface SyncStats {
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  lastSyncTime: number
  isOnline: boolean
  queueSize: number
}

// ============================================================================
// Sync Queue Manager
// ============================================================================

export class SyncQueueManager {
  private queue: SyncOperation[] = []
  private isProcessing = false
  private listeners: Set<(stats: SyncStats) => void> = new Set()
  private storageKey = 'student-dashboard-sync-queue'
  private stats: SyncStats = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    lastSyncTime: 0,
    isOnline: true,
    queueSize: 0
  }

  constructor() {
    this.loadQueue()
    this.setupOfflineListener()
    this.startPeriodicSync()
  }

  /**
   * Load sync queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.queue = JSON.parse(stored)
        this.updateStats()
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
      this.updateStats()
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  /**
   * Setup offline event listener
   */
  private setupOfflineListener(): void {
    offlineDetector.subscribe((state) => {
      this.stats.isOnline = state.isOnline
      
      // Process queue when coming back online
      if (state.isOnline && state.wasOffline) {
        console.log('🌐 Connection restored, processing sync queue...')
        this.processQueue()
      }
      
      this.notifyListeners()
    })
  }

  /**
   * Start periodic sync processing
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (offlineDetector.isOnline() && this.queue.length > 0) {
        this.processQueue()
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Add operation to sync queue
   */
  addOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const syncOperation: SyncOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0
    }

    // Insert based on priority
    const insertIndex = this.queue.findIndex(op => 
      this.getPriorityValue(op.priority) < this.getPriorityValue(operation.priority)
    )
    
    if (insertIndex === -1) {
      this.queue.push(syncOperation)
    } else {
      this.queue.splice(insertIndex, 0, syncOperation)
    }

    this.saveQueue()

    // Try to process immediately if online
    if (offlineDetector.isOnline()) {
      this.processQueue()
    }

    return id
  }

  /**
   * Get numeric priority value for sorting
   */
  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 3
      case 'normal': return 2
      case 'low': return 1
      default: return 2
    }
  }

  /**
   * Remove operation from queue
   */
  removeOperation(id: string): void {
    this.queue = this.queue.filter(op => op.id !== id)
    this.saveQueue()
  }

  /**
   * Process sync queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !offlineDetector.isOnline() || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    console.log(`📤 Processing ${this.queue.length} sync operations...`)

    const operationsToProcess = [...this.queue]
    
    for (const operation of operationsToProcess) {
      try {
        const result = await this.processOperation(operation)
        
        if (result.success) {
          this.removeOperation(operation.id)
          this.stats.successfulOperations++
          console.log(`✅ Sync operation completed: ${operation.type} ${operation.resource}`)
        } else {
          // Increment retry count
          operation.retryCount++
          
          if (operation.retryCount >= operation.maxRetries) {
            console.error(`❌ Max retries reached for operation: ${operation.id}`)
            this.removeOperation(operation.id)
            this.stats.failedOperations++
          } else {
            console.warn(`⚠️ Retry ${operation.retryCount}/${operation.maxRetries} for operation: ${operation.id}`)
            this.saveQueue()
          }
        }
      } catch (error) {
        console.error(`❌ Sync operation failed: ${operation.id}`, error)
        operation.retryCount++
        
        if (operation.retryCount >= operation.maxRetries) {
          this.removeOperation(operation.id)
          this.stats.failedOperations++
        } else {
          this.saveQueue()
        }
      }
    }

    this.stats.lastSyncTime = Date.now()
    this.isProcessing = false
    this.notifyListeners()
  }

  /**
   * Process individual sync operation
   */
  private async processOperation(operation: SyncOperation): Promise<SyncResult> {
    switch (operation.type) {
      case 'fetch':
        return this.processFetchOperation(operation)
      case 'update':
        return this.processUpdateOperation(operation)
      case 'delete':
        return this.processDeleteOperation(operation)
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }
  }

  /**
   * Process fetch operation
   */
  private async processFetchOperation(operation: SyncOperation): Promise<SyncResult> {
    try {
      const response = await fetch(operation.resource, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Update cache with fresh data
      if (operation.data?.cacheKey) {
        clientCache.set(operation.data.cacheKey, data, { ttl: operation.data.ttl })
      }

      return {
        success: true,
        operation,
        data
      }
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Process update operation
   */
  private async processUpdateOperation(operation: SyncOperation): Promise<SyncResult> {
    try {
      const response = await fetch(operation.resource, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(operation.data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        success: true,
        operation,
        data
      }
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Process delete operation
   */
  private async processDeleteOperation(operation: SyncOperation): Promise<SyncResult> {
    try {
      const response = await fetch(operation.resource, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        success: true,
        operation
      }
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.queueSize = this.queue.length
    this.stats.totalOperations = this.stats.successfulOperations + this.stats.failedOperations + this.queue.length
  }

  /**
   * Notify listeners of stats changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.stats)
      } catch (error) {
        console.error('Error in sync stats listener:', error)
      }
    })
  }

  /**
   * Subscribe to sync stats changes
   */
  subscribe(listener: (stats: SyncStats) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Get current sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats }
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.queue = []
    this.saveQueue()
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }
}

// ============================================================================
// Student Data Sync Service
// ============================================================================

export class StudentDataSyncService {
  private syncQueue: SyncQueueManager
  private studentId?: string

  constructor(studentId?: string) {
    this.syncQueue = new SyncQueueManager()
    this.studentId = studentId
  }

  /**
   * Set student ID for sync operations
   */
  setStudentId(studentId: string): void {
    this.studentId = studentId
  }

  /**
   * Sync dashboard metrics
   */
  syncDashboardMetrics(priority: 'high' | 'normal' | 'low' = 'normal'): string {
    if (!this.studentId) {
      throw new Error('Student ID not set')
    }

    return this.syncQueue.addOperation({
      type: 'fetch',
      resource: `/api/students/dashboard?studentId=${this.studentId}`,
      priority,
      maxRetries: 3,
      data: {
        cacheKey: CACHE_KEYS.STUDENT_METRICS(this.studentId),
        ttl: CACHE_TTL.STUDENT_METRICS
      }
    })
  }

  /**
   * Sync weekly attendance
   */
  syncWeeklyAttendance(weekOffset: number = 0, priority: 'high' | 'normal' | 'low' = 'normal'): string {
    if (!this.studentId) {
      throw new Error('Student ID not set')
    }

    // Calculate date range
    const today = new Date()
    const currentDay = today.getDay()
    const diff = currentDay === 6 ? 0 : currentDay === 0 ? -1 : currentDay + 1
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - diff + (weekOffset * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 4)

    return this.syncQueue.addOperation({
      type: 'fetch',
      resource: `/api/students/attendance/weekly?studentId=${this.studentId}&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
      priority,
      maxRetries: 3,
      data: {
        cacheKey: CACHE_KEYS.WEEKLY_ATTENDANCE(this.studentId, weekOffset),
        ttl: CACHE_TTL.WEEKLY_ATTENDANCE
      }
    })
  }

  /**
   * Sync academic status
   */
  syncAcademicStatus(priority: 'high' | 'normal' | 'low' = 'normal'): string {
    if (!this.studentId) {
      throw new Error('Student ID not set')
    }

    return this.syncQueue.addOperation({
      type: 'fetch',
      resource: `/api/students/${this.studentId}/academic-status`,
      priority,
      maxRetries: 3,
      data: {
        cacheKey: CACHE_KEYS.ACADEMIC_STATUS(this.studentId),
        ttl: CACHE_TTL.ACADEMIC_STATUS
      }
    })
  }

  /**
   * Sync all student data
   */
  syncAllData(priority: 'high' | 'normal' | 'low' = 'high'): string[] {
    return [
      this.syncDashboardMetrics(priority),
      this.syncWeeklyAttendance(0, priority),
      this.syncAcademicStatus(priority)
    ]
  }

  /**
   * Subscribe to sync statistics
   */
  subscribe(listener: (stats: SyncStats) => void): () => void {
    return this.syncQueue.subscribe(listener)
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    return this.syncQueue.getStats()
  }

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<void> {
    await this.syncQueue.processQueue()
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const studentDataSync = new StudentDataSyncService()