/**
 * Detailed Health Check API Endpoint
 * 
 * Provides comprehensive system health information including resource metrics,
 * degradation status, and service health for monitoring and alerting.
 * 
 * Requirements: 10.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemHealthCheck, getResourceMonitor } from '@/lib/services/resource-monitor';
import { getDatabasePoolStats } from '@/lib/config/database-pool';
import { getCacheMemoryStats } from '@/lib/services/cache-eviction-service';
import { getQueueStats } from '@/lib/services/priority-job-queue';
import { getBackgroundJobsStatus } from '@/lib/services/background-jobs';
import { degradationManager } from '@/lib/errors/graceful-degradation';

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive health information
    const [
      systemHealth,
      dbPoolStats,
      cacheStats,
      queueStats,
      backgroundJobsStatus
    ] = await Promise.all([
      getSystemHealthCheck(),
      Promise.resolve().then(() => getDatabasePoolStats()).catch(() => null),
      getCacheMemoryStats().catch(() => null),
      getQueueStats().catch(() => null),
      Promise.resolve(getBackgroundJobsStatus())
    ]);

    // Get service health from degradation manager
    const serviceHealth = degradationManager.getAllServiceHealth();

    // Get degradation state
    const monitor = getResourceMonitor();
    const degradationState = monitor.getDegradationState();
    const thresholds = monitor.getThresholds();

    // Determine overall system status
    let overallStatus = 'healthy';
    const issues: string[] = [];

    if (systemHealth.status === 'critical') {
      overallStatus = 'critical';
      issues.push('System resources critically low');
    } else if (systemHealth.status === 'degraded') {
      overallStatus = 'degraded';
      issues.push('System under resource pressure');
    }

    // Check database health
    if (dbPoolStats && !dbPoolStats.isHealthy) {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      issues.push('Database connection issues detected');
    }

    // Check cache health
    if (cacheStats && cacheStats.isMemoryPressure) {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      issues.push('Cache memory pressure detected');
    }

    // Check background jobs health
    if (backgroundJobsStatus.systemHealth !== 'healthy') {
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      issues.push(`Background jobs system: ${backgroundJobsStatus.systemHealth}`);
    }

    // Build response
    const healthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      
      // System resources
      system: {
        status: systemHealth.status,
        metrics: systemHealth.metrics,
        alerts: systemHealth.alerts,
        recommendations: systemHealth.recommendations,
        thresholds
      },
      
      // Degradation information
      degradation: {
        ...degradationState,
        activeDuration: degradationState.activatedAt 
          ? Date.now() - degradationState.activatedAt.getTime()
          : 0
      },
      
      // Service health
      services: {
        database: dbPoolStats ? {
          status: dbPoolStats.isHealthy ? 'healthy' : 'degraded',
          connections: {
            total: dbPoolStats.totalConnections,
            active: dbPoolStats.activeConnections,
            idle: dbPoolStats.idleConnections,
            waiting: dbPoolStats.waitingRequests
          },
          performance: {
            averageResponseTime: dbPoolStats.averageResponseTime,
            totalRequests: dbPoolStats.totalRequests,
            failedConnections: dbPoolStats.failedConnections
          },
          lastHealthCheck: dbPoolStats.lastHealthCheck
        } : { status: 'unknown', error: 'Database pool stats unavailable' },
        
        cache: cacheStats ? {
          status: cacheStats.isMemoryPressure ? 'degraded' : 'healthy',
          memory: {
            used: cacheStats.usedMemoryMB,
            max: cacheStats.maxMemoryMB,
            usagePercent: cacheStats.memoryUsagePercent,
            pressure: cacheStats.isMemoryPressure
          },
          performance: {
            hitRate: cacheStats.hitRate,
            missRate: cacheStats.missRate,
            totalKeys: cacheStats.totalKeys,
            evictedKeys: cacheStats.evictedKeys
          }
        } : { status: 'unknown', error: 'Cache stats unavailable' },
        
        jobQueue: queueStats ? {
          status: queueStats.failedJobs > queueStats.completedJobs * 0.1 ? 'degraded' : 'healthy',
          jobs: {
            total: queueStats.totalJobs,
            urgent: queueStats.urgentJobs,
            normal: queueStats.normalJobs,
            low: queueStats.lowJobs,
            processing: queueStats.processingJobs,
            completed: queueStats.completedJobs,
            failed: queueStats.failedJobs
          },
          performance: {
            averageProcessingTime: queueStats.averageProcessingTime,
            throughput: queueStats.throughput
          }
        } : { status: 'unknown', error: 'Job queue stats unavailable' },
        
        backgroundJobs: {
          status: backgroundJobsStatus.systemHealth,
          jobs: {
            total: backgroundJobsStatus.totalJobs,
            running: backgroundJobsStatus.runningJobs,
            stopped: backgroundJobsStatus.stoppedJobs,
            error: backgroundJobsStatus.errorJobs
          },
          details: backgroundJobsStatus.jobs.map(job => ({
            name: job.name,
            status: job.status,
            schedule: job.schedule,
            enabled: job.enabled,
            lastRun: job.lastRun,
            errorMessage: job.errorMessage
          }))
        },
        
        external: serviceHealth
      },
      
      // Issues and recommendations
      issues,
      recommendations: [
        ...systemHealth.recommendations,
        ...(degradationState.isActive ? ['System is in degradation mode - monitor resource usage'] : []),
        ...(issues.length > 0 ? ['Check service logs for detailed error information'] : [])
      ],
      
      // Additional metadata
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      }
    };

    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'critical' ? 503 : 
                      overallStatus === 'degraded' ? 200 : 200;

    return NextResponse.json(healthResponse, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}

// Support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    const systemHealth = await getSystemHealthCheck();
    const httpStatus = systemHealth.status === 'critical' ? 503 : 
                      systemHealth.status === 'degraded' ? 200 : 200;
    
    return new NextResponse(null, { 
      status: httpStatus,
      headers: {
        'X-Health-Status': systemHealth.status,
        'X-Timestamp': new Date().toISOString(),
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}