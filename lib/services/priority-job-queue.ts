/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Priority Job Queue Service
 * 
 * Implements a priority-based job queue system for background tasks.
 * Processes urgent jobs (notifications, cache invalidation) before normal priority jobs.
 * 
 * Requirements: 10.4
 * Property: 46 - Priority Job Processing
 */

import Redis from 'ioredis';
import { getRedisClient } from '../config/redis';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type JobPriority = 'urgent' | 'normal' | 'low';

export interface Job {
  id: string;
  type: string;
  priority: JobPriority;
  data: any;
  createdAt: Date;
  scheduledAt?: Date;
  attempts: number;
  maxAttempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential';
  timeout: number;
  tags?: string[];
}

export interface JobResult {
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
  completedAt: Date;
}

export interface QueueStats {
  totalJobs: number;
  urgentJobs: number;
  normalJobs: number;
  lowJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  throughput: number; // jobs per minute
}

export interface JobProcessor {
  (job: Job): Promise<any>;
}

// ============================================================================
// Job Queue Configuration
// ============================================================================

export interface QueueConfig {
  concurrency: number;
  maxRetries: number;
  defaultTimeout: number;
  processingInterval: number;
  cleanupInterval: number;
  jobTTL: number; // Time to keep completed jobs
  staleJobTimeout: number;
}

const DEFAULT_QUEUE_CONFIG: QueueConfig = {
  concurrency: 5,
  maxRetries: 3,
  defaultTimeout: 30000,      // 30 seconds
  processingInterval: 1000,   // Check for jobs every second
  cleanupInterval: 300000,    // Cleanup every 5 minutes
  jobTTL: 3600,              // Keep completed jobs for 1 hour
  staleJobTimeout: 300000     // 5 minutes for stale job detection
};

// ============================================================================
// Priority Job Queue Service
// ============================================================================

export class PriorityJobQueue {
  private config: QueueConfig;
  private redis: Redis;
  private processors: Map<string, JobProcessor> = new Map();
  private processingTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private isInitialized: boolean = false;
  private stats: QueueStats;

  // Redis key patterns
  private readonly QUEUE_KEYS = {
    URGENT: 'job_queue:urgent',
    NORMAL: 'job_queue:normal',
    LOW: 'job_queue:low',
    PROCESSING: 'job_queue:processing',
    COMPLETED: 'job_queue:completed',
    FAILED: 'job_queue:failed',
    STATS: 'job_queue:stats'
  };

  constructor(config?: Partial<QueueConfig>) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config };
    // Lazy Redis initialization - will be set on first use
    this.redis = null as unknown as Redis;
    this.stats = this.initializeStats();
  }

  /**
   * Ensure Redis client is initialized
   */
  private ensureRedis(): void {
    if (!this.redis) {
      this.redis = getRedisClient();
    }
  }

  /**
   * Initialize queue statistics
   */
  private initializeStats(): QueueStats {
    return {
      totalJobs: 0,
      urgentJobs: 0,
      normalJobs: 0,
      lowJobs: 0,
      processingJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageProcessingTime: 0,
      throughput: 0
    };
  }

  /**
   * Initialize the priority job queue
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Priority job queue already initialized');
      return;
    }

    try {
      console.log('Initializing priority job queue...');
      
      // Initialize Redis connection
      this.ensureRedis();
      
      // Load existing stats
      await this.loadStats();
      
      // Start job processing
      this.startProcessing();
      
      // Start cleanup
      this.startCleanup();
      
      this.isInitialized = true;
      console.log(`Priority job queue initialized (concurrency: ${this.config.concurrency})`);
      
    } catch (error) {
      console.error('Failed to initialize priority job queue:', error);
      throw error;
    }
  }

  /**
   * Register a job processor for a specific job type
   */
  registerProcessor(jobType: string, processor: JobProcessor): void {
    this.processors.set(jobType, processor);
    console.log(`Registered processor for job type: ${jobType}`);
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: string,
    data: any,
    options: {
      priority?: JobPriority;
      delay?: number;
      maxAttempts?: number;
      timeout?: number;
      tags?: string[];
    } = {}
  ): Promise<string> {
    const job: Job = {
      id: this.generateJobId(),
      type,
      priority: options.priority || 'normal',
      data,
      createdAt: new Date(),
      scheduledAt: options.delay ? new Date(Date.now() + options.delay) : undefined,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      delay: options.delay || 0,
      backoff: 'exponential',
      timeout: options.timeout || this.config.defaultTimeout,
      tags: options.tags || []
    };

    try {
      // Add to appropriate priority queue
      const queueKey = this.getQueueKey(job.priority);
      const jobData = JSON.stringify(job);
      
      if (job.scheduledAt) {
        // Delayed job - use sorted set with timestamp as score
        await this.redis.zadd(queueKey + ':delayed', job.scheduledAt.getTime(), jobData);
      } else {
        // Immediate job - use list
        await this.redis.lpush(queueKey, jobData);
      }
      
      // Update stats
      await this.updateStats('added', job.priority);
      
      console.log(`Added ${job.priority} priority job: ${job.type} (${job.id})`);
      return job.id;
      
    } catch (error) {
      console.error('Failed to add job:', error);
      throw error;
    }
  }

  /**
   * Start job processing loop
   */
  private startProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    this.processingTimer = setInterval(async () => {
      if (!this.isProcessing) {
        await this.processJobs();
      }
    }, this.config.processingInterval);

    console.log('Job processing started');
  }

  /**
   * Process jobs from queues in priority order
   */
  private async processJobs(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Check for delayed jobs that are ready
      await this.processDelayedJobs();
      
      // Get current processing count
      const processingCount = await this.redis.llen(this.QUEUE_KEYS.PROCESSING);
      
      if (processingCount >= this.config.concurrency) {
        return; // At capacity
      }
      
      // Process jobs in priority order: urgent -> normal -> low
      const priorities: JobPriority[] = ['urgent', 'normal', 'low'];
      
      for (const priority of priorities) {
        const availableSlots = this.config.concurrency - processingCount;
        if (availableSlots <= 0) break;
        
        await this.processJobsFromQueue(priority, availableSlots);
      }
      
    } catch (error) {
      console.error('Job processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process delayed jobs that are ready to run
   */
  private async processDelayedJobs(): Promise<void> {
    const now = Date.now();
    const priorities: JobPriority[] = ['urgent', 'normal', 'low'];
    
    for (const priority of priorities) {
      const delayedQueueKey = this.getQueueKey(priority) + ':delayed';
      
      // Get jobs ready to run (score <= now)
      const readyJobs = await this.redis.zrangebyscore(
        delayedQueueKey,
        '-inf',
        now.toString(),
        'LIMIT',
        0,
        10
      );
      
      for (const jobData of readyJobs) {
        // Move from delayed queue to immediate queue
        await this.redis.zrem(delayedQueueKey, jobData);
        await this.redis.lpush(this.getQueueKey(priority), jobData);
      }
    }
  }

  /**
   * Process jobs from a specific priority queue
   */
  private async processJobsFromQueue(priority: JobPriority, maxJobs: number): Promise<void> {
    const queueKey = this.getQueueKey(priority);
    
    for (let i = 0; i < maxJobs; i++) {
      // Get job from queue
      const jobData = await this.redis.rpop(queueKey);
      if (!jobData) break;
      
      try {
        const job: Job = JSON.parse(jobData);
        
        // Move to processing queue
        await this.redis.lpush(this.QUEUE_KEYS.PROCESSING, jobData);
        
        // Process job asynchronously
        this.executeJob(job).catch(error => {
          console.error(`Job execution error for ${job.id}:`, error);
        });
        
      } catch (error) {
        console.error('Failed to parse job data:', error);
      }
    }
  }

  /**
   * Execute a single job
   */
  private async executeJob(job: Job): Promise<void> {
    const startTime = Date.now();
    job.attempts++;
    
    try {
      console.log(`Executing ${job.priority} job: ${job.type} (${job.id}) - attempt ${job.attempts}`);
      
      // Get processor for job type
      const processor = this.processors.get(job.type);
      if (!processor) {
        throw new Error(`No processor registered for job type: ${job.type}`);
      }
      
      // Execute with timeout
      const result = await Promise.race([
        processor(job),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Job timeout')), job.timeout)
        )
      ]);
      
      // Job completed successfully
      const duration = Date.now() - startTime;
      const jobResult: JobResult = {
        success: true,
        result,
        duration,
        completedAt: new Date()
      };
      
      await this.completeJob(job, jobResult);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const jobResult: JobResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        completedAt: new Date()
      };
      
      await this.handleJobFailure(job, jobResult);
    }
  }

  /**
   * Complete a successful job
   */
  private async completeJob(job: Job, result: JobResult): Promise<void> {
    try {
      // Remove from processing queue
      const jobData = JSON.stringify(job);
      await this.redis.lrem(this.QUEUE_KEYS.PROCESSING, 1, jobData);
      
      // Add to completed queue with TTL
      const completedData = JSON.stringify({ job, result });
      await this.redis.setex(
        `${this.QUEUE_KEYS.COMPLETED}:${job.id}`,
        this.config.jobTTL,
        completedData
      );
      
      // Update stats
      await this.updateStats('completed', job.priority, result.duration);
      
      console.log(`Job completed: ${job.type} (${job.id}) in ${result.duration}ms`);
      
    } catch (error) {
      console.error('Failed to complete job:', error);
    }
  }

  /**
   * Handle job failure and retry logic
   */
  private async handleJobFailure(job: Job, result: JobResult): Promise<void> {
    try {
      // Remove from processing queue
      const jobData = JSON.stringify(job);
      await this.redis.lrem(this.QUEUE_KEYS.PROCESSING, 1, jobData);
      
      if (job.attempts < job.maxAttempts) {
        // Retry job with backoff
        const delay = this.calculateBackoffDelay(job);
        job.scheduledAt = new Date(Date.now() + delay);
        
        const queueKey = this.getQueueKey(job.priority) + ':delayed';
        await this.redis.zadd(queueKey, job.scheduledAt.getTime(), JSON.stringify(job));
        
        console.log(`Job failed, retrying in ${delay}ms: ${job.type} (${job.id}) - attempt ${job.attempts}/${job.maxAttempts}`);
        
      } else {
        // Job failed permanently
        const failedData = JSON.stringify({ job, result });
        await this.redis.setex(
          `${this.QUEUE_KEYS.FAILED}:${job.id}`,
          this.config.jobTTL,
          failedData
        );
        
        await this.updateStats('failed', job.priority);
        
        console.error(`Job failed permanently: ${job.type} (${job.id}) - ${result.error}`);
      }
      
    } catch (error) {
      console.error('Failed to handle job failure:', error);
    }
  }

  /**
   * Calculate backoff delay for retries
   */
  private calculateBackoffDelay(job: Job): number {
    if (job.backoff === 'exponential') {
      return Math.min(1000 * Math.pow(2, job.attempts - 1), 30000); // Max 30 seconds
    } else {
      return 1000; // Fixed 1 second delay
    }
  }

  /**
   * Get queue key for priority
   */
  private getQueueKey(priority: JobPriority): string {
    switch (priority) {
      case 'urgent': return this.QUEUE_KEYS.URGENT;
      case 'normal': return this.QUEUE_KEYS.NORMAL;
      case 'low': return this.QUEUE_KEYS.LOW;
      default: return this.QUEUE_KEYS.NORMAL;
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update queue statistics
   */
  private async updateStats(
    action: 'added' | 'completed' | 'failed',
    priority: JobPriority,
    duration?: number
  ): Promise<void> {
    try {
      const statsKey = this.QUEUE_KEYS.STATS;
      
      if (action === 'added') {
        await this.redis.hincrby(statsKey, 'totalJobs', 1);
        await this.redis.hincrby(statsKey, `${priority}Jobs`, 1);
      } else if (action === 'completed') {
        await this.redis.hincrby(statsKey, 'completedJobs', 1);
        if (duration) {
          // Update average processing time using exponential moving average
          const currentAvg = await this.redis.hget(statsKey, 'averageProcessingTime');
          const newAvg = currentAvg 
            ? (parseFloat(currentAvg) * 0.9 + duration * 0.1)
            : duration;
          await this.redis.hset(statsKey, 'averageProcessingTime', newAvg.toString());
        }
      } else if (action === 'failed') {
        await this.redis.hincrby(statsKey, 'failedJobs', 1);
      }
      
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }

  /**
   * Load statistics from Redis
   */
  private async loadStats(): Promise<void> {
    try {
      const statsData = await this.redis.hgetall(this.QUEUE_KEYS.STATS);
      
      this.stats = {
        totalJobs: parseInt(statsData.totalJobs || '0'),
        urgentJobs: parseInt(statsData.urgentJobs || '0'),
        normalJobs: parseInt(statsData.normalJobs || '0'),
        lowJobs: parseInt(statsData.lowJobs || '0'),
        processingJobs: await this.redis.llen(this.QUEUE_KEYS.PROCESSING),
        completedJobs: parseInt(statsData.completedJobs || '0'),
        failedJobs: parseInt(statsData.failedJobs || '0'),
        averageProcessingTime: parseFloat(statsData.averageProcessingTime || '0'),
        throughput: 0 // Will be calculated
      };
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Get current queue statistics
   */
  async getStats(): Promise<QueueStats> {
    await this.loadStats();
    return { ...this.stats };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<{ job: Job; result?: JobResult } | null> {
    try {
      // Check completed jobs
      const completedData = await this.redis.get(`${this.QUEUE_KEYS.COMPLETED}:${jobId}`);
      if (completedData) {
        return JSON.parse(completedData);
      }
      
      // Check failed jobs
      const failedData = await this.redis.get(`${this.QUEUE_KEYS.FAILED}:${jobId}`);
      if (failedData) {
        return JSON.parse(failedData);
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to get job:', error);
      return null;
    }
  }

  /**
   * Start cleanup process for old jobs
   */
  private startCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(async () => {
      await this.cleanupStaleJobs();
    }, this.config.cleanupInterval);

    console.log('Job cleanup started');
  }

  /**
   * Clean up stale jobs in processing queue
   */
  private async cleanupStaleJobs(): Promise<void> {
    try {
      const processingJobs = await this.redis.lrange(this.QUEUE_KEYS.PROCESSING, 0, -1);
      const staleThreshold = Date.now() - this.config.staleJobTimeout;
      
      for (const jobData of processingJobs) {
        try {
          const job: Job = JSON.parse(jobData);
          
          // Check if job is stale (processing for too long)
          if (job.createdAt.getTime() < staleThreshold) {
            console.warn(`Cleaning up stale job: ${job.type} (${job.id})`);
            
            // Remove from processing queue
            await this.redis.lrem(this.QUEUE_KEYS.PROCESSING, 1, jobData);
            
            // Re-queue for retry if attempts remaining
            if (job.attempts < job.maxAttempts) {
              const queueKey = this.getQueueKey(job.priority);
              await this.redis.lpush(queueKey, jobData);
            } else {
              // Mark as failed
              const failedData = JSON.stringify({
                job,
                result: {
                  success: false,
                  error: 'Job became stale',
                  duration: 0,
                  completedAt: new Date()
                }
              });
              await this.redis.setex(
                `${this.QUEUE_KEYS.FAILED}:${job.id}`,
                this.config.jobTTL,
                failedData
              );
            }
          }
        } catch (error) {
          console.error('Failed to process stale job:', error);
        }
      }
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Pause job processing
   */
  pause(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    console.log('Job processing paused');
  }

  /**
   * Resume job processing
   */
  resume(): void {
    this.startProcessing();
    console.log('Job processing resumed');
  }

  /**
   * Shutdown the queue
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down priority job queue...');
    
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // Wait for processing jobs to complete (with timeout)
    const shutdownTimeout = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.isProcessing && (Date.now() - startTime) < shutdownTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isInitialized = false;
    console.log('Priority job queue shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let queueInstance: PriorityJobQueue | null = null;

/**
 * Get the singleton priority job queue instance
 */
export function getPriorityJobQueue(): PriorityJobQueue {
  if (!queueInstance) {
    queueInstance = new PriorityJobQueue();
  }
  return queueInstance;
}

/**
 * Initialize priority job queue
 */
export async function initializePriorityJobQueue(config?: Partial<QueueConfig>): Promise<void> {
  if (queueInstance) {
    await queueInstance.shutdown();
  }
  
  queueInstance = new PriorityJobQueue(config);
  await queueInstance.initialize();
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Add urgent job (notifications, cache invalidation)
 */
export async function addUrgentJob(type: string, data: any, options?: any): Promise<string> {
  const queue = getPriorityJobQueue();
  return queue.addJob(type, data, { ...options, priority: 'urgent' });
}

/**
 * Add normal priority job
 */
export async function addNormalJob(type: string, data: any, options?: any): Promise<string> {
  const queue = getPriorityJobQueue();
  return queue.addJob(type, data, { ...options, priority: 'normal' });
}

/**
 * Add low priority job
 */
export async function addLowJob(type: string, data: any, options?: any): Promise<string> {
  const queue = getPriorityJobQueue();
  return queue.addJob(type, data, { ...options, priority: 'low' });
}

/**
 * Register job processor
 */
export function registerJobProcessor(jobType: string, processor: JobProcessor): void {
  const queue = getPriorityJobQueue();
  queue.registerProcessor(jobType, processor);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<QueueStats> {
  try {
    const queue = getPriorityJobQueue();
    return queue.getStats();
  } catch {
    // Return empty stats if Redis is not available
    return {
      totalJobs: 0,
      urgentJobs: 0,
      normalJobs: 0,
      lowJobs: 0,
      processingJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageProcessingTime: 0,
      throughput: 0
    };
  }
}

// Auto-initialize when imported (server-side only)
if (typeof window === 'undefined') {
  const queue = getPriorityJobQueue();
  queue.initialize().catch(error => {
    console.error('Failed to auto-initialize priority job queue:', error);
  });
}

export default PriorityJobQueue;