/**
 * Period Assignment Service
 * 
 * Handles teacher period assignments and validation for the attendance system.
 * This service manages the mapping between teachers and their assigned periods
 * based on schedule_entries data.
 */

import { supabase } from '@/lib/supabase';
import { handleDatabaseOperation } from '@/lib/database/errors';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface TeacherPeriodAssignment {
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  teacherId: string | null;
  classId: string;
  className: string;
  dayOfWeek: string;
  scheduleEntryId: string;
}

export interface TeacherDailySchedule {
  teacherId: string;
  teacherName: string;
  date: Date;
  totalPeriods: number;
  assignments: TeacherPeriodAssignment[];
  classSummary: {
    classId: string;
    className: string;
    assignedPeriods: number[];
    markedPeriods: number[];
    pendingPeriods: number[];
  }[];
}

export interface PeriodAssignmentCache {
  teacherId: string;
  classId: string;
  dayOfWeek: string;
  assignments: TeacherPeriodAssignment[];
  cachedAt: Date;
  expiresAt: Date;
}

// ============================================================================
// Period Assignment Service Class
// ============================================================================

class PeriodAssignmentService {
  private cache: Map<string, PeriodAssignmentCache> = new Map();
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cache entries
  private cacheHits = 0;
  private cacheMisses = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start automatic cleanup every 2 minutes
    this.startAutomaticCleanup();
  }

  /**
   * Get teacher's assigned periods for a specific class and day
   */
  async getTeacherPeriods(
    teacherId: string,
    classId: string,
    dayOfWeek: string
  ): Promise<TeacherPeriodAssignment[]> {
    return handleDatabaseOperation(async () => {
      // Check cache first
      const cacheKey = `${teacherId}-${classId}-${dayOfWeek}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && cached.expiresAt > new Date()) {
        console.log('[PeriodAssignmentService] Cache hit for:', cacheKey);
        this.cacheHits++;
        // Move to end (LRU behavior)
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cached);
        return cached.assignments;
      }

      this.cacheMisses++;

      console.log('[PeriodAssignmentService] Fetching periods for teacher:', teacherId, 'class:', classId, 'day:', dayOfWeek);

      // Fetch schedule entries for the specific teacher, class, and day
      const { data: scheduleEntries, error } = await supabase
        .from('schedule_entries')
        .select(`
          id,
          teacher_id,
          teacher_name,
          subject,
          hours,
          start_time,
          end_time,
          classes!inner(id, name)
        `)
        .eq('class_id', classId)
        .eq('day_of_week', dayOfWeek.toLowerCase())
        .or(`teacher_id.eq.${teacherId},teacher_name.ilike.%${teacherId}%`);

      if (error) {
        console.error('[PeriodAssignmentService] Error fetching schedule entries:', error);
        throw error;
      }

      if (!scheduleEntries || scheduleEntries.length === 0) {
        console.log('[PeriodAssignmentService] No schedule entries found');
        return [];
      }

      // Transform schedule entries into period assignments
      const assignments: TeacherPeriodAssignment[] = [];
      
      for (const entry of scheduleEntries) {
        const periods = this.expandScheduleEntryToPeriods(entry);
        assignments.push(...periods);
      }

      // Sort by period number
      assignments.sort((a, b) => a.periodNumber - b.periodNumber);

      // Cache the result with LRU eviction
      const cacheEntry: PeriodAssignmentCache = {
        teacherId,
        classId,
        dayOfWeek,
        assignments,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + this.CACHE_DURATION_MS)
      };
      
      // Implement LRU eviction if cache is full
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
          console.log('[PeriodAssignmentService] Evicted cache entry:', firstKey);
        }
      }
      
      this.cache.set(cacheKey, cacheEntry);

      console.log('[PeriodAssignmentService] Found', assignments.length, 'period assignments');
      return assignments;
    });
  }

  /**
   * Validate if teacher can mark attendance for a specific period
   */
  async validateTeacherPeriodAccess(
    teacherId: string,
    classId: string,
    periodNumber: number,
    dayOfWeek: string
  ): Promise<boolean> {
    try {
      const assignments = await this.getTeacherPeriods(teacherId, classId, dayOfWeek);
      return assignments.some(assignment => assignment.periodNumber === periodNumber);
    } catch (error) {
      console.error('[PeriodAssignmentService] Error validating teacher access:', error);
      return false;
    }
  }

  /**
   * Get teacher's daily schedule summary across all classes
   */
  async getTeacherDailySchedule(
    teacherId: string,
    date: Date
  ): Promise<TeacherDailySchedule> {
    return handleDatabaseOperation(async () => {
      const dayOfWeek = this.getDayOfWeekString(date);
      
      console.log('[PeriodAssignmentService] Fetching daily schedule for teacher:', teacherId, 'day:', dayOfWeek);

      // Get teacher information
      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .eq('id', teacherId)
        .single();

      if (teacherError || !teacher) {
        console.error('[PeriodAssignmentService] Teacher not found:', teacherError);
        throw new Error('Teacher not found');
      }

      const teacherName = `${teacher.first_name} ${teacher.last_name}`;

      // Fetch all schedule entries for this teacher on this day
      const { data: scheduleEntries, error } = await supabase
        .from('schedule_entries')
        .select(`
          id,
          class_id,
          teacher_id,
          teacher_name,
          subject,
          hours,
          start_time,
          end_time,
          classes!inner(id, name)
        `)
        .eq('day_of_week', dayOfWeek.toLowerCase())
        .or(`teacher_id.eq.${teacherId},teacher_name.ilike.%${teacherName}%`);

      if (error) {
        console.error('[PeriodAssignmentService] Error fetching daily schedule:', error);
        throw error;
      }

      // Transform entries into assignments
      const allAssignments: TeacherPeriodAssignment[] = [];
      const classMap = new Map<string, { classId: string; className: string; periods: number[] }>();

      for (const entry of scheduleEntries || []) {
        const periods = this.expandScheduleEntryToPeriods(entry);
        allAssignments.push(...periods);

        // Track classes and their periods
        const classId = entry.class_id;
        const className = entry.classes?.name || 'Unknown Class';
        
        if (!classMap.has(classId)) {
          classMap.set(classId, { classId, className, periods: [] });
        }
        
        const classPeriods = periods.map(p => p.periodNumber);
        classMap.get(classId)!.periods.push(...classPeriods);
      }

      // Create class summary
      const classSummary = Array.from(classMap.values()).map(cls => ({
        classId: cls.classId,
        className: cls.className,
        assignedPeriods: [...new Set(cls.periods)].sort((a, b) => a - b),
        markedPeriods: [], // TODO: Fetch from attendance records
        pendingPeriods: [...new Set(cls.periods)].sort((a, b) => a - b) // For now, all are pending
      }));

      return {
        teacherId,
        teacherName,
        date,
        totalPeriods: allAssignments.length,
        assignments: allAssignments.sort((a, b) => a.periodNumber - b.periodNumber),
        classSummary
      };
    });
  }

  /**
   * Expand a schedule entry into individual period assignments
   * Handles different hour values (1 hour = 1 period, 6 hours = 6 periods)
   */
  private expandScheduleEntryToPeriods(entry: any): TeacherPeriodAssignment[] {
    const assignments: TeacherPeriodAssignment[] = [];
    const hours = entry.hours || 1;
    const startTime = entry.start_time;
    const endTime = entry.end_time;
    
    // Calculate period numbers based on start time
    // Assuming periods are: 1(8-9), 2(9-10), 3(10-11), 4(11-12), 5(13-14), 6(14-15)
    const startPeriod = this.timeToPeriodNumbe
r(startTime);
    
    for (let i = 0; i < hours; i++) {
      const periodNumber = startPeriod + i;
      if (periodNumber >= 1 && periodNumber <= 6) {
        const periodStartTime = this.periodNumberToTime(periodNumber);
        const periodEndTime = this.periodNumberToTime(periodNumber + 1);
        
        assignments.push({
          periodNumber,
          startTime: periodStartTime,
          endTime: periodEndTime,
          subject: entry.subject,
          teacherName: entry.teacher_name,
          teacherId: entry.teacher_id,
          classId: entry.class_id,
          className: entry.classes?.name || 'Unknown Class',
          dayOfWeek: entry.day_of_week,
          scheduleEntryId: entry.id
        });
      }
    }
    
    return assignments;
  }

  /**
   * Convert time string to period number
   */
  private timeToPeriod
Number(timeString: string): number {
    // Parse time string (e.g., "08:00:00" or "08:00")
    const [hours] = timeString.split(':').map(Number);
    
    // Map hours to period numbers
    // Morning periods: 8-12 (periods 1-4)
    // Afternoon periods: 13-15 (periods 5-6)
    if (hours >= 8 && hours < 12) {
      return hours - 7; // 8->1, 9->2, 10->3, 11->4
    } else if (hours >= 13 && hours < 15) {
      return hours - 8; // 13->5, 14->6
    }
    
    // Default to period 1 if time doesn't match expected ranges
    return 1;
  }

  /**
   * Convert period number to time string
   */
  private periodNumberToTime(periodNumber: number): string {
    const timeMap: Record<number, string> = {
      1: '08:00',
      2: '09:00',
      3: '10:00',
      4: '11:00',
      5: '13:00',
      6: '14:00',
      7: '15:00' // End time for period 6
    };
    
    return timeMap[periodNumber] || '08:00';
  }

  /**
   * Get day of week string from Date object
   */
  private getDayOfWeekString(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Clear cache for specific teacher/class/day combination
   */
  clearCache(teacherId?: string, classId?: string, dayOfWeek?: string): void {
    if (teacherId && classId && dayOfWeek) {
      const cacheKey = `${teacherId}-${classId}-${dayOfWeek}`;
      this.cache.delete(cacheKey);
      console.log('[PeriodAssignmentService] Cleared cache for:', cacheKey);
    } else {
      // Clear all cache
      this.cache.clear();
      console.log('[PeriodAssignmentService] Cleared all cache');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { 
    size: number; 
    maxSize: number;
    keys: string[]; 
    hits: number; 
    misses: number; 
    hitRate: number;
    expiredEntries: number;
  } {
    // Count expired entries
    const now = new Date();
    let expiredCount = 0;
    for (const entry of this.cache.values()) {
      if (entry.expiresAt <= now) {
        expiredCount++;
      }
    }

    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys()),
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      expiredEntries: expiredCount
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanupExpiredEntries(): number {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log('[PeriodAssignmentService] Cleaned up', cleanedCount, 'expired cache entries');
    }
    
    return cleanedCount;
  }

  /**
   * Invalidate cache for schedule changes
   */
  invalidateScheduleCache(classId?: string, teacherId?: string, dayOfWeek?: string): number {
    let invalidatedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      let shouldInvalidate = false;
      
      if (classId && entry.classId === classId) {
        shouldInvalidate = true;
      }
      
      if (teacherId && entry.teacherId === teacherId) {
        shouldInvalidate = true;
      }
      
      if (dayOfWeek && entry.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase()) {
        shouldInvalidate = true;
      }
      
      // If no specific filters provided, invalidate all
      if (!classId && !teacherId && !dayOfWeek) {
        shouldInvalidate = true;
      }
      
      if (shouldInvalidate) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    
    console.log('[PeriodAssignmentService] Invalidated', invalidatedCount, 'cache entries');
    return invalidatedCount;
  }

  /**
   * Preload cache for common queries
   */
  async preloadCache(teacherIds: string[], classIds: string[], days: string[]): Promise<number> {
    let preloadedCount = 0;
    
    for (const teacherId of teacherIds) {
      for (const classId of classIds) {
        for (const dayOfWeek of days) {
          try {
            await this.getTeacherPeriods(teacherId, classId, dayOfWeek);
            preloadedCount++;
          } catch (error) {
            console.warn('[PeriodAssignmentService] Failed to preload cache for:', {
              teacherId,
              classId,
              dayOfWeek,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    }
    
    console.log('[PeriodAssignmentService] Preloaded', preloadedCount, 'cache entries');
    return preloadedCount;
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('[PeriodAssignmentService] Reset cache statistics');
  }

  /**
   * Start automatic cache cleanup
   */
  private startAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 2 * 60 * 1000); // Every 2 minutes
    
    console.log('[PeriodAssignmentService] Started automatic cache cleanup');
  }

  /**
   * Stop automatic cache cleanup
   */
  stopAutomaticCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[PeriodAssignmentService] Stopped automatic cache cleanup');
    }
  }

  /**
   * Warm up cache with current day's data for all active teachers
   */
  async warmupCache(): Promise<{ success: number; failed: number }> {
    console.log('[PeriodAssignmentService] Starting cache warmup...');
    
    try {
      // Get all active teachers
      const { data: teachers, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('status', 'ACTIVE');

      if (teacherError || !teachers) {
        console.error('[PeriodAssignmentService] Failed to fetch teachers for warmup:', teacherError);
        return { success: 0, failed: 0 };
      }

      // Get all classes
      const { data: classes, error: classError } = await supabase
        .from('classes')
        .select('id');

      if (classError || !classes) {
        console.error('[PeriodAssignmentService] Failed to fetch classes for warmup:', classError);
        return { success: 0, failed: 0 };
      }

      const currentDay = this.getDayOfWeekString(new Date());
      const teacherIds = teachers.map(t => t.id);
      const classIds = classes.map(c => c.id);

      // Preload cache for current day
      const preloadedCount = await this.preloadCache(teacherIds, classIds, [currentDay]);
      
      console.log('[PeriodAssignmentService] Cache warmup completed:', preloadedCount, 'entries');
      return { success: preloadedCount, failed: 0 };

    } catch (error) {
      console.error('[PeriodAssignmentService] Cache warmup failed:', error);
      return { success: 0, failed: 1 };
    }
  }

  /**
   * Find teacher by name (fuzzy matching)
   */
  async findTeacherByName(teacherName: string): Promise<{ id: string; name: string } | null> {
    return handleDatabaseOperation(async () => {
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('id, first_name, last_name')
        .or(`first_name.ilike.%${teacherName}%,last_name.ilike.%${teacherName}%`)
        .limit(1);

      if (error || !teachers || teachers.length === 0) {
        return null;
      }

      const teacher = teachers[0];
      return {
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.last_name}`
      };
    });
  }

  /**
   * Get all teachers assigned to a specific class and day
   */
  async getClassTeachers(classId: string, dayOfWeek: string): Promise<{
    teacherId: string | null;
    teacherName: string;
    periods: number[];
    subjects: string[];
  }[]> {
    return handleDatabaseOperation(async () => {
      const { data: scheduleEntries, error } = await supabase
        .from('schedule_entries')
        .select('teacher_id, teacher_name, subject, hours, start_time')
        .eq('class_id', classId)
        .eq('day_of_week', dayOfWeek.toLowerCase());

      if (error || !scheduleEntries) {
        return [];
      }

      // Group by teacher
      const teacherMap = new Map<string, {
        teacherId: string | null;
        teacherName: string;
        periods: Set<number>;
        subjects: Set<string>;
      }>();

      for (const entry of scheduleEntries) {
        const teacherKey = entry.teacher_name;
        
        if (!teacherMap.has(teacherKey)) {
          teacherMap.set(teacherKey, {
            teacherId: entry.teacher_id,
            teacherName: entry.teacher_name,
            periods: new Set(),
            subjects: new Set()
          });
        }

        const teacher = teacherMap.get(teacherKey)!;
        teacher.subjects.add(entry.subject);

        // Add periods based on hours
        const startPeriod = this.timeToPeriod
Number(entry.start_time);
        const hours = entry.hours || 1;
        
        for (let i = 0; i < hours; i++) {
          const periodNumber = startPeriod + i;
          if (periodNumber >= 1 && periodNumber <= 6) {
            teacher.periods.add(periodNumber);
          }
        }
      }

      // Convert to array format
      return Array.from(teacherMap.values()).map(teacher => ({
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        periods: Array.from(teacher.periods).sort((a, b) => a - b),
        subjects: Array.from(teacher.subjects)
      }));
    });
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const periodAssignmentService = new PeriodAssignmentService();

// ============================================================================
// Export Types
// ============================================================================

export type {
  TeacherPeriodAssignment,
  TeacherDailySchedule,
  PeriodAssignmentCache
};