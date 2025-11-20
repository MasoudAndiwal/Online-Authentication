/**
 * Enhanced Dashboard Service with Contextual Error Logging
 * 
 * Demonstrates comprehensive integration of contextual error logging
 * throughout service layer operations, implementing requirement 9.5.
 */

import { 
  withDatabaseErrorLogging, 
  withCacheErrorLogging,
  withExternalServiceErrorLogging,
  errorLogger,
  logError
} from '../errors';
import { 
  ValidationError, 
  NotFoundError, 
  DatabaseError, 
  CacheError,
  InternalError 
} from '../errors/custom-errors';

/**
 * Student dashboard metrics interface
 */
interface StudentDashboardMetrics {
  totalClasses: number;
  attendanceRate: number;
  presentDays: number;
  absentDays: number;
  sickDays: number;
  leaveDays: number;
  classAverage: number;
  ranking: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
  cached?: boolean;
  source: 'cache' | 'database' | 'materialized_view';
}

/**
 * Class statistics interface
 */
interface ClassStatistics {
  classId: string;
  totalStudents: number;
  averageAttendance: number;
  medianAttendance: number;
  highestAttendance: number;
  lowestAttendance: number;
  studentsAtRisk: number;
  lastCalculated: Date;
}

/**
 * Enhanced Dashboard Service with comprehensive error logging
 */
export class EnhancedDashboardService {
  private cacheService: any; // Mock cache service
  private dbService: any;    // Mock database service

  constructor(cacheService: any, dbService: any) {
    this.cacheService = cacheService;
    this.dbService = dbService;
    
    // Set service context for error logging
    errorLogger.setTag('service', 'dashboard');
    errorLogger.setContext('service_info', {
      name: 'EnhancedDashboardService',
      version: '1.0.0',
      initialized: new Date().toISOString()
    });
  }

  /**
   * Get student metrics with comprehensive error logging and caching
   */
  async getStudentMetrics(studentId: string, requestId?: string): Promise<StudentDashboardMetrics> {
    // Input validation with contextual logging
    if (!studentId || typeof studentId !== 'string') {
      const error = new ValidationError('Invalid student ID format', 'studentId', undefined, requestId);
      
      await logError(
        error,
        {
          requestId: requestId || `metrics_${Date.now()}`,
          timestamp: new Date(),
          endpoint: 'getStudentMetrics',
          method: 'GET'
        },
        {
          operation: 'getStudentMetrics',
          inputValidation: 'failed',
          providedStudentId: studentId,
          studentIdType: typeof studentId
        },
        ['validation-error', 'student-metrics']
      );
      
      throw error;
    }

    const cacheKey = `student:metrics:${studentId}`;
    
    try {
      // Try cache first with error logging
      const cachedMetrics = await withCacheErrorLogging(
        () => this.cacheService.get(cacheKey),
        'getCachedStudentMetrics',
        cacheKey
      )();

      if (cachedMetrics) {
        // Log cache hit for monitoring
        await errorLogger.logInfo(
          `Cache hit for student metrics: ${studentId}`,
          {
            requestId: requestId || `cache_hit_${Date.now()}`,
            timestamp: new Date()
          },
          {
            operation: 'getStudentMetrics',
            cacheKey,
            cacheHit: true,
            studentId
          }
        );

        return {
          ...cachedMetrics,
          cached: true,
          source: 'cache' as const
        };
      }

      // Cache miss - fetch from database with error logging
      const dbMetrics = await withDatabaseErrorLogging(
        () => this.fetchStudentMetricsFromDatabase(studentId),
        'fetchStudentMetricsFromDatabase',
        'students'
      )();

      // Cache the result with error logging
      await withCacheErrorLogging(
        () => this.cacheService.set(cacheKey, dbMetrics, 300), // 5 minute TTL
        'cacheStudentMetrics',
        cacheKey
      )();

      return {
        ...dbMetrics,
        cached: false,
        source: 'database' as const
      };

    } catch (error) {
      // Enhanced error context for service-level errors
      await logError(
        error as Error,
        {
          requestId: requestId || `error_${Date.now()}`,
          timestamp: new Date(),
          endpoint: 'getStudentMetrics',
          method: 'GET',
          userId: studentId
        },
        {
          operation: 'getStudentMetrics',
          studentId,
          cacheKey,
          service: 'EnhancedDashboardService',
          errorLocation: 'service_layer'
        },
        ['service-error', 'student-metrics', 'dashboard']
      );

      throw error;
    }
  }

  /**
   * Get class statistics with materialized view optimization
   */
  async getClassStatistics(classId: string, requestId?: string): Promise<ClassStatistics> {
    if (!classId) {
      throw new ValidationError('Class ID is required', 'classId', undefined, requestId);
    }

    try {
      // Use materialized view with error logging
      const stats = await withDatabaseErrorLogging(
        () => this.fetchClassStatisticsFromMaterializedView(classId),
        'fetchClassStatisticsFromMaterializedView',
        'class_statistics'
      )();

      // Log successful operation with performance metrics
      await errorLogger.logInfo(
        `Class statistics retrieved successfully: ${classId}`,
        {
          requestId: requestId || `class_stats_${Date.now()}`,
          timestamp: new Date()
        },
        {
          operation: 'getClassStatistics',
          classId,
          totalStudents: stats.totalStudents,
          studentsAtRisk: stats.studentsAtRisk,
          dataSource: 'materialized_view'
        }
      );

      return stats;

    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: requestId || `class_error_${Date.now()}`,
          timestamp: new Date(),
          endpoint: 'getClassStatistics'
        },
        {
          operation: 'getClassStatistics',
          classId,
          service: 'EnhancedDashboardService'
        },
        ['service-error', 'class-statistics']
      );

      throw error;
    }
  }

  /**
   * Invalidate student cache with comprehensive logging
   */
  async invalidateStudentCache(studentId: string, reason: string = 'manual'): Promise<void> {
    const cacheKeys = [
      `student:metrics:${studentId}`,
      `student:ranking:${studentId}`,
      `student:weekly:${studentId}:*`
    ];

    try {
      // Invalidate multiple cache keys
      const results = await Promise.allSettled(
        cacheKeys.map(key => 
          withCacheErrorLogging(
            () => this.cacheService.delete(key),
            'invalidateCache',
            key
          )()
        )
      );

      // Log invalidation results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      await errorLogger.logInfo(
        `Cache invalidation completed for student ${studentId}`,
        {
          requestId: `invalidate_${Date.now()}`,
          timestamp: new Date()
        },
        {
          operation: 'invalidateStudentCache',
          studentId,
          reason,
          totalKeys: cacheKeys.length,
          successful,
          failed,
          cacheKeys
        }
      );

      // Log any failures
      if (failed > 0) {
        const failures = results
          .map((result, index) => ({ result, key: cacheKeys[index] }))
          .filter(({ result }) => result.status === 'rejected')
          .map(({ result, key }) => ({ key, error: (result as PromiseRejectedResult).reason }));

        await errorLogger.logWarning(
          `Some cache invalidations failed for student ${studentId}`,
          {
            requestId: `invalidate_partial_${Date.now()}`,
            timestamp: new Date()
          },
          {
            operation: 'invalidateStudentCache',
            studentId,
            failures
          }
        );
      }

    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: `invalidate_error_${Date.now()}`,
          timestamp: new Date()
        },
        {
          operation: 'invalidateStudentCache',
          studentId,
          reason,
          cacheKeys
        },
        ['cache-error', 'invalidation']
      );

      throw error;
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(studentIds: string[]): Promise<void> {
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      throw new ValidationError('Student IDs array is required and must not be empty');
    }

    const startTime = performance.now();
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ studentId: string; error: string }>
    };

    try {
      // Process students in batches to avoid overwhelming the system
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < studentIds.length; i += batchSize) {
        batches.push(studentIds.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const batchPromises = batch.map(async (studentId) => {
          try {
            await this.getStudentMetrics(studentId, `warm_${Date.now()}`);
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              studentId,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        });

        await Promise.allSettled(batchPromises);
      }

      const duration = performance.now() - startTime;

      // Log cache warming results
      await errorLogger.logInfo(
        `Cache warming completed`,
        {
          requestId: `warm_${Date.now()}`,
          timestamp: new Date(),
          duration
        },
        {
          operation: 'warmCache',
          totalStudents: studentIds.length,
          successful: results.successful,
          failed: results.failed,
          duration,
          batchSize,
          totalBatches: batches.length
        }
      );

      // Log errors if any
      if (results.errors.length > 0) {
        await errorLogger.logWarning(
          `Cache warming had ${results.errors.length} failures`,
          {
            requestId: `warm_errors_${Date.now()}`,
            timestamp: new Date()
          },
          {
            operation: 'warmCache',
            errors: results.errors.slice(0, 10) // Limit to first 10 errors
          }
        );
      }

    } catch (error) {
      await logError(
        error as Error,
        {
          requestId: `warm_error_${Date.now()}`,
          timestamp: new Date()
        },
        {
          operation: 'warmCache',
          studentCount: studentIds.length,
          results
        },
        ['cache-error', 'warm-cache']
      );

      throw error;
    }
  }

  /**
   * Private method: Fetch student metrics from database
   */
  private async fetchStudentMetricsFromDatabase(studentId: string): Promise<StudentDashboardMetrics> {
    // Simulate database operation
    if (studentId === 'not-found') {
      throw new NotFoundError('Student not found', 'student', studentId);
    }

    if (studentId === 'db-error') {
      throw new DatabaseError('Connection timeout', 'SELECT', 'students');
    }

    // Mock successful database response
    return {
      totalClasses: 120,
      attendanceRate: 85.5,
      presentDays: 102,
      absentDays: 15,
      sickDays: 2,
      leaveDays: 1,
      classAverage: 78.2,
      ranking: 15,
      trend: 'improving',
      lastUpdated: new Date(),
      source: 'database'
    };
  }

  /**
   * Private method: Fetch class statistics from materialized view
   */
  private async fetchClassStatisticsFromMaterializedView(classId: string): Promise<ClassStatistics> {
    // Mock materialized view query
    return {
      classId,
      totalStudents: 45,
      averageAttendance: 78.2,
      medianAttendance: 80.1,
      highestAttendance: 98.5,
      lowestAttendance: 45.2,
      studentsAtRisk: 8,
      lastCalculated: new Date()
    };
  }
}

/**
 * Factory function to create dashboard service with error logging
 */
export function createEnhancedDashboardService(
  cacheService: any,
  dbService: any
): EnhancedDashboardService {
  return new EnhancedDashboardService(cacheService, dbService);
}

export type { StudentDashboardMetrics, ClassStatistics };