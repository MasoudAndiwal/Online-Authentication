/**
 * Resource Monitor Service
 * 
 * Monitors CPU and memory usage to implement resource-based degradation.
 * Disables non-critical features when resources are constrained and provides
 * health check endpoint with resource metrics.
 * 
 * Requirements: 10.5
 * Property: 47 - Resource-Constrained Degradation
 */

import { FeatureFlags, ResourceMonitor } from '../errors/graceful-degradation';
import { getCacheEvictionService } from './cache-eviction-service';
import { getPriorityJobQueue } from './priority-job-queue';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface ResourceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
  };
  memory: {
    usage: number;
    usagePercent: number;
    total: number;
    free: number;
    heapUsed: number;
    heapTotal: number;
  };
  disk: {
    usage: number;
    usagePercent: number;
    total: number;
    free: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connectionsActive: number;
  };
  process: {
    uptime: number;
    pid: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
  };
}

export interface ResourceThresholds {
  cpu: {
    warning: number;
    critical: number;
    recovery: number;
  };
  memory: {
    warning: number;
    critical: number;
    recovery: number;
  };
  disk: {
    warning: number;
    critical: number;
  };
}

export interface DegradationState {
  isActive: boolean;
  level: 'none' | 'light' | 'moderate' | 'severe';
  activatedAt?: Date;
  reason: string;
  disabledFeatures: string[];
  affectedServices: string[];
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  metrics: ResourceMetrics;
  degradation: DegradationState;
  alerts: string[];
  recommendations: string[];
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_THRESHOLDS: ResourceThresholds = {
  cpu: {
    warning: 70,
    critical: 85,
    recovery: 60
  },
  memory: {
    warning: 75,
    critical: 90,
    recovery: 65
  },
  disk: {
    warning: 80,
    critical: 95
  }
};

const MONITORING_INTERVAL = 10000; // 10 seconds
const DEGRADATION_CHECK_INTERVAL = 30000; // 30 seconds
const METRICS_HISTORY_SIZE = 100; // Keep last 100 measurements

// ============================================================================
// Resource Monitor Service
// ============================================================================

export class ResourceMonitorService {
  private thresholds: ResourceThresholds;
  private monitoringTimer: NodeJS.Timeout | null = null;
  private degradationTimer: NodeJS.Timeout | null = null;
  private metricsHistory: ResourceMetrics[] = [];
  private currentDegradation: DegradationState;
  private isInitialized: boolean = false;
  private startTime: Date = new Date();

  constructor(thresholds?: Partial<ResourceThresholds>) {
    this.thresholds = this.mergeThresholds(thresholds);
    this.currentDegradation = {
      isActive: false,
      level: 'none',
      reason: '',
      disabledFeatures: [],
      affectedServices: []
    };
  }

  /**
   * Merge custom thresholds with defaults
   */
  private mergeThresholds(custom?: Partial<ResourceThresholds>): ResourceThresholds {
    return {
      cpu: { ...DEFAULT_THRESHOLDS.cpu, ...custom?.cpu },
      memory: { ...DEFAULT_THRESHOLDS.memory, ...custom?.memory },
      disk: { ...DEFAULT_THRESHOLDS.disk, ...custom?.disk }
    };
  }

  /**
   * Initialize resource monitoring
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Resource monitor already initialized');
      return;
    }

    try {
      console.log('Initializing resource monitor...');
      
      // Take initial measurement
      await this.collectMetrics();
      
      // Start monitoring
      this.startMonitoring();
      
      // Start degradation checks
      this.startDegradationChecks();
      
      this.isInitialized = true;
      console.log('Resource monitor initialized successfully');
      
      // Log initial status
      const health = await this.getHealthCheck();
      console.log(`Initial system status: ${health.status}`);
      
    } catch (error) {
      console.error('Failed to initialize resource monitor:', error);
      throw error;
    }
  }

  /**
   * Start periodic resource monitoring
   */
  private startMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }

    this.monitoringTimer = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Resource monitoring error:', error);
      }
    }, MONITORING_INTERVAL);

    console.log(`Resource monitoring started (interval: ${MONITORING_INTERVAL}ms)`);
  }

  /**
   * Start periodic degradation checks
   */
  private startDegradationChecks(): void {
    if (this.degradationTimer) {
      clearInterval(this.degradationTimer);
    }

    this.degradationTimer = setInterval(async () => {
      try {
        await this.checkAndApplyDegradation();
      } catch (error) {
        console.error('Degradation check error:', error);
      }
    }, DEGRADATION_CHECK_INTERVAL);

    console.log(`Degradation checks started (interval: ${DEGRADATION_CHECK_INTERVAL}ms)`);
  }

  /**
   * Collect current resource metrics
   */
  private async collectMetrics(): Promise<ResourceMetrics> {
    const metrics: ResourceMetrics = {
      cpu: await this.getCPUMetrics(),
      memory: this.getMemoryMetrics(),
      disk: await this.getDiskMetrics(),
      network: await this.getNetworkMetrics(),
      process: this.getProcessMetrics()
    };

    // Add to history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > METRICS_HISTORY_SIZE) {
      this.metricsHistory.shift();
    }

    // Update global resource monitor
    ResourceMonitor.updateResourceUsage(
      metrics.cpu.usage,
      metrics.memory.usagePercent
    );

    return metrics;
  }

  /**
   * Get CPU metrics
   */
  private async getCPUMetrics(): Promise<ResourceMetrics['cpu']> {
    const cpuUsage = process.cpuUsage();
    const loadAverage = process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0];
    const cores = require('os').cpus().length;
    
    // Calculate CPU usage percentage (simplified)
    const usage = this.metricsHistory.length > 0 
      ? this.calculateCPUUsagePercent(cpuUsage)
      : 0;

    return {
      usage: Math.min(100, Math.max(0, usage)),
      loadAverage,
      cores
    };
  }

  /**
   * Calculate CPU usage percentage from process.cpuUsage()
   */
  private calculateCPUUsagePercent(cpuUsage: NodeJS.CpuUsage): number {
    if (this.metricsHistory.length === 0) return 0;
    
    const lastMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const lastCpuUsage = lastMetrics.process.cpuUsage;
    
    const userDiff = cpuUsage.user - lastCpuUsage.user;
    const systemDiff = cpuUsage.system - lastCpuUsage.system;
    const totalDiff = userDiff + systemDiff;
    
    // Convert microseconds to percentage (rough approximation)
    const intervalMs = MONITORING_INTERVAL * 1000; // Convert to microseconds
    const usage = (totalDiff / intervalMs) * 100;
    
    return usage;
  }

  /**
   * Get memory metrics
   */
  private getMemoryMetrics(): ResourceMetrics['memory'] {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    
    return {
      usage: usedMemory,
      usagePercent: (usedMemory / totalMemory) * 100,
      total: totalMemory,
      free: freeMemory,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal
    };
  }

  /**
   * Get disk metrics (simplified - would need platform-specific implementation)
   */
  private async getDiskMetrics(): Promise<ResourceMetrics['disk']> {
    // Simplified disk metrics - in production, use platform-specific tools
    try {
      const fs = require('fs');
      const stats = await fs.promises.statfs ? fs.promises.statfs('.') : null;
      
      if (stats) {
        const total = stats.blocks * stats.bsize;
        const free = stats.bavail * stats.bsize;
        const used = total - free;
        
        return {
          usage: used,
          usagePercent: (used / total) * 100,
          total,
          free
        };
      }
    } catch (error) {
      // Fallback for platforms without statfs
    }
    
    return {
      usage: 0,
      usagePercent: 0,
      total: 0,
      free: 0
    };
  }

  /**
   * Get network metrics (simplified)
   */
  private async getNetworkMetrics(): Promise<ResourceMetrics['network']> {
    // Simplified network metrics - would need more sophisticated monitoring
    return {
      bytesReceived: 0,
      bytesSent: 0,
      connectionsActive: 0
    };
  }

  /**
   * Get process metrics
   */
  private getProcessMetrics(): ResourceMetrics['process'] {
    return {
      uptime: process.uptime(),
      pid: process.pid,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Check resource usage and apply degradation if needed
   */
  private async checkAndApplyDegradation(): Promise<void> {
    if (this.metricsHistory.length === 0) return;

    const currentMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const cpuUsage = currentMetrics.cpu.usage;
    const memoryUsage = currentMetrics.memory.usagePercent;

    // Determine degradation level needed
    const requiredLevel = this.calculateRequiredDegradationLevel(cpuUsage, memoryUsage);
    
    if (requiredLevel !== this.currentDegradation.level) {
      await this.applyDegradation(requiredLevel, cpuUsage, memoryUsage);
    }
  }

  /**
   * Calculate required degradation level based on resource usage
   */
  private calculateRequiredDegradationLevel(
    cpuUsage: number, 
    memoryUsage: number
  ): DegradationState['level'] {
    const cpuCritical = cpuUsage >= this.thresholds.cpu.critical;
    const memoryCritical = memoryUsage >= this.thresholds.memory.critical;
    const cpuWarning = cpuUsage >= this.thresholds.cpu.warning;
    const memoryWarning = memoryUsage >= this.thresholds.memory.warning;
    
    if (cpuCritical || memoryCritical) {
      return 'severe';
    } else if ((cpuWarning && memoryWarning) || cpuUsage >= 80 || memoryUsage >= 85) {
      return 'moderate';
    } else if (cpuWarning || memoryWarning) {
      return 'light';
    } else if (cpuUsage < this.thresholds.cpu.recovery && memoryUsage < this.thresholds.memory.recovery) {
      return 'none';
    }
    
    return this.currentDegradation.level; // No change
  }

  /**
   * Apply degradation measures based on level
   */
  private async applyDegradation(
    level: DegradationState['level'],
    cpuUsage: number,
    memoryUsage: number
  ): Promise<void> {
    const previousLevel = this.currentDegradation.level;
    
    if (level === 'none' && previousLevel !== 'none') {
      // Recovery - re-enable features
      await this.recoverFromDegradation();
    } else if (level !== 'none') {
      // Apply degradation
      await this.enableDegradation(level, cpuUsage, memoryUsage);
    }
  }

  /**
   * Enable degradation measures
   */
  private async enableDegradation(
    level: DegradationState['level'],
    cpuUsage: number,
    memoryUsage: number
  ): Promise<void> {
    const disabledFeatures: string[] = [];
    const affectedServices: string[] = [];
    
    console.warn(`Enabling ${level} degradation mode (CPU: ${cpuUsage}%, Memory: ${memoryUsage}%)`);
    
    switch (level) {
      case 'severe':
        // Severe degradation - disable most non-critical features
        FeatureFlags.setFlag('analytics', false);
        FeatureFlags.setFlag('recommendations', false);
        FeatureFlags.setFlag('detailed-logging', false);
        FeatureFlags.setFlag('background-jobs-low-priority', false);
        FeatureFlags.setFlag('cache-warming', false);
        FeatureFlags.setFlag('file-processing', false);
        
        disabledFeatures.push('analytics', 'recommendations', 'detailed-logging', 'low-priority-jobs', 'cache-warming', 'file-processing');
        affectedServices.push('background-jobs', 'cache-service', 'file-service');
        
        // Trigger emergency cache eviction
        try {
          const cacheEviction = getCacheEvictionService();
          await cacheEviction.triggerEviction(60); // Target 60% memory usage
        } catch (error) {
          console.error('Failed to trigger emergency cache eviction:', error);
        }
        break;
        
      case 'moderate':
        // Moderate degradation - disable some features
        FeatureFlags.setFlag('analytics', false);
        FeatureFlags.setFlag('recommendations', false);
        FeatureFlags.setFlag('detailed-logging', false);
        
        disabledFeatures.push('analytics', 'recommendations', 'detailed-logging');
        affectedServices.push('analytics-service', 'recommendation-service');
        break;
        
      case 'light':
        // Light degradation - disable only heavy features
        FeatureFlags.setFlag('analytics', false);
        FeatureFlags.setFlag('detailed-logging', false);
        
        disabledFeatures.push('analytics', 'detailed-logging');
        affectedServices.push('analytics-service');
        break;
    }
    
    this.currentDegradation = {
      isActive: true,
      level,
      activatedAt: new Date(),
      reason: `High resource usage (CPU: ${cpuUsage}%, Memory: ${memoryUsage}%)`,
      disabledFeatures,
      affectedServices
    };
  }

  /**
   * Recover from degradation mode
   */
  private async recoverFromDegradation(): Promise<void> {
    console.log('Recovering from degradation mode - re-enabling features');
    
    // Re-enable all features
    FeatureFlags.setFlag('analytics', true);
    FeatureFlags.setFlag('recommendations', true);
    FeatureFlags.setFlag('detailed-logging', true);
    FeatureFlags.setFlag('background-jobs-low-priority', true);
    FeatureFlags.setFlag('cache-warming', true);
    FeatureFlags.setFlag('file-processing', true);
    
    this.currentDegradation = {
      isActive: false,
      level: 'none',
      reason: '',
      disabledFeatures: [],
      affectedServices: []
    };
  }

  /**
   * Get comprehensive health check
   */
  async getHealthCheck(): Promise<HealthCheckResult> {
    const currentMetrics = this.metricsHistory.length > 0 
      ? this.metricsHistory[this.metricsHistory.length - 1]
      : await this.collectMetrics();
    
    const alerts: string[] = [];
    const recommendations: string[] = [];
    
    // Check for alerts
    if (currentMetrics.cpu.usage >= this.thresholds.cpu.critical) {
      alerts.push(`Critical CPU usage: ${currentMetrics.cpu.usage}%`);
    } else if (currentMetrics.cpu.usage >= this.thresholds.cpu.warning) {
      alerts.push(`High CPU usage: ${currentMetrics.cpu.usage}%`);
    }
    
    if (currentMetrics.memory.usagePercent >= this.thresholds.memory.critical) {
      alerts.push(`Critical memory usage: ${currentMetrics.memory.usagePercent}%`);
    } else if (currentMetrics.memory.usagePercent >= this.thresholds.memory.warning) {
      alerts.push(`High memory usage: ${currentMetrics.memory.usagePercent}%`);
    }
    
    // Generate recommendations
    if (currentMetrics.cpu.usage > 60) {
      recommendations.push('Consider scaling horizontally or optimizing CPU-intensive operations');
    }
    
    if (currentMetrics.memory.usagePercent > 70) {
      recommendations.push('Consider increasing memory allocation or implementing more aggressive caching policies');
    }
    
    if (this.currentDegradation.isActive) {
      recommendations.push('System is in degradation mode - some features are temporarily disabled');
    }
    
    // Determine overall status
    let status: HealthCheckResult['status'] = 'healthy';
    if (this.currentDegradation.level === 'severe') {
      status = 'critical';
    } else if (this.currentDegradation.isActive || alerts.length > 0) {
      status = 'degraded';
    }
    
    return {
      status,
      timestamp: new Date(),
      metrics: currentMetrics,
      degradation: { ...this.currentDegradation },
      alerts,
      recommendations
    };
  }

  /**
   * Get resource metrics history
   */
  getMetricsHistory(limit?: number): ResourceMetrics[] {
    const history = [...this.metricsHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get current degradation state
   */
  getDegradationState(): DegradationState {
    return { ...this.currentDegradation };
  }

  /**
   * Manually trigger degradation (for testing)
   */
  async triggerDegradation(level: DegradationState['level'], reason: string): Promise<void> {
    console.log(`Manually triggering ${level} degradation: ${reason}`);
    await this.enableDegradation(level, 0, 0);
    this.currentDegradation.reason = reason;
  }

  /**
   * Manually recover from degradation (for testing)
   */
  async triggerRecovery(): Promise<void> {
    console.log('Manually triggering recovery from degradation');
    await this.recoverFromDegradation();
  }

  /**
   * Update resource thresholds
   */
  updateThresholds(newThresholds: Partial<ResourceThresholds>): void {
    this.thresholds = this.mergeThresholds(newThresholds);
    console.log('Resource thresholds updated:', this.thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds(): ResourceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Check if system is healthy
   */
  async isHealthy(): Promise<boolean> {
    const health = await this.getHealthCheck();
    return health.status === 'healthy';
  }

  /**
   * Shutdown resource monitoring
   */
  async shutdown(): Promise<void> {
    console.log('Shutting down resource monitor...');
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    if (this.degradationTimer) {
      clearInterval(this.degradationTimer);
      this.degradationTimer = null;
    }
    
    // Recover from any active degradation
    if (this.currentDegradation.isActive) {
      await this.recoverFromDegradation();
    }
    
    this.isInitialized = false;
    console.log('Resource monitor shutdown complete');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let monitorInstance: ResourceMonitorService | null = null;

/**
 * Get the singleton resource monitor instance
 */
export function getResourceMonitor(): ResourceMonitorService {
  if (!monitorInstance) {
    monitorInstance = new ResourceMonitorService();
  }
  return monitorInstance;
}

/**
 * Initialize resource monitoring
 */
export async function initializeResourceMonitoring(thresholds?: Partial<ResourceThresholds>): Promise<void> {
  if (monitorInstance) {
    await monitorInstance.shutdown();
  }
  
  monitorInstance = new ResourceMonitorService(thresholds);
  await monitorInstance.initialize();
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get system health check
 */
export async function getSystemHealthCheck(): Promise<HealthCheckResult> {
  const monitor = getResourceMonitor();
  return monitor.getHealthCheck();
}

/**
 * Check if system is under resource pressure
 */
export async function isSystemUnderPressure(): Promise<boolean> {
  const monitor = getResourceMonitor();
  const health = await monitor.getHealthCheck();
  return health.status !== 'healthy';
}

/**
 * Get current resource metrics
 */
export async function getCurrentResourceMetrics(): Promise<ResourceMetrics> {
  const monitor = getResourceMonitor();
  const history = monitor.getMetricsHistory(1);
  return history[0] || await monitor['collectMetrics']();
}

// Auto-initialize when imported (server-side only)
if (typeof window === 'undefined') {
  const monitor = getResourceMonitor();
  monitor.initialize().catch(error => {
    console.error('Failed to auto-initialize resource monitor:', error);
  });
}

export default ResourceMonitorService;