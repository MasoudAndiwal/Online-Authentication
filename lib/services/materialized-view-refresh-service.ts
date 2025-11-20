/**
 * Materialized View Refresh Service
 * 
 * This service manages the scheduled refresh of database materialized views
 * to ensure dashboard statistics remain up-to-date.
 * 
 * Requirements: 1.3, 3.1, 3.3
 */

import cron from 'node-cron'
import { supabase } from '@/lib/supabase'

interface RefreshResult {
  success: boolean
  timestamp: Date
  duration: number
  error?: string
}

interface RefreshStats {
  totalRefreshes: number
  successfulRefreshes: number
  failedRefreshes: number
  lastRefresh: Date | null
  lastError: string | null
  averageDuration: number
}

class MaterializedViewRefreshService {
  private static instance: MaterializedViewRefreshService
  private refreshTask: cron.ScheduledTask | null = null
  private stats: RefreshStats = {
    totalRefreshes: 0,
    successfulRefreshes: 0,
    failedRefreshes: 0,
    lastRefresh: null,
    lastError: null,
    averageDuration: 0
  }
  private durations: number[] = []

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): MaterializedViewRefreshService {
    if (!MaterializedViewRefreshService.instance) {
      MaterializedViewRefreshService.instance = new MaterializedViewRefreshService()
    }
    return MaterializedViewRefreshService.instance
  }

  /**
   * Refresh the class_statistics materialized view
   * This is the core operation that updates pre-computed statistics
   */
  public async refreshClassStatistics(): Promise<RefreshResult> {
    const startTime = Date.now()
    
    try {
      console.log('[MaterializedViewRefresh] Starting refresh of class_statistics view...')
      
      // Call the PostgreSQL function to refresh the materialized view
      const { error } = await supabase.rpc('refresh_class_statistics')
      
      if (error) {
        throw new Error(`Failed to refresh materialized view: ${error.message}`)
      }
      
      const duration = Date.now() - startTime
      
      // Update statistics
      this.stats.totalRefreshes++
      this.stats.successfulRefreshes++
      this.stats.lastRefresh = new Date()
      this.stats.lastError = null
      this.durations.push(duration)
      
      // Keep only last 100 durations for average calculation
      if (this.durations.length > 100) {
        this.durations.shift()
      }
      
      this.stats.averageDuration = 
        this.durations.reduce((a, b) => a + b, 0) / this.durations.length
      
      console.log(
        `[MaterializedViewRefresh] Successfully refreshed class_statistics view in ${duration}ms`
      )
      
      return {
        success: true,
        timestamp: new Date(),
        duration
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update statistics
      this.stats.totalRefreshes++
      this.stats.failedRefreshes++
      this.stats.lastError = errorMessage
      
      console.error(
        `[MaterializedViewRefresh] Failed to refresh class_statistics view:`,
        errorMessage
      )
      
      return {
        success: false,
        timestamp: new Date(),
        duration,
        error: errorMessage
      }
    }
  }

  /**
   * Check if the materialized view is stale (older than 10 minutes)
   */
  public async isViewStale(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_class_statistics_stale')
      
      if (error) {
        console.error('[MaterializedViewRefresh] Error checking view staleness:', error)
        return true // Assume stale if we can't check
      }
      
      return data as boolean
    } catch (error) {
      console.error('[MaterializedViewRefresh] Error checking view staleness:', error)
      return true // Assume stale if we can't check
    }
  }

  /**
   * Get the age of the materialized view
   */
  public async getViewAge(): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_class_statistics_age')
      
      if (error) {
        console.error('[MaterializedViewRefresh] Error getting view age:', error)
        return null
      }
      
      return data as string
    } catch (error) {
      console.error('[MaterializedViewRefresh] Error getting view age:', error)
      return null
    }
  }

  /**
   * Start the scheduled refresh job
   * Runs every 10 minutes as per requirements
   */
  public startScheduledRefresh(): void {
    if (this.refreshTask) {
      console.log('[MaterializedViewRefresh] Scheduled refresh is already running')
      return
    }

    // Schedule refresh every 10 minutes
    // Cron pattern: '*/10 * * * *' means "every 10 minutes"
    this.refreshTask = cron.schedule('*/10 * * * *', async () => {
      console.log('[MaterializedViewRefresh] Scheduled refresh triggered')
      await this.refreshClassStatistics()
    })

    console.log('[MaterializedViewRefresh] Scheduled refresh started (every 10 minutes)')
    
    // Perform initial refresh
    this.refreshClassStatistics().catch(error => {
      console.error('[MaterializedViewRefresh] Initial refresh failed:', error)
    })
  }

  /**
   * Stop the scheduled refresh job
   */
  public stopScheduledRefresh(): void {
    if (this.refreshTask) {
      this.refreshTask.stop()
      this.refreshTask = null
      console.log('[MaterializedViewRefresh] Scheduled refresh stopped')
    }
  }

  /**
   * Get refresh statistics
   */
  public getStats(): RefreshStats {
    return { ...this.stats }
  }

  /**
   * Reset statistics (useful for testing)
   */
  public resetStats(): void {
    this.stats = {
      totalRefreshes: 0,
      successfulRefreshes: 0,
      failedRefreshes: 0,
      lastRefresh: null,
      lastError: null,
      averageDuration: 0
    }
    this.durations = []
  }

  /**
   * Check if the scheduled refresh is running
   */
  public isRunning(): boolean {
    return this.refreshTask !== null
  }
}

// Export singleton instance
export const materializedViewRefreshService = MaterializedViewRefreshService.getInstance()

// Export class for testing
export { MaterializedViewRefreshService }
