/**
 * Resource Monitor Service Tests
 * 
 * Tests for resource monitoring, degradation, and health checks.
 * Requirements: 10.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  ResourceMonitorService, 
  getResourceMonitor, 
  initializeResourceMonitoring,
  getSystemHealthCheck,
  isSystemUnderPressure
} from '../resource-monitor'

describe('ResourceMonitorService', () => {
  let monitor: ResourceMonitorService

  beforeEach(() => {
    monitor = new ResourceMonitorService()
  })

  afterEach(async () => {
    if (monitor) {
      await monitor.shutdown()
    }
  })

  describe('Initialization', () => {
    it('should initialize without errors', async () => {
      await expect(monitor.initialize()).resolves.not.toThrow()
    })

    it('should not initialize multiple times', async () => {
      await monitor.initialize()
      await expect(monitor.initialize()).resolves.not.toThrow()
    })
  })

  describe('Resource Metrics Collection', () => {
    it('should collect resource metrics', async () => {
      await monitor.initialize()
      const history = monitor.getMetricsHistory(1)
      
      expect(history).toHaveLength(1)
      expect(history[0]).toHaveProperty('cpu')
      expect(history[0]).toHaveProperty('memory')
      expect(history[0]).toHaveProperty('process')
      expect(history[0].cpu).toHaveProperty('usage')
      expect(history[0].memory).toHaveProperty('usagePercent')
    })

    it('should maintain metrics history', async () => {
      await monitor.initialize()
      
      // Wait for a few metrics collections
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const history = monitor.getMetricsHistory()
      expect(history.length).toBeGreaterThan(0)
    })
  })

  describe('Degradation Management', () => {
    it('should start in healthy state', () => {
      const degradation = monitor.getDegradationState()
      expect(degradation.isActive).toBe(false)
      expect(degradation.level).toBe('none')
      expect(degradation.disabledFeatures).toHaveLength(0)
    })

    it('should trigger degradation manually', async () => {
      await monitor.triggerDegradation('moderate', 'Test degradation')
      
      const degradation = monitor.getDegradationState()
      expect(degradation.isActive).toBe(true)
      expect(degradation.level).toBe('moderate')
      expect(degradation.reason).toBe('Test degradation')
      expect(degradation.disabledFeatures.length).toBeGreaterThan(0)
    })

    it('should recover from degradation', async () => {
      await monitor.triggerDegradation('severe', 'Test severe degradation')
      await monitor.triggerRecovery()
      
      const degradation = monitor.getDegradationState()
      expect(degradation.isActive).toBe(false)
      expect(degradation.level).toBe('none')
      expect(degradation.disabledFeatures).toHaveLength(0)
    })

    it('should disable features based on degradation level', async () => {
      // Test light degradation
      await monitor.triggerDegradation('light', 'Light test')
      let degradation = monitor.getDegradationState()
      expect(degradation.disabledFeatures).toContain('analytics')
      
      // Test moderate degradation
      await monitor.triggerDegradation('moderate', 'Moderate test')
      degradation = monitor.getDegradationState()
      expect(degradation.disabledFeatures).toContain('analytics')
      expect(degradation.disabledFeatures).toContain('recommendations')
      
      // Test severe degradation
      await monitor.triggerDegradation('severe', 'Severe test')
      degradation = monitor.getDegradationState()
      expect(degradation.disabledFeatures).toContain('analytics')
      expect(degradation.disabledFeatures).toContain('recommendations')
      expect(degradation.disabledFeatures).toContain('file-processing')
    })
  })

  describe('Health Checks', () => {
    it('should provide comprehensive health check', async () => {
      await monitor.initialize()
      const health = await monitor.getHealthCheck()
      
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('timestamp')
      expect(health).toHaveProperty('metrics')
      expect(health).toHaveProperty('degradation')
      expect(health).toHaveProperty('alerts')
      expect(health).toHaveProperty('recommendations')
      
      expect(['healthy', 'degraded', 'critical']).toContain(health.status)
    })

    it('should report healthy status initially', async () => {
      await monitor.initialize()
      const isHealthy = await monitor.isHealthy()
      expect(isHealthy).toBe(true)
    })

    it('should report degraded status when degradation is active', async () => {
      await monitor.initialize()
      await monitor.triggerDegradation('moderate', 'Test')
      
      const health = await monitor.getHealthCheck()
      expect(health.status).toBe('degraded')
    })

    it('should report critical status for severe degradation', async () => {
      await monitor.initialize()
      await monitor.triggerDegradation('severe', 'Test')
      
      const health = await monitor.getHealthCheck()
      expect(health.status).toBe('critical')
    })
  })

  describe('Threshold Management', () => {
    it('should use default thresholds', () => {
      const thresholds = monitor.getThresholds()
      expect(thresholds.cpu.warning).toBe(70)
      expect(thresholds.cpu.critical).toBe(85)
      expect(thresholds.memory.warning).toBe(75)
      expect(thresholds.memory.critical).toBe(90)
    })

    it('should allow threshold updates', () => {
      const newThresholds = {
        cpu: { warning: 60, critical: 80, recovery: 50 },
        memory: { warning: 70, critical: 85, recovery: 60 }
      }
      
      monitor.updateThresholds(newThresholds)
      const thresholds = monitor.getThresholds()
      
      expect(thresholds.cpu.warning).toBe(60)
      expect(thresholds.cpu.critical).toBe(80)
      expect(thresholds.memory.warning).toBe(70)
      expect(thresholds.memory.critical).toBe(85)
    })
  })

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await monitor.initialize()
      await expect(monitor.shutdown()).resolves.not.toThrow()
    })

    it('should recover from degradation on shutdown', async () => {
      await monitor.initialize()
      await monitor.triggerDegradation('severe', 'Test')
      await monitor.shutdown()
      
      const degradation = monitor.getDegradationState()
      expect(degradation.isActive).toBe(false)
    })
  })
})

describe('Global Functions', () => {
  afterEach(async () => {
    const monitor = getResourceMonitor()
    await monitor.shutdown()
  })

  describe('getResourceMonitor', () => {
    it('should return singleton instance', () => {
      const monitor1 = getResourceMonitor()
      const monitor2 = getResourceMonitor()
      expect(monitor1).toBe(monitor2)
    })
  })

  describe('initializeResourceMonitoring', () => {
    it('should initialize with custom thresholds', async () => {
      const customThresholds = {
        cpu: { warning: 60, critical: 80, recovery: 50 }
      }
      
      await expect(initializeResourceMonitoring(customThresholds)).resolves.not.toThrow()
      
      const monitor = getResourceMonitor()
      const thresholds = monitor.getThresholds()
      expect(thresholds.cpu.warning).toBe(60)
    })
  })

  describe('getSystemHealthCheck', () => {
    it('should return system health', async () => {
      await initializeResourceMonitoring()
      const health = await getSystemHealthCheck()
      
      expect(health).toHaveProperty('status')
      expect(health).toHaveProperty('metrics')
      expect(health).toHaveProperty('degradation')
    })
  })

  describe('isSystemUnderPressure', () => {
    it('should return false for healthy system', async () => {
      await initializeResourceMonitoring()
      const underPressure = await isSystemUnderPressure()
      expect(typeof underPressure).toBe('boolean')
    })
  })
})