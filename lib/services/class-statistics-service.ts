/**
 * Class Statistics Service
 * 
 * This service provides methods to query class statistics from the materialized view.
 * It demonstrates how to use the pre-computed statistics for fast dashboard queries.
 * 
 * Requirements: 1.3, 3.1, 3.2
 */

import { supabase } from '@/lib/supabase'
import { materializedViewRefreshService } from './materialized-view-refresh-service'

export interface ClassStatistics {
  classId: string
  className: string
  classSection: string
  totalStudents: number
  averageAttendance: number
  medianAttendance: number
  highestAttendance: number
  lowestAttendance: number
  studentsAtRisk: number
  studentsWithWarning: number
  lastCalculated: Date
  isStale: boolean
}

export interface ClassStatisticsQuery {
  classId?: string
  minAverageAttendance?: number
  maxAverageAttendance?: number
  hasAtRiskStudents?: boolean
  limit?: number
  orderBy?: 'average_attendance' | 'students_at_risk' | 'total_students'
  orderDirection?: 'asc' | 'desc'
}

class ClassStatisticsService {
  /**
   * Get statistics for a specific class
   */
  async getClassStatistics(classId: string): Promise<ClassStatistics | null> {
    try {
      const { data, error } = await supabase
        .from('class_statistics')
        .select('*')
        .eq('class_id', classId)
        .single()

      if (error) {
        console.error('[ClassStatistics] Error fetching class statistics:', error)
        return null
      }

      if (!data) {
        return null
      }

      // Check if data is stale
      const isStale = await materializedViewRefreshService.isViewStale()

      return this.mapToClassStatistics(data, isStale)
    } catch (error) {
      console.error('[ClassStatistics] Error in getClassStatistics:', error)
      return null
    }
  }

  /**
   * Get statistics for all classes
   */
  async getAllClassStatistics(query?: ClassStatisticsQuery): Promise<ClassStatistics[]> {
    try {
      let queryBuilder = supabase.from('class_statistics').select('*')

      // Apply filters
      if (query?.minAverageAttendance !== undefined) {
        queryBuilder = queryBuilder.gte('average_attendance', query.minAverageAttendance)
      }

      if (query?.maxAverageAttendance !== undefined) {
        queryBuilder = queryBuilder.lte('average_attendance', query.maxAverageAttendance)
      }

      if (query?.hasAtRiskStudents) {
        queryBuilder = queryBuilder.gt('students_at_risk', 0)
      }

      // Apply ordering
      if (query?.orderBy) {
        queryBuilder = queryBuilder.order(
          query.orderBy,
          { ascending: query.orderDirection === 'asc' }
        )
      }

      // Apply limit
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit)
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error('[ClassStatistics] Error fetching all class statistics:', error)
        return []
      }

      // Check if data is stale
      const isStale = await materializedViewRefreshService.isViewStale()

      return (data || []).map(item => this.mapToClassStatistics(item, isStale))
    } catch (error) {
      console.error('[ClassStatistics] Error in getAllClassStatistics:', error)
      return []
    }
  }

  /**
   * Get classes with at-risk students (below 75% attendance)
   */
  async getClassesWithAtRiskStudents(): Promise<ClassStatistics[]> {
    return this.getAllClassStatistics({
      hasAtRiskStudents: true,
      orderBy: 'students_at_risk',
      orderDirection: 'desc'
    })
  }

  /**
   * Get classes with low average attendance
   */
  async getClassesWithLowAttendance(threshold: number = 80): Promise<ClassStatistics[]> {
    return this.getAllClassStatistics({
      maxAverageAttendance: threshold,
      orderBy: 'average_attendance',
      orderDirection: 'asc'
    })
  }

  /**
   * Get top performing classes by attendance
   */
  async getTopPerformingClasses(limit: number = 10): Promise<ClassStatistics[]> {
    return this.getAllClassStatistics({
      orderBy: 'average_attendance',
      orderDirection: 'desc',
      limit
    })
  }

  /**
   * Get summary statistics across all classes
   */
  async getOverallStatistics() {
    try {
      const allStats = await this.getAllClassStatistics()

      if (allStats.length === 0) {
        return null
      }

      const totalClasses = allStats.length
      const totalStudents = allStats.reduce((sum, stat) => sum + stat.totalStudents, 0)
      const totalAtRisk = allStats.reduce((sum, stat) => sum + stat.studentsAtRisk, 0)
      const totalWithWarning = allStats.reduce((sum, stat) => sum + stat.studentsWithWarning, 0)
      
      const overallAverage = 
        allStats.reduce((sum, stat) => sum + stat.averageAttendance, 0) / totalClasses

      return {
        totalClasses,
        totalStudents,
        totalAtRisk,
        totalWithWarning,
        overallAverageAttendance: overallAverage,
        classesWithAtRiskStudents: allStats.filter(s => s.studentsAtRisk > 0).length,
        lastUpdated: allStats[0]?.lastCalculated
      }
    } catch (error) {
      console.error('[ClassStatistics] Error in getOverallStatistics:', error)
      return null
    }
  }

  /**
   * Trigger a manual refresh of the materialized view
   */
  async refreshStatistics(): Promise<boolean> {
    const result = await materializedViewRefreshService.refreshClassStatistics()
    return result.success
  }

  /**
   * Check if statistics are stale and need refresh
   */
  async checkStaleness(): Promise<{ isStale: boolean; age: string | null }> {
    const isStale = await materializedViewRefreshService.isViewStale()
    const age = await materializedViewRefreshService.getViewAge()
    return { isStale, age }
  }

  /**
   * Map database row to ClassStatistics interface
   */
  private mapToClassStatistics(data: any, isStale: boolean): ClassStatistics {
    return {
      classId: data.class_id,
      className: data.class_name,
      classSection: data.class_section,
      totalStudents: data.total_students,
      averageAttendance: data.average_attendance,
      medianAttendance: data.median_attendance,
      highestAttendance: data.highest_attendance,
      lowestAttendance: data.lowest_attendance,
      studentsAtRisk: data.students_at_risk,
      studentsWithWarning: data.students_with_warning,
      lastCalculated: new Date(data.last_calculated),
      isStale
    }
  }
}

// Export singleton instance
export const classStatisticsService = new ClassStatisticsService()
