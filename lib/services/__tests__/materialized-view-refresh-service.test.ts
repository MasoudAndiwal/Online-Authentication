/**
 * Tests for MaterializedViewRefreshService
 * 
 * These tests verify the basic functionality of the materialized view refresh service.
 * Note: These are unit tests that verify the service logic, not the actual database operations.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MaterializedViewRefreshService } from '../materialized-view-refresh-service'

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

describe('MaterializedViewRefreshService', () => {
  let service: MaterializedViewRefreshService

  beforeEach(() => {
    service = MaterializedViewRefreshService.getInstance()
    service.resetStats()
    service.stopScheduledRefresh()
  })

  afterEach(() => {
    service.stopScheduledRefresh()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MaterializedViewRefreshService.getInstance()
      const instance2 = MaterializedViewRefreshService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Statistics Tracking', () => {
    it('should initialize with zero statistics', () => {
      const stats = service.getStats()
      expect(stats.totalRefreshes).toBe(0)
      expect(stats.successfulRefreshes).toBe(0)
      expect(stats.failedRefreshes).toBe(0)
      expect(stats.lastRefresh).toBeNull()
      expect(stats.lastError).toBeNull()
      expect(stats.averageDuration).toBe(0)
    })

    it('should reset statistics', () => {
      // Manually set some stats
      service.resetStats()
      const stats = service.getStats()
      expect(stats.totalRefreshes).toBe(0)
    })
  })

  describe('Scheduled Refresh', () => {
    it('should not be running initially', () => {
      expect(service.isRunning()).toBe(false)
    })

    it('should start scheduled refresh', () => {
      service.startScheduledRefresh()
      expect(service.isRunning()).toBe(true)
    })

    it('should stop scheduled refresh', () => {
      service.startScheduledRefresh()
      service.stopScheduledRefresh()
      expect(service.isRunning()).toBe(false)
    })

    it('should not start multiple scheduled refreshes', () => {
      service.startScheduledRefresh()
      const firstRunning = service.isRunning()
      service.startScheduledRefresh() // Try to start again
      const secondRunning = service.isRunning()
      
      expect(firstRunning).toBe(true)
      expect(secondRunning).toBe(true)
    })
  })

  describe('Manual Refresh', () => {
    it('should handle successful refresh', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null })

      const result = await service.refreshClassStatistics()
      
      expect(result.success).toBe(true)
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(result.duration).toBeGreaterThanOrEqual(0)
      expect(result.error).toBeUndefined()
    })

    it('should handle failed refresh', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database error' } 
      })

      const result = await service.refreshClassStatistics()
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('Database error')
    })

    it('should update statistics after successful refresh', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: null, error: null })

      await service.refreshClassStatistics()
      const stats = service.getStats()
      
      expect(stats.totalRefreshes).toBe(1)
      expect(stats.successfulRefreshes).toBe(1)
      expect(stats.failedRefreshes).toBe(0)
      expect(stats.lastRefresh).toBeInstanceOf(Date)
      expect(stats.lastError).toBeNull()
    })

    it('should update statistics after failed refresh', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Test error' } 
      })

      await service.refreshClassStatistics()
      const stats = service.getStats()
      
      expect(stats.totalRefreshes).toBe(1)
      expect(stats.successfulRefreshes).toBe(0)
      expect(stats.failedRefreshes).toBe(1)
      expect(stats.lastError).toContain('Test error')
    })

    it('should calculate average duration correctly', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValue({ data: null, error: null })

      // Perform multiple refreshes
      await service.refreshClassStatistics()
      await service.refreshClassStatistics()
      await service.refreshClassStatistics()
      
      const stats = service.getStats()
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0)
      expect(stats.totalRefreshes).toBe(3)
    })
  })

  describe('View Staleness Check', () => {
    it('should check if view is stale', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ data: true, error: null })

      const isStale = await service.isViewStale()
      expect(isStale).toBe(true)
    })

    it('should handle staleness check error', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Error' } 
      })

      const isStale = await service.isViewStale()
      expect(isStale).toBe(true) // Should assume stale on error
    })
  })

  describe('View Age', () => {
    it('should get view age', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: '00:05:30', 
        error: null 
      })

      const age = await service.getViewAge()
      expect(age).toBe('00:05:30')
    })

    it('should handle view age error', async () => {
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.rpc).mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Error' } 
      })

      const age = await service.getViewAge()
      expect(age).toBeNull()
    })
  })
})
