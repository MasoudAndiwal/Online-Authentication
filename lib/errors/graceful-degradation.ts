/**
 * Graceful degradation strategies for service failures
 * 
 * Provides fallback mechanisms when external services fail,
 * ensuring the system continues to operate with reduced functionality.
 */

import { 
  CacheError, 
  StorageError
} from './custom-errors';
import { withCircuitBreaker } from './circuit-breaker';

/**
 * Service health status
 */
export enum ServiceHealth {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE'
}

/**
 * Degradation strategy configuration
 */
export interface DegradationConfig {
  enableFallback: boolean;
  fallbackTimeout: number;    // Timeout for fallback operations (ms)
  healthCheckInterval: number; // How often to check service health (ms)
  maxDegradationTime: number;  // Maximum time to stay in degraded mode (ms)
}

/**
 * Service health information
 */
export interface ServiceHealthInfo {
  status: ServiceHealth;
  lastCheck: Date;
  lastError?: Error;
  degradedSince?: Date;
  fallbacksUsed: number;
}

/**
 * Graceful degradation manager
 */
export class GracefulDegradationManager {
  private serviceHealth: Map<string, ServiceHealthInfo> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly config: DegradationConfig;

  constructor(config: Partial<DegradationConfig> = {}) {
    this.config = {
      enableFallback: true,
      fallbackTimeout: 5000,
      healthCheckInterval: 30000,
      maxDegradationTime: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Execute operation with graceful degradation
   * 
   * @param serviceName - Name of the service
   * @param primaryOperation - Primary operation to try
   * @param fallbackOperation - Fallback operation if primary fails
   * @returns Promise with result
   */
  async executeWithFallback<T>(
    serviceName: string,
    primaryOperation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> {
    try {
      // Try primary operation with circuit breaker protection
      const result = await withCircuitBreaker(serviceName, primaryOperation);
      this.recordSuccess(serviceName);
      return result;
    } catch (error) {
      this.recordFailure(serviceName, error as Error);

      // If fallback is available and enabled, try it
      if (this.config.enableFallback && fallbackOperation) {
        try {
          console.warn(`Service ${serviceName} failed, using fallback:`, error);
          const fallbackResult = await this.executeWithTimeout(
            fallbackOperation,
            this.config.fallbackTimeout
          );
          this.incrementFallbackUsage(serviceName);
          return fallbackResult;
        } catch (fallbackError) {
          console.error(`Fallback for ${serviceName} also failed:`, fallbackError);
          throw error; // Throw original error, not fallback error
        }
      }

      throw error;
    }
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceName: string): ServiceHealthInfo {
    return this.serviceHealth.get(serviceName) || {
      status: ServiceHealth.HEALTHY,
      lastCheck: new Date(),
      fallbacksUsed: 0
    };
  }

  /**
   * Get all service health statuses
   */
  getAllServiceHealth(): Record<string, ServiceHealthInfo> {
    const health: Record<string, ServiceHealthInfo> = {};
    for (const [serviceName, info] of this.serviceHealth) {
      health[serviceName] = info;
    }
    return health;
  }

  /**
   * Check if service is healthy
   */
  isServiceHealthy(serviceName: string): boolean {
    const health = this.getServiceHealth(serviceName);
    return health.status === ServiceHealth.HEALTHY;
  }

  /**
   * Record successful operation
   */
  private recordSuccess(serviceName: string): void {
    const currentHealth = this.getServiceHealth(serviceName);
    
    this.serviceHealth.set(serviceName, {
      ...currentHealth,
      status: ServiceHealth.HEALTHY,
      lastCheck: new Date(),
      lastError: undefined,
      degradedSince: undefined
    });
  }

  /**
   * Record failed operation
   */
  private recordFailure(serviceName: string, error: Error): void {
    const currentHealth = this.getServiceHealth(serviceName);
    const now = new Date();
    
    this.serviceHealth.set(serviceName, {
      ...currentHealth,
      status: ServiceHealth.UNAVAILABLE,
      lastCheck: now,
      lastError: error,
      degradedSince: currentHealth.degradedSince || now
    });
  }

  /**
   * Increment fallback usage counter
   */
  private incrementFallbackUsage(serviceName: string): void {
    const currentHealth = this.getServiceHealth(serviceName);
    
    this.serviceHealth.set(serviceName, {
      ...currentHealth,
      status: ServiceHealth.DEGRADED,
      fallbacksUsed: currentHealth.fallbacksUsed + 1
    });
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Fallback operation timeout')), timeout)
      )
    ]);
  }

  /**
   * Start health monitoring for a service
   */
  startHealthMonitoring(serviceName: string, healthCheck: () => Promise<boolean>): void {
    // Clear existing interval if any
    this.stopHealthMonitoring(serviceName);

    const interval = setInterval(async () => {
      try {
        const isHealthy = await healthCheck();
        if (isHealthy) {
          this.recordSuccess(serviceName);
        } else {
          this.recordFailure(serviceName, new Error('Health check failed'));
        }
      } catch (error) {
        this.recordFailure(serviceName, error as Error);
      }
    }, this.config.healthCheckInterval);

    this.healthCheckIntervals.set(serviceName, interval);
  }

  /**
   * Stop health monitoring for a service
   */
  stopHealthMonitoring(serviceName: string): void {
    const interval = this.healthCheckIntervals.get(serviceName);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(serviceName);
    }
  }

  /**
   * Cleanup all health monitoring
   */
  cleanup(): void {
    for (const serviceName of this.healthCheckIntervals.keys()) {
      this.stopHealthMonitoring(serviceName);
    }
  }
}

/**
 * Global degradation manager instance
 */
export const degradationManager = new GracefulDegradationManager();

/**
 * Specific degradation strategies for different services
 */
export class DegradationStrategies {
  /**
   * Redis cache degradation - fall back to database
   */
  static async withCacheFallback<T>(
    cacheOperation: () => Promise<T>,
    databaseFallback: () => Promise<T>
  ): Promise<T> {
    return degradationManager.executeWithFallback(
      'redis-cache',
      cacheOperation,
      async () => {
        console.warn('Redis cache unavailable, falling back to database');
        return databaseFallback();
      }
    );
  }

  /**
   * Supabase Storage degradation - disable uploads, serve cached file list
   */
  static async withStorageFallback<T>(
    storageOperation: () => Promise<T>,
    fallbackResponse?: T
  ): Promise<T> {
    return degradationManager.executeWithFallback(
      'supabase-storage',
      storageOperation,
      async () => {
        if (fallbackResponse !== undefined) {
          console.warn('Supabase Storage unavailable, returning cached response');
          return fallbackResponse;
        }
        throw new StorageError('Storage service unavailable and no fallback provided');
      }
    );
  }

  /**
   * SSE degradation - fall back to polling
   */
  static async withSSEFallback<T>(
    sseOperation: () => Promise<T>,
    pollingFallback: () => Promise<T>
  ): Promise<T> {
    return degradationManager.executeWithFallback(
      'sse-service',
      sseOperation,
      async () => {
        console.warn('SSE service unavailable, falling back to polling');
        return pollingFallback();
      }
    );
  }

  /**
   * Notification service degradation - queue for later delivery
   */
  static async withNotificationFallback<T>(
    notificationOperation: () => Promise<T>,
    queueForLater: () => Promise<T>
  ): Promise<T> {
    return degradationManager.executeWithFallback(
      'notification-service',
      notificationOperation,
      async () => {
        console.warn('Notification service unavailable, queuing for later delivery');
        return queueForLater();
      }
    );
  }

  /**
   * Materialized view degradation - use real-time aggregation
   */
  static async withMaterializedViewFallback<T>(
    materializedViewQuery: () => Promise<T>,
    realTimeAggregation: () => Promise<T>
  ): Promise<T> {
    return degradationManager.executeWithFallback(
      'materialized-views',
      materializedViewQuery,
      async () => {
        console.warn('Materialized views unavailable, using real-time aggregation (slower)');
        return realTimeAggregation();
      }
    );
  }
}

/**
 * Feature flags for degradation modes
 */
export class FeatureFlags {
  private static flags: Map<string, boolean> = new Map();

  /**
   * Set feature flag
   */
  static setFlag(feature: string, enabled: boolean): void {
    this.flags.set(feature, enabled);
  }

  /**
   * Check if feature is enabled
   */
  static isEnabled(feature: string): boolean {
    return this.flags.get(feature) ?? true; // Default to enabled
  }

  /**
   * Disable feature temporarily
   */
  static disableTemporarily(feature: string, duration: number): void {
    this.setFlag(feature, false);
    setTimeout(() => {
      this.setFlag(feature, true);
      console.log(`Feature '${feature}' re-enabled after degradation period`);
    }, duration);
  }

  /**
   * Get all feature flags
   */
  static getAllFlags(): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    for (const [feature, enabled] of this.flags) {
      flags[feature] = enabled;
    }
    return flags;
  }
}

/**
 * System resource monitor for degradation decisions
 */
export class ResourceMonitor {
  private static cpuUsage: number = 0;
  private static memoryUsage: number = 0;
  private static lastCheck: Date = new Date();

  /**
   * Update system resource usage
   */
  static updateResourceUsage(cpu: number, memory: number): void {
    this.cpuUsage = cpu;
    this.memoryUsage = memory;
    this.lastCheck = new Date();

    // Auto-disable non-critical features if resources are constrained
    if (cpu > 80 || memory > 85) {
      console.warn(`High resource usage detected (CPU: ${cpu}%, Memory: ${memory}%), enabling degradation mode`);
      this.enableDegradationMode();
    } else if (cpu < 60 && memory < 70) {
      this.disableDegradationMode();
    }
  }

  /**
   * Check if system is under resource pressure
   */
  static isUnderResourcePressure(): boolean {
    return this.cpuUsage > 80 || this.memoryUsage > 85;
  }

  /**
   * Enable degradation mode for non-critical features
   */
  private static enableDegradationMode(): void {
    FeatureFlags.setFlag('analytics', false);
    FeatureFlags.setFlag('recommendations', false);
    FeatureFlags.setFlag('background-jobs', false);
    FeatureFlags.setFlag('detailed-logging', false);
  }

  /**
   * Disable degradation mode
   */
  private static disableDegradationMode(): void {
    FeatureFlags.setFlag('analytics', true);
    FeatureFlags.setFlag('recommendations', true);
    FeatureFlags.setFlag('background-jobs', true);
    FeatureFlags.setFlag('detailed-logging', true);
  }

  /**
   * Get current resource usage
   */
  static getResourceUsage(): { cpu: number; memory: number; lastCheck: Date } {
    return {
      cpu: this.cpuUsage,
      memory: this.memoryUsage,
      lastCheck: this.lastCheck
    };
  }
}

/**
 * Convenience functions for common degradation patterns
 */

/**
 * Execute with cache fallback to database
 */
export async function withCacheFallback<T>(
  cacheKey: string,
  cacheGet: () => Promise<T | null>,
  databaseGet: () => Promise<T>,
  cacheSet?: (value: T) => Promise<void>
): Promise<T> {
  return DegradationStrategies.withCacheFallback(
    async () => {
      const cached = await cacheGet();
      if (cached !== null) {
        return cached;
      }
      throw new CacheError('Cache miss');
    },
    async () => {
      const result = await databaseGet();
      // Try to set cache for next time, but don't fail if cache is down
      if (cacheSet) {
        try {
          await cacheSet(result);
        } catch (error) {
          console.warn('Failed to update cache after database fallback:', error);
        }
      }
      return result;
    }
  );
}

/**
 * Execute with storage fallback
 */
export async function withStorageFallback<T>(
  storageOperation: () => Promise<T>,
  fallbackValue?: T,
  errorMessage?: string
): Promise<T> {
  return DegradationStrategies.withStorageFallback(
    storageOperation,
    fallbackValue
  ).catch((error) => {
    if (!fallbackValue) {
      throw new StorageError(
        errorMessage || 'Storage service unavailable',
        'unknown',
        undefined,
        undefined
      );
    }
    throw error;
  });
}