/**
 * Background Jobs Service
 * 
 * Centralized service for managing all background jobs and scheduled tasks.
 * Handles initialization, lifecycle management, and monitoring of background processes.
 * 
 * Features:
 * - Notification threshold monitoring (hourly)
 * - Cache refresh jobs (every 10 minutes)
 * - Audit log archival (daily)
 * - Materialized view refresh (every 10 minutes)
 * - Health monitoring and error recovery
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 3.3, 5.5
 */

import * as cron from 'node-cron';
import { getNotificationThresholdMonitor } from './notification-threshold-monitor';
import { getCacheService } from './cache-service';
import { getDashboardService } from './dashboard-service';
import { 
  getPriorityJobQueue, 
  registerJobProcessor, 
  addUrgentJob, 
  addNormalJob, 
  addLowJob,
  type Job 
} from './priority-job-queue';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface BackgroundJobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'running' | 'stopped' | 'error';
  errorMessage?: string;
}

export interface BackgroundJobsStatus {
  totalJobs: number;
  runningJobs: number;
  stoppedJobs: number;
  errorJobs: number;
  jobs: BackgroundJobConfig[];
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

// ============================================================================
// BackgroundJobsService Class
// ============================================================================

export class BackgroundJobsService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private jobConfigs: Map<string, BackgroundJobConfig> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize all background jobs
   * This should be called once when the application starts
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Background jobs already initialized');
      return;
    }

    try {
      console.log('Initializing background jobs service...');

      // Initialize priority job queue
      const jobQueue = getPriorityJobQueue();
      await jobQueue.initialize();

      // Register job processors
      await this.registerJobProcessors();

      // Initialize individual services
      await this.initializeNotificationMonitoring();
      await this.initializeCacheRefreshJobs();
      await this.initializeMaterializedViewRefresh();
      await this.initializeAuditLogArchival();

      this.isInitialized = true;
      console.log('Background jobs service initialized successfully');
      
      // Log initial status
      const status = this.getStatus();
      console.log(`Started ${status.runningJobs} background jobs`);

    } catch (error) {
      console.error('Failed to initialize background jobs:', error);
      throw error;
    }
  }

  /**
   * Register job processors for the priority queue
   */
  private async registerJobProcessors(): Promise<void> {
    // Register notification threshold monitoring processor
    registerJobProcessor('notification-threshold-check', async (job) => {
      const thresholdMonitor = getNotificationThresholdMonitor();
      return await thresholdMonitor.runMonitoringJob();
    });

    // Register cache refresh processor
    registerJobProcessor('cache-refresh', async (job) => {
      const dashboardService = getDashboardService();
      const { studentIds } = job.data;
      
      if (studentIds && studentIds.length > 0) {
        await dashboardService.warmCache(studentIds);
        return { studentsWarmed: studentIds.length };
      }
      
      // Get active students if not provided
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('status', 'ACTIVE')
        .limit(50);

      if (students && students.length > 0) {
        const activeStudentIds = students.map(s => s.id);
        await dashboardService.warmCache(activeStudentIds);
        return { studentsWarmed: activeStudentIds.length };
      }
      
      return { studentsWarmed: 0 };
    });

    // Register materialized view refresh processor
    registerJobProcessor('materialized-view-refresh', async (job) => {
      const { error } = await supabase.rpc('refresh_class_statistics');
      
      if (error) {
        throw new Error(`Failed to refresh materialized view: ${error.message}`);
      }
      
      return { refreshed: true };
    });

    // Register audit log archival processor
    registerJobProcessor('audit-log-archival', async (job) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      // Check if we need to archive (table has > 1M records)
      const { count, error: countError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Failed to count audit logs: ${countError.message}`);
      }

      if (count && count > 1000000) {
        // Archive old records
        const { error: deleteError } = await supabase
          .from('audit_logs')
          .delete()
          .lt('timestamp', cutoffDate.toISOString());

        if (deleteError) {
          throw new Error(`Failed to archive audit logs: ${deleteError.message}`);
        }

        return { archived: true, cutoffDate: cutoffDate.toISOString(), recordsArchived: count };
      } else {
        return { archived: false, reason: 'Below threshold', recordCount: count };
      }
    });

    // Register cache invalidation processor (urgent priority)
    registerJobProcessor('cache-invalidation', async (job) => {
      const cacheService = getCacheService();
      const { pattern, keys } = job.data;
      
      let invalidatedCount = 0;
      
      if (pattern) {
        invalidatedCount = await cacheService.deletePattern(pattern);
      } else if (keys && Array.isArray(keys)) {
        for (const key of keys) {
          await cacheService.delete(key);
          invalidatedCount++;
        }
      }
      
      return { invalidatedCount };
    });

    console.log('Job processors registered successfully');
  }

  /**
   * Initialize notification threshold monitoring
   * Runs hourly to check student attendance thresholds
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  private async initializeNotificationMonitoring(): Promise<void> {
    const jobName = 'notification-threshold-monitor';
    const schedule = '0 * * * *'; // Every hour at minute 0

    try {
      const thresholdMonitor = getNotificationThresholdMonitor();
      
      const job = cron.schedule(schedule, async () => {
        await this.executeJob(jobName, async () => {
          // Add urgent job to priority queue
          const jobId = await addUrgentJob('notification-threshold-check', {
            scheduledAt: new Date().toISOString()
          });
          console.log(`Queued notification threshold check job: ${jobId}`);
          return { jobId };
        });
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.jobs.set(jobName, job);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: true,
        description: 'Monitor student attendance thresholds and send notifications',
        status: 'running'
      });

      console.log(`✓ Initialized ${jobName} (${schedule})`);
    } catch (error) {
      console.error(`Failed to initialize ${jobName}:`, error);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: false,
        description: 'Monitor student attendance thresholds and send notifications',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize cache refresh jobs
   * Runs every 5 minutes to warm frequently accessed cache entries
   * Requirements: 1.2, 3.5
   */
  private async initializeCacheRefreshJobs(): Promise<void> {
    const jobName = 'cache-refresh';
    const schedule = '*/5 * * * *'; // Every 5 minutes

    try {
      const dashboardService = getDashboardService();
      
      const job = cron.schedule(schedule, async () => {
        await this.executeJob(jobName, async () => {
          // Get list of active students for cache warming
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('status', 'ACTIVE')
            .limit(50); // Limit to most recently active students

          if (students && students.length > 0) {
            const studentIds = students.map(s => s.id);
            
            // Add normal priority job to queue
            const jobId = await addNormalJob('cache-warming', {
              studentIds,
              scheduledAt: new Date().toISOString()
            });
            console.log(`Queued cache warming job: ${jobId} for ${studentIds.length} students`);
            return { jobId, studentsQueued: studentIds.length };
          }

          return { studentsQueued: 0 };
        });
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.jobs.set(jobName, job);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: true,
        description: 'Warm frequently accessed cache entries',
        status: 'running'
      });

      console.log(`✓ Initialized ${jobName} (${schedule})`);
    } catch (error) {
      console.error(`Failed to initialize ${jobName}:`, error);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: false,
        description: 'Warm frequently accessed cache entries',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize materialized view refresh
   * Runs every 10 minutes to refresh class statistics
   * Requirements: 3.3
   */
  private async initializeMaterializedViewRefresh(): Promise<void> {
    const jobName = 'materialized-view-refresh';
    const schedule = '*/10 * * * *'; // Every 10 minutes

    try {
      const job = cron.schedule(schedule, async () => {
        await this.executeJob(jobName, async () => {
          // Add normal priority job to queue
          const jobId = await addNormalJob('materialized-view-refresh', {
            scheduledAt: new Date().toISOString()
          });
          console.log(`Queued materialized view refresh job: ${jobId}`);
          return { jobId };
        });
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.jobs.set(jobName, job);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: true,
        description: 'Refresh materialized views for class statistics',
        status: 'running'
      });

      console.log(`✓ Initialized ${jobName} (${schedule})`);
    } catch (error) {
      console.error(`Failed to initialize ${jobName}:`, error);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: false,
        description: 'Refresh materialized views for class statistics',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Initialize audit log archival
   * Runs daily to archive old audit logs
   * Requirements: 5.5
   */
  private async initializeAuditLogArchival(): Promise<void> {
    const jobName = 'audit-log-archival';
    const schedule = '0 2 * * *'; // Daily at 2 AM UTC

    try {
      const job = cron.schedule(schedule, async () => {
        await this.executeJob(jobName, async () => {
          // Archive logs older than 90 days
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 90);

          // Add low priority job to queue
          const jobId = await addLowJob('audit-log-archival', {
            cutoffDate: cutoffDate.toISOString(),
            scheduledAt: new Date().toISOString()
          });
          console.log(`Queued audit log archival job: ${jobId}`);
          return { jobId, cutoffDate: cutoffDate.toISOString() };
        });
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.jobs.set(jobName, job);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: true,
        description: 'Archive old audit logs when table exceeds 1M records',
        status: 'running'
      });

      console.log(`✓ Initialized ${jobName} (${schedule})`);
    } catch (error) {
      console.error(`Failed to initialize ${jobName}:`, error);
      this.jobConfigs.set(jobName, {
        name: jobName,
        schedule,
        enabled: false,
        description: 'Archive old audit logs when table exceeds 1M records',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Execute a job with error handling and logging
   */
  private async executeJob(jobName: string, jobFunction: () => Promise<any>): Promise<void> {
    const config = this.jobConfigs.get(jobName);
    if (!config) {
      console.error(`Job config not found: ${jobName}`);
      return;
    }

    const startTime = Date.now();
    
    try {
      console.log(`Starting job: ${jobName}`);
      
      // Update job status
      config.status = 'running';
      config.lastRun = new Date();
      config.errorMessage = undefined;

      // Execute the job
      const result = await jobFunction();
      
      // Update success status
      config.status = 'running'; // Job completed successfully, ready for next run
      
      const duration = Date.now() - startTime;
      console.log(`Job completed: ${jobName} (${duration}ms)`, result);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Job failed: ${jobName} (${duration}ms)`, error);
      
      // Update error status
      config.status = 'error';
      config.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Stop a specific job
   */
  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    const config = this.jobConfigs.get(jobName);
    
    if (job && config) {
      job.stop();
      config.status = 'stopped';
      config.enabled = false;
      console.log(`Stopped job: ${jobName}`);
      return true;
    }
    
    return false;
  }

  /**
   * Start a specific job
   */
  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    const config = this.jobConfigs.get(jobName);
    
    if (job && config) {
      job.start();
      config.status = 'running';
      config.enabled = true;
      console.log(`Started job: ${jobName}`);
      return true;
    }
    
    return false;
  }

  /**
   * Stop all background jobs
   */
  stopAll(): void {
    console.log('Stopping all background jobs...');
    
    for (const [jobName, job] of this.jobs.entries()) {
      job.stop();
      const config = this.jobConfigs.get(jobName);
      if (config) {
        config.status = 'stopped';
        config.enabled = false;
      }
    }
    
    console.log(`Stopped ${this.jobs.size} background jobs`);
  }

  /**
   * Start all background jobs
   */
  startAll(): void {
    console.log('Starting all background jobs...');
    
    for (const [jobName, job] of this.jobs.entries()) {
      job.start();
      const config = this.jobConfigs.get(jobName);
      if (config) {
        config.status = 'running';
        config.enabled = true;
      }
    }
    
    console.log(`Started ${this.jobs.size} background jobs`);
  }

  /**
   * Get status of all background jobs
   */
  getStatus(): BackgroundJobsStatus {
    const jobs = Array.from(this.jobConfigs.values());
    const runningJobs = jobs.filter(j => j.status === 'running').length;
    const stoppedJobs = jobs.filter(j => j.status === 'stopped').length;
    const errorJobs = jobs.filter(j => j.status === 'error').length;

    // Determine system health
    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (errorJobs > 0) {
      systemHealth = errorJobs >= jobs.length / 2 ? 'critical' : 'degraded';
    }

    return {
      totalJobs: jobs.length,
      runningJobs,
      stoppedJobs,
      errorJobs,
      jobs,
      systemHealth
    };
  }

  /**
   * Get detailed status for a specific job
   */
  getJobStatus(jobName: string): BackgroundJobConfig | null {
    return this.jobConfigs.get(jobName) || null;
  }

  /**
   * Manually trigger a job (for testing or immediate execution)
   */
  async triggerJob(jobName: string): Promise<boolean> {
    const config = this.jobConfigs.get(jobName);
    if (!config) {
      console.error(`Job not found: ${jobName}`);
      return false;
    }

    try {
      console.log(`Manually triggering job: ${jobName}`);
      
      // Execute based on job type
      switch (jobName) {
        case 'notification-threshold-monitor':
          const thresholdMonitor = getNotificationThresholdMonitor();
          await thresholdMonitor.runManualCheck();
          break;
          
        case 'cache-refresh':
          const dashboardService = getDashboardService();
          const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('status', 'ACTIVE')
            .limit(50);
          
          if (students && students.length > 0) {
            const studentIds = students.map(s => s.id);
            await dashboardService.warmCache(studentIds);
          }
          break;
          
        case 'materialized-view-refresh':
          await supabase.rpc('refresh_class_statistics');
          break;
          
        default:
          console.error(`Manual trigger not implemented for job: ${jobName}`);
          return false;
      }
      
      console.log(`Job triggered successfully: ${jobName}`);
      return true;
      
    } catch (error) {
      console.error(`Failed to trigger job ${jobName}:`, error);
      return false;
    }
  }

  /**
   * Check if the service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Queue urgent cache invalidation job
   */
  async queueCacheInvalidation(pattern: string): Promise<string> {
    try {
      const jobId = await addUrgentJob('cache-invalidation', {
        pattern,
        requestedAt: new Date().toISOString()
      });
      console.log(`Queued urgent cache invalidation job: ${jobId} for pattern: ${pattern}`);
      return jobId;
    } catch (error) {
      console.error('Failed to queue cache invalidation:', error);
      throw error;
    }
  }

  /**
   * Queue normal priority cache warming job
   */
  async queueCacheWarming(studentIds: string[]): Promise<string> {
    try {
      const jobId = await addNormalJob('cache-warming', {
        studentIds,
        requestedAt: new Date().toISOString()
      });
      console.log(`Queued cache warming job: ${jobId} for ${studentIds.length} students`);
      return jobId;
    } catch (error) {
      console.error('Failed to queue cache warming:', error);
      throw error;
    }
  }

  /**
   * Queue immediate materialized view refresh
   */
  async queueViewRefresh(): Promise<string> {
    try {
      const jobId = await addUrgentJob('materialized-view-refresh', {
        requestedAt: new Date().toISOString(),
        immediate: true
      });
      console.log(`Queued immediate view refresh job: ${jobId}`);
      return jobId;
    } catch (error) {
      console.error('Failed to queue view refresh:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown - stop all jobs and cleanup
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down background jobs service...');
    
    // Shutdown priority job queue
    const jobQueue = getPriorityJobQueue();
    await jobQueue.shutdown();
    
    this.stopAll();
    this.jobs.clear();
    this.jobConfigs.clear();
    this.isInitialized = false;
    
    console.log('Background jobs service shutdown complete');
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let backgroundJobsInstance: BackgroundJobsService | null = null;

export function getBackgroundJobsService(): BackgroundJobsService {
  if (!backgroundJobsInstance) {
    backgroundJobsInstance = new BackgroundJobsService();
  }
  return backgroundJobsInstance;
}

// ============================================================================
// Standalone Functions for Compatibility
// ============================================================================

/**
 * Initialize background jobs (standalone function)
 * This function provides compatibility with existing code that expects
 * a standalone initialization function
 */
export async function initializeBackgroundJobs(): Promise<void> {
  const service = getBackgroundJobsService();
  await service.initialize();
}

/**
 * Get background jobs status (standalone function)
 * This function provides compatibility with existing code that expects
 * a standalone status function
 */
export function getBackgroundJobsStatus(): BackgroundJobsStatus {
  const service = getBackgroundJobsService();
  return service.getStatus();
}

/**
 * Start all background jobs (standalone function)
 */
export function startAllBackgroundJobs(): void {
  const service = getBackgroundJobsService();
  service.startAll();
}

/**
 * Stop all background jobs (standalone function)
 */
export function stopAllBackgroundJobs(): void {
  const service = getBackgroundJobsService();
  service.stopAll();
}

/**
 * Trigger a specific job manually (standalone function)
 */
export async function triggerBackgroundJob(jobName: string): Promise<boolean> {
  const service = getBackgroundJobsService();
  return await service.triggerJob(jobName);
}

// Auto-initialize when imported (for Next.js API routes)
if (typeof window === 'undefined') { // Server-side only
  const service = getBackgroundJobsService();
  
  // Initialize on first import, but don't block
  service.initialize().catch(error => {
    console.error('Failed to auto-initialize background jobs:', error);
  });
}

export default BackgroundJobsService;