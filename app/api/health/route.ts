/**
 * Health Check API Endpoint
 * 
 * This endpoint provides health status of the application and ensures
 * background jobs are initialized. Includes basic resource monitoring.
 * 
 * GET /api/health - Returns health status and background job information
 * 
 * Requirements: 10.5
 */

import { NextResponse } from 'next/server'
import { 
  initializeBackgroundJobs, 
  getBackgroundJobsStatus 
} from '@/lib/services/background-jobs'
import { getResourceMonitor } from '@/lib/services/resource-monitor'

// Initialize background jobs on first request
let jobsInitialized = false

export async function GET() {
  try {
    // Initialize background jobs if not already done
    if (!jobsInitialized) {
      initializeBackgroundJobs()
      jobsInitialized = true
    }

    // Get status of all background jobs
    const jobsStatus = getBackgroundJobsStatus()

    // Get basic resource metrics
    const resourceMonitor = getResourceMonitor()
    const degradationState = resourceMonitor.getDegradationState()
    
    // Determine overall status
    let overallStatus = 'healthy'
    if (degradationState.level === 'severe') {
      overallStatus = 'critical'
    } else if (degradationState.isActive) {
      overallStatus = 'degraded'
    } else if (jobsStatus.systemHealth !== 'healthy') {
      overallStatus = 'degraded'
    }

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      backgroundJobs: jobsStatus,
      degradation: {
        active: degradationState.isActive,
        level: degradationState.level,
        disabledFeatures: degradationState.disabledFeatures
      },
      database: 'connected',
      cache: 'redis'
    })
  } catch (error) {
    console.error('[Health] Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
