/**
 * Health API Endpoint Tests
 * 
 * Tests for health check endpoints with resource monitoring.
 * Requirements: 10.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { GET as basicHealthGET } from '../route'
import { GET as detailedHealthGET, HEAD as detailedHealthHEAD } from '../detailed/route'
import { getResourceMonitor } from '@/lib/services/resource-monitor'

describe('Health API Endpoints', () => {
  let monitor: any

  beforeEach(async () => {
    monitor = getResourceMonitor()
    await monitor.initialize()
  })

  afterEach(async () => {
    if (monitor) {
      await monitor.shutdown()
    }
  })

  describe('Basic Health Endpoint (/api/health)', () => {
    it('should return healthy status by default', async () => {
      const response = await basicHealthGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('backgroundJobs')
      expect(data).toHaveProperty('degradation')
      expect(data.degradation).toHaveProperty('active')
      expect(data.degradation).toHaveProperty('level')
    })

    it('should report degraded status when system is degraded', async () => {
      // Trigger degradation
      await monitor.triggerDegradation('moderate', 'Test degradation')

      const response = await basicHealthGET()
      const data = await response.json()

      expect(data.status).toBe('degraded')
      expect(data.degradation.active).toBe(true)
      expect(data.degradation.level).toBe('moderate')
    })

    it('should report critical status for severe degradation', async () => {
      // Trigger severe degradation
      await monitor.triggerDegradation('severe', 'Test severe degradation')

      const response = await basicHealthGET()
      const data = await response.json()

      expect(data.status).toBe('critical')
      expect(data.degradation.active).toBe(true)
      expect(data.degradation.level).toBe('severe')
    })
  })

  describe('Detailed Health Endpoint (/api/health/detailed)', () => {
    it('should return comprehensive health information', async () => {
      const mockRequest = new Request('http://localhost:3000/api/health/detailed')
      const response = await detailedHealthGET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('system')
      expect(data).toHaveProperty('degradation')
      expect(data).toHaveProperty('services')
      expect(data).toHaveProperty('environment')

      // Check system metrics
      expect(data.system).toHaveProperty('status')
      expect(data.system).toHaveProperty('metrics')
      expect(data.system.metrics).toHaveProperty('cpu')
      expect(data.system.metrics).toHaveProperty('memory')
      expect(data.system.metrics).toHaveProperty('process')

      // Check degradation info
      expect(data.degradation).toHaveProperty('isActive')
      expect(data.degradation).toHaveProperty('level')
      expect(data.degradation).toHaveProperty('activeDuration')

      // Check services
      expect(data.services).toHaveProperty('backgroundJobs')
    })

    it('should return appropriate HTTP status for degraded system', async () => {
      // Trigger degradation
      await monitor.triggerDegradation('moderate', 'Test degradation')

      const mockRequest = new Request('http://localhost:3000/api/health/detailed')
      const response = await detailedHealthGET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200) // Still 200 for degraded
      expect(data.status).toBe('degraded')
    })

    it('should return 503 for critical system status', async () => {
      // Trigger severe degradation
      await monitor.triggerDegradation('severe', 'Test severe degradation')

      const mockRequest = new Request('http://localhost:3000/api/health/detailed')
      const response = await detailedHealthGET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.status).toBe('critical')
    })

    it('should include proper cache-control headers', async () => {
      const mockRequest = new Request('http://localhost:3000/api/health/detailed')
      const response = await detailedHealthGET(mockRequest)

      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate')
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
    })
  })

  describe('HEAD Request Support', () => {
    it('should support HEAD requests for simple health checks', async () => {
      const mockRequest = new Request('http://localhost:3000/api/health/detailed', {
        method: 'HEAD'
      })
      const response = await detailedHealthHEAD(mockRequest)

      expect(response.status).toBe(200)
      expect(response.headers.get('X-Health-Status')).toBe('healthy')
      expect(response.headers.get('X-Timestamp')).toBeTruthy()
      expect(response.headers.get('Cache-Control')).toBe('no-cache')
    })

    it('should return 503 for HEAD request when system is critical', async () => {
      // Trigger severe degradation
      await monitor.triggerDegradation('severe', 'Test severe degradation')

      const mockRequest = new Request('http://localhost:3000/api/health/detailed', {
        method: 'HEAD'
      })
      const response = await detailedHealthHEAD(mockRequest)

      expect(response.status).toBe(503)
      expect(response.headers.get('X-Health-Status')).toBe('critical')
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully in detailed endpoint', async () => {
      // Shutdown monitor to cause errors
      await monitor.shutdown()

      const mockRequest = new Request('http://localhost:3000/api/health/detailed')
      const response = await detailedHealthGET(mockRequest)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data.status).toBe('error')
      expect(data).toHaveProperty('error')
    })
  })
})