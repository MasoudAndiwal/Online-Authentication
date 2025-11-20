/**
 * Background Jobs Management API
 * 
 * Provides endpoints for monitoring and managing background jobs
 * including the notification threshold monitoring service.
 * 
 * Endpoints:
 * - GET: Get status of all background jobs
 * - POST: Trigger manual job execution or control job lifecycle
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBackgroundJobsService } from '@/lib/services/background-jobs';
import { getNotificationThresholdMonitor } from '@/lib/services/notification-threshold-monitor';

// ============================================================================
// GET - Get Background Jobs Status
// ============================================================================

export async function GET() {
  try {
    const backgroundJobs = getBackgroundJobsService();
    const thresholdMonitor = getNotificationThresholdMonitor();

    // Get overall status
    const status = backgroundJobs.getStatus();
    
    // Get retry queue status
    const retryQueueStatus = thresholdMonitor.getRetryQueueStatus();

    // Get threshold monitor specific status
    const thresholdMonitorStatus = thresholdMonitor.getStatus();

    return NextResponse.json({
      success: true,
      data: {
        ...status,
        thresholdMonitor: thresholdMonitorStatus,
        retryQueue: retryQueueStatus,
        serviceInitialized: backgroundJobs.isServiceInitialized()
      }
    });

  } catch (error) {
    console.error('Error fetching background jobs status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch background jobs status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Control Background Jobs
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, jobName } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Action is required',
          validActions: ['start', 'stop', 'trigger', 'startAll', 'stopAll', 'clearRetryQueue', 'getJobStatus']
        },
        { status: 400 }
      );
    }

    const backgroundJobs = getBackgroundJobsService();
    const thresholdMonitor = getNotificationThresholdMonitor();

    switch (action) {
      case 'start':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'jobName is required for start action' },
            { status: 400 }
          );
        }
        
        const startResult = backgroundJobs.startJob(jobName);
        return NextResponse.json({
          success: startResult,
          message: startResult ? `Job ${jobName} started` : `Failed to start job ${jobName}`,
          data: { jobName, action: 'start' }
        });

      case 'stop':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'jobName is required for stop action' },
            { status: 400 }
          );
        }
        
        const stopResult = backgroundJobs.stopJob(jobName);
        return NextResponse.json({
          success: stopResult,
          message: stopResult ? `Job ${jobName} stopped` : `Failed to stop job ${jobName}`,
          data: { jobName, action: 'stop' }
        });

      case 'trigger':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'jobName is required for trigger action' },
            { status: 400 }
          );
        }
        
        const triggerResult = await backgroundJobs.triggerJob(jobName);
        return NextResponse.json({
          success: triggerResult,
          message: triggerResult ? `Job ${jobName} triggered successfully` : `Failed to trigger job ${jobName}`,
          data: { jobName, action: 'trigger' }
        });

      case 'startAll':
        backgroundJobs.startAll();
        return NextResponse.json({
          success: true,
          message: 'All background jobs started',
          data: { action: 'startAll' }
        });

      case 'stopAll':
        backgroundJobs.stopAll();
        return NextResponse.json({
          success: true,
          message: 'All background jobs stopped',
          data: { action: 'stopAll' }
        });

      case 'clearRetryQueue':
        thresholdMonitor.clearRetryQueue();
        return NextResponse.json({
          success: true,
          message: 'Retry queue cleared',
          data: { action: 'clearRetryQueue' }
        });

      case 'getJobStatus':
        if (!jobName) {
          return NextResponse.json(
            { success: false, error: 'jobName is required for getJobStatus action' },
            { status: 400 }
          );
        }
        
        const jobStatus = backgroundJobs.getJobStatus(jobName);
        return NextResponse.json({
          success: true,
          data: jobStatus,
          message: jobStatus ? `Status retrieved for ${jobName}` : `Job ${jobName} not found`
        });

      case 'runThresholdCheck':
        // Manual threshold check for testing
        const result = await thresholdMonitor.runManualCheck();
        return NextResponse.json({
          success: true,
          message: 'Manual threshold check completed',
          data: result
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
            validActions: ['start', 'stop', 'trigger', 'startAll', 'stopAll', 'clearRetryQueue', 'getJobStatus', 'runThresholdCheck']
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error controlling background jobs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to control background jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update Job Configuration
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobName, enabled } = body;

    if (!jobName) {
      return NextResponse.json(
        { success: false, error: 'jobName is required' },
        { status: 400 }
      );
    }

    const backgroundJobs = getBackgroundJobsService();

    if (enabled === true) {
      const result = backgroundJobs.startJob(jobName);
      return NextResponse.json({
        success: result,
        message: result ? `Job ${jobName} enabled` : `Failed to enable job ${jobName}`,
        data: { jobName, enabled: result }
      });
    } else if (enabled === false) {
      const result = backgroundJobs.stopJob(jobName);
      return NextResponse.json({
        success: result,
        message: result ? `Job ${jobName} disabled` : `Failed to disable job ${jobName}`,
        data: { jobName, enabled: !result }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'enabled field must be true or false' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating job configuration:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}