/**
 * DashboardService
 * Business logic for calculating and aggregating student dashboard metrics
 * Implements cache-first strategy with intelligent invalidation
 */

import { CacheService, getCacheService } from './cache-service';
import { CACHE_KEYS, CACHE_TTL } from '../config/cache-config';
import { supabase } from '../supabase';

// ============================================================================
// Type Definitions
// ============================================================================

export interface StudentDashboardMetrics {
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
}

export interface ClassStatistics {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendance: number;
  medianAttendance: number;
  highestAttendance: number;
  lowestAttendance: number;
  studentsAtRisk: number; // Below 75%
  lastCalculated: Date;
}

export interface StudentRanking {
  studentId: string;
  rank: number;
  totalStudents: number;
  percentile: number;
  attendanceRate: number;
}

export interface MaterializedClassStats {
  class_id: string;
  class_name: string;
  total_students: number;
  average_attendance: number;
  median_attendance: number;
  highest_attendance: number;
  lowest_attendance: number;
  students_at_risk: number;
  last_calculated: string;
}

// ============================================================================
// DashboardService Class
// ============================================================================

export class DashboardService {
  private cache: CacheService;

  constructor(cacheService?: CacheService) {
    this.cache = cacheService || getCacheService();
  }

  /**
   * Get complete dashboard metrics for a student with cache-first strategy
   * Implements Requirements 1.2, 3.5 - Background refresh for stale data
   * 
   * Strategy:
   * 1. Check cache first
   * 2. If cached and fresh (TTL > 60s), return immediately
   * 3. If cached but stale (TTL < 60s), return stale data and trigger background refresh
   * 4. If cache miss, fetch from database and cache
   */
  async getStudentMetrics(studentId: string): Promise<StudentDashboardMetrics> {
    const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);

    // Try cache first
    const cached = await this.cache.get<StudentDashboardMetrics>(cacheKey);
    
    if (cached) {
      // Check TTL to determine if we should refresh in background
      const ttl = await this.cache.ttl(cacheKey);
      
      // If TTL is less than 60 seconds, trigger background refresh
      if (ttl > 0 && ttl < 60) {
        // Serve stale data immediately
        console.log(`Serving stale cache for student ${studentId}, TTL: ${ttl}s, triggering background refresh`);
        
        // Trigger background refresh (don't await)
        this.refreshStudentMetricsInBackground(studentId).catch(error => {
          console.error(`Background refresh failed for student ${studentId}:`, error);
        });
      }
      
      return cached;
    }

    // Cache miss - calculate from database
    const metrics = await this.calculateStudentMetrics(studentId);

    // Store in cache
    await this.cache.set(cacheKey, metrics, CACHE_TTL.STUDENT_METRICS);

    return metrics;
  }

  /**
   * Refresh student metrics in background
   * This method is called asynchronously when serving stale data
   * Implements Requirements 1.2, 3.5
   */
  private async refreshStudentMetricsInBackground(studentId: string): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);
      
      // Calculate fresh metrics
      const metrics = await this.calculateStudentMetrics(studentId);
      
      // Update cache with fresh data
      await this.cache.set(cacheKey, metrics, CACHE_TTL.STUDENT_METRICS);
      
      console.log(`Background refresh completed for student ${studentId}`);
    } catch (error) {
      console.error(`Background refresh error for student ${studentId}:`, error);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Calculate student metrics from database
   * Private method used when cache misses
   */
  private async calculateStudentMetrics(studentId: string): Promise<StudentDashboardMetrics> {
    // Fetch student's attendance records
    const { data: attendanceRecords, error } = await supabase
      .from('attendance_records')
      .select('status, date')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }

    const records = attendanceRecords || [];
    const totalClasses = records.filter(r => r.status !== 'NOT_MARKED').length;
    const presentDays = records.filter(r => r.status === 'PRESENT').length;
    const absentDays = records.filter(r => r.status === 'ABSENT').length;
    const sickDays = records.filter(r => r.status === 'SICK').length;
    const leaveDays = records.filter(r => r.status === 'LEAVE').length;

    const attendanceRate = totalClasses > 0 ? (presentDays / totalClasses) * 100 : 0;

    // Get student's class for class average and ranking
    const { data: student } = await supabase
      .from('students')
      .select('class_section')
      .eq('id', studentId)
      .single();

    const classSection = student?.class_section || '';

    // Get class average
    const classStats = await this.getClassStatistics(classSection);
    const classAverage = classStats?.averageAttendance || 0;

    // Get ranking
    const ranking = await this.getStudentRanking(studentId, classSection);

    // Calculate trend (compare last 2 weeks vs previous 2 weeks)
    const trend = this.calculateTrend(records);

    return {
      totalClasses,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      presentDays,
      absentDays,
      sickDays,
      leaveDays,
      classAverage: parseFloat(classAverage.toFixed(2)),
      ranking: ranking.rank,
      trend,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate attendance trend
   */
  private calculateTrend(records: Array<{ status: string; date: string }>): 'improving' | 'declining' | 'stable' {
    if (records.length < 10) {
      return 'stable'; // Not enough data
    }

    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    // Recent 2 weeks
    const recentRecords = records.filter(r => {
      const date = new Date(r.date);
      return date >= twoWeeksAgo && date <= now;
    });

    // Previous 2 weeks
    const previousRecords = records.filter(r => {
      const date = new Date(r.date);
      return date >= fourWeeksAgo && date < twoWeeksAgo;
    });

    if (recentRecords.length === 0 || previousRecords.length === 0) {
      return 'stable';
    }

    const recentRate = recentRecords.filter(r => r.status === 'PRESENT').length / recentRecords.length;
    const previousRate = previousRecords.filter(r => r.status === 'PRESENT').length / previousRecords.length;

    const difference = recentRate - previousRate;

    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * Get class statistics using materialized views
   * Implements Requirements 1.3, 3.1, 3.5 - Background refresh for stale data
   * 
   * Strategy:
   * 1. Check cache first
   * 2. If cached and fresh, return immediately
   * 3. If cached but stale, return stale data and trigger background refresh
   * 4. If cache miss, query materialized view and cache
   */
  async getClassStatistics(classId: string): Promise<ClassStatistics | null> {
    const cacheKey = CACHE_KEYS.CLASS_STATISTICS(classId);

    // Try cache first
    const cached = await this.cache.get<ClassStatistics>(cacheKey);
    
    if (cached) {
      // Check TTL to determine if we should refresh in background
      const ttl = await this.cache.ttl(cacheKey);
      
      // If TTL is less than 60 seconds, trigger background refresh
      if (ttl > 0 && ttl < 60) {
        console.log(`Serving stale cache for class ${classId}, TTL: ${ttl}s, triggering background refresh`);
        
        // Trigger background refresh (don't await)
        this.refreshClassStatisticsInBackground(classId).catch(error => {
          console.error(`Background refresh failed for class ${classId}:`, error);
        });
      }
      
      return cached;
    }

    // Cache miss - query materialized view
    const { data, error } = await supabase
      .from('class_statistics')
      .select('*')
      .eq('class_id', classId)
      .single();

    if (error) {
      // If materialized view doesn't exist or no data, calculate on-the-fly
      console.warn(`Materialized view query failed: ${error.message}`);
      return await this.calculateClassStatistics(classId);
    }

    const stats = data as MaterializedClassStats;

    // Transform to ClassStatistics format
    const classStats: ClassStatistics = {
      classId: stats.class_id,
      className: stats.class_name,
      totalStudents: stats.total_students,
      averageAttendance: parseFloat(stats.average_attendance?.toFixed(2) || '0'),
      medianAttendance: parseFloat(stats.median_attendance?.toFixed(2) || '0'),
      highestAttendance: parseFloat(stats.highest_attendance?.toFixed(2) || '0'),
      lowestAttendance: parseFloat(stats.lowest_attendance?.toFixed(2) || '0'),
      studentsAtRisk: stats.students_at_risk,
      lastCalculated: new Date(stats.last_calculated),
    };

    // Cache the results
    await this.cache.set(cacheKey, classStats, CACHE_TTL.CLASS_STATISTICS);

    return classStats;
  }

  /**
   * Refresh class statistics in background
   * This method is called asynchronously when serving stale data
   * Implements Requirements 1.2, 3.5
   */
  private async refreshClassStatisticsInBackground(classId: string): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.CLASS_STATISTICS(classId);
      
      // Query fresh data from materialized view
      const { data, error } = await supabase
        .from('class_statistics')
        .select('*')
        .eq('class_id', classId)
        .single();

      if (error) {
        // Fall back to calculation if materialized view fails
        const calculated = await this.calculateClassStatistics(classId);
        if (calculated) {
          await this.cache.set(cacheKey, calculated, CACHE_TTL.CLASS_STATISTICS);
        }
        return;
      }

      const stats = data as MaterializedClassStats;

      const classStats: ClassStatistics = {
        classId: stats.class_id,
        className: stats.class_name,
        totalStudents: stats.total_students,
        averageAttendance: parseFloat(stats.average_attendance?.toFixed(2) || '0'),
        medianAttendance: parseFloat(stats.median_attendance?.toFixed(2) || '0'),
        highestAttendance: parseFloat(stats.highest_attendance?.toFixed(2) || '0'),
        lowestAttendance: parseFloat(stats.lowest_attendance?.toFixed(2) || '0'),
        studentsAtRisk: stats.students_at_risk,
        lastCalculated: new Date(stats.last_calculated),
      };
      
      // Update cache with fresh data
      await this.cache.set(cacheKey, classStats, CACHE_TTL.CLASS_STATISTICS);
      
      console.log(`Background refresh completed for class ${classId}`);
    } catch (error) {
      console.error(`Background refresh error for class ${classId}:`, error);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Calculate class statistics on-the-fly (fallback when materialized view unavailable)
   */
  private async calculateClassStatistics(classId: string): Promise<ClassStatistics | null> {
    // Get all students in the class
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id')
      .eq('class_section', classId);

    if (studentsError || !students || students.length === 0) {
      return null;
    }

    const studentIds = students.map(s => s.id);

    // Get attendance rates for all students
    const attendanceRates: number[] = [];

    for (const studentId of studentIds) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', studentId);

      if (records && records.length > 0) {
        const total = records.filter(r => r.status !== 'NOT_MARKED').length;
        const present = records.filter(r => r.status === 'PRESENT').length;
        const rate = total > 0 ? (present / total) * 100 : 0;
        attendanceRates.push(rate);
      }
    }

    if (attendanceRates.length === 0) {
      return null;
    }

    // Calculate statistics
    const average = attendanceRates.reduce((sum, rate) => sum + rate, 0) / attendanceRates.length;
    const sorted = [...attendanceRates].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const highest = Math.max(...attendanceRates);
    const lowest = Math.min(...attendanceRates);
    const atRisk = attendanceRates.filter(rate => rate < 75).length;

    return {
      classId,
      className: classId,
      totalStudents: students.length,
      averageAttendance: parseFloat(average.toFixed(2)),
      medianAttendance: parseFloat(median.toFixed(2)),
      highestAttendance: parseFloat(highest.toFixed(2)),
      lowestAttendance: parseFloat(lowest.toFixed(2)),
      studentsAtRisk: atRisk,
      lastCalculated: new Date(),
    };
  }

  /**
   * Get student ranking within class with optimized queries
   * Implements Requirements 3.2
   */
  async getStudentRanking(studentId: string, classId: string): Promise<StudentRanking> {
    const cacheKey = CACHE_KEYS.STUDENT_RANKING(classId, studentId);

    // Try cache first
    const cached = await this.cache.get<StudentRanking>(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate ranking
    const ranking = await this.calculateStudentRanking(studentId, classId);

    // Cache the result
    await this.cache.set(cacheKey, ranking, CACHE_TTL.STUDENT_RANKING);

    return ranking;
  }

  /**
   * Calculate student ranking within class
   */
  private async calculateStudentRanking(studentId: string, classId: string): Promise<StudentRanking> {
    // Get all students in the class
    const { data: students, error } = await supabase
      .from('students')
      .select('id')
      .eq('class_section', classId);

    if (error || !students) {
      throw new Error(`Failed to fetch students: ${error?.message}`);
    }

    const studentIds = students.map(s => s.id);
    const totalStudents = studentIds.length;

    // Get attendance rates for all students
    const studentRates: Array<{ studentId: string; rate: number }> = [];

    for (const sid of studentIds) {
      const { data: records } = await supabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', sid);

      if (records && records.length > 0) {
        const total = records.filter(r => r.status !== 'NOT_MARKED').length;
        const present = records.filter(r => r.status === 'PRESENT').length;
        const rate = total > 0 ? (present / total) * 100 : 0;
        studentRates.push({ studentId: sid, rate });
      } else {
        studentRates.push({ studentId: sid, rate: 0 });
      }
    }

    // Sort by rate descending
    studentRates.sort((a, b) => b.rate - a.rate);

    // Find student's rank
    const studentIndex = studentRates.findIndex(s => s.studentId === studentId);
    const rank = studentIndex + 1;
    const studentRate = studentRates[studentIndex]?.rate || 0;
    const percentile = totalStudents > 0 ? ((totalStudents - rank + 1) / totalStudents) * 100 : 0;

    return {
      studentId,
      rank,
      totalStudents,
      percentile: parseFloat(percentile.toFixed(2)),
      attendanceRate: parseFloat(studentRate.toFixed(2)),
    };
  }

  /**
   * Invalidate student cache when attendance is updated
   * Implements Requirements 1.5
   * 
   * This method clears all cache entries related to a specific student:
   * - Student metrics (attendance rate, totals, etc.)
   * - Attendance history
   * - Weekly attendance data for all weeks
   */
  async invalidateStudentCache(studentId: string): Promise<void> {
    try {
      // Delete student-specific cache keys
      await Promise.all([
        this.cache.delete(CACHE_KEYS.STUDENT_METRICS(studentId)),
        this.cache.delete(CACHE_KEYS.ATTENDANCE_HISTORY(studentId)),
      ]);

      // Delete weekly attendance cache using pattern matching
      const deletedWeeks = await this.cache.deletePattern(`attendance:student:${studentId}:week:*`);
      
      console.log(`Invalidated cache for student ${studentId}: ${deletedWeeks} weekly entries cleared`);
    } catch (error) {
      console.error(`Failed to invalidate student cache for ${studentId}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate class cache when any student's attendance changes
   * Implements Requirements 1.5
   * 
   * This method clears all cache entries related to a specific class:
   * - Class average attendance
   * - Class statistics (from materialized view)
   * - All student rankings within the class
   */
  async invalidateClassCache(classId: string): Promise<void> {
    try {
      // Delete class-specific cache keys
      await Promise.all([
        this.cache.delete(CACHE_KEYS.CLASS_AVERAGE(classId)),
        this.cache.delete(CACHE_KEYS.CLASS_STATISTICS(classId)),
      ]);

      // Delete all student rankings in this class using pattern matching
      const deletedRankings = await this.cache.deletePattern(`metrics:class:${classId}:rank:*`);
      
      console.log(`Invalidated cache for class ${classId}: ${deletedRankings} ranking entries cleared`);
    } catch (error) {
      console.error(`Failed to invalidate class cache for ${classId}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate all related caches when attendance is updated
   * This is the main method to call when attendance changes
   * Implements Requirements 1.5
   * 
   * @param studentId - ID of the student whose attendance changed
   * @param classId - ID of the class the student belongs to
   */
  async invalidateAttendanceUpdate(studentId: string, classId: string): Promise<void> {
    try {
      // Invalidate both student and class caches in parallel
      await Promise.all([
        this.invalidateStudentCache(studentId),
        this.invalidateClassCache(classId),
      ]);

      console.log(`Successfully invalidated all caches for attendance update: student ${studentId}, class ${classId}`);
    } catch (error) {
      console.error(`Failed to invalidate caches for attendance update:`, error);
      throw error;
    }
  }

  /**
   * Invalidate multiple students' caches at once (for bulk operations)
   * Useful when marking attendance for an entire class
   * 
   * @param studentIds - Array of student IDs
   * @param classId - ID of the class
   */
  async invalidateBulkAttendanceUpdate(studentIds: string[], classId: string): Promise<void> {
    try {
      // Invalidate all student caches in parallel
      await Promise.all(
        studentIds.map(studentId => this.invalidateStudentCache(studentId))
      );

      // Invalidate class cache once
      await this.invalidateClassCache(classId);

      console.log(`Successfully invalidated caches for ${studentIds.length} students in class ${classId}`);
    } catch (error) {
      console.error(`Failed to invalidate caches for bulk attendance update:`, error);
      throw error;
    }
  }

  /**
   * Warm cache with frequently accessed data
   * Used for background cache warming jobs
   */
  async warmCache(studentIds: string[]): Promise<void> {
    const batchSize = 10;

    for (let i = 0; i < studentIds.length; i += batchSize) {
      const batch = studentIds.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (studentId) => {
          try {
            const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);

            // Check if cache exists and is fresh
            const ttl = await this.cache.ttl(cacheKey);

            if (ttl < 60) {
              // Cache is stale or missing, refresh it
              await this.getStudentMetrics(studentId);
            }
          } catch (error) {
            console.error(`Failed to warm cache for student ${studentId}:`, error);
          }
        })
      );
    }
  }

  /**
   * Check if cached data is stale and needs refresh
   * Implements Requirements 1.2, 3.5
   * 
   * @param cacheKey - The cache key to check
   * @param staleThreshold - TTL threshold in seconds (default: 60)
   * @returns Object with isStale flag and remaining TTL
   */
  async isCacheStale(cacheKey: string, staleThreshold: number = 60): Promise<{
    isStale: boolean;
    ttl: number;
    exists: boolean;
  }> {
    const ttl = await this.cache.ttl(cacheKey);
    
    return {
      isStale: ttl > 0 && ttl < staleThreshold,
      ttl,
      exists: ttl !== -2, // -2 means key doesn't exist
    };
  }

  /**
   * Force refresh cache for a student (bypass cache)
   * Useful for manual cache refresh or after critical updates
   * 
   * @param studentId - ID of the student
   */
  async forceRefreshStudentMetrics(studentId: string): Promise<StudentDashboardMetrics> {
    const cacheKey = CACHE_KEYS.STUDENT_METRICS(studentId);
    
    // Calculate fresh metrics
    const metrics = await this.calculateStudentMetrics(studentId);
    
    // Update cache
    await this.cache.set(cacheKey, metrics, CACHE_TTL.STUDENT_METRICS);
    
    return metrics;
  }

  /**
   * Force refresh cache for a class (bypass cache)
   * Useful for manual cache refresh or after critical updates
   * 
   * @param classId - ID of the class
   */
  async forceRefreshClassStatistics(classId: string): Promise<ClassStatistics | null> {
    const cacheKey = CACHE_KEYS.CLASS_STATISTICS(classId);
    
    // Query fresh data from materialized view
    const { data, error } = await supabase
      .from('class_statistics')
      .select('*')
      .eq('class_id', classId)
      .single();

    let classStats: ClassStatistics | null = null;

    if (error) {
      // Fall back to calculation
      classStats = await this.calculateClassStatistics(classId);
    } else {
      const stats = data as MaterializedClassStats;
      classStats = {
        classId: stats.class_id,
        className: stats.class_name,
        totalStudents: stats.total_students,
        averageAttendance: parseFloat(stats.average_attendance?.toFixed(2) || '0'),
        medianAttendance: parseFloat(stats.median_attendance?.toFixed(2) || '0'),
        highestAttendance: parseFloat(stats.highest_attendance?.toFixed(2) || '0'),
        lowestAttendance: parseFloat(stats.lowest_attendance?.toFixed(2) || '0'),
        studentsAtRisk: stats.students_at_risk,
        lastCalculated: new Date(stats.last_calculated),
      };
    }

    if (classStats) {
      // Update cache
      await this.cache.set(cacheKey, classStats, CACHE_TTL.CLASS_STATISTICS);
    }
    
    return classStats;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let dashboardServiceInstance: DashboardService | null = null;

export function getDashboardService(): DashboardService {
  if (!dashboardServiceInstance) {
    dashboardServiceInstance = new DashboardService();
  }
  return dashboardServiceInstance;
}

export default DashboardService;
