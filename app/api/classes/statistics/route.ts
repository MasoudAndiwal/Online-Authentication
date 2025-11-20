/**
 * Class Statistics API Endpoint
 * 
 * GET /api/classes/statistics - Get statistics for all classes
 * GET /api/classes/statistics?classId=xxx - Get statistics for specific class
 */

import { NextRequest, NextResponse } from 'next/server'
import { classStatisticsService } from '@/lib/services/class-statistics-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const classId = searchParams.get('classId')

    if (classId) {
      // Get statistics for specific class
      const stats = await classStatisticsService.getClassStatistics(classId)
      
      if (!stats) {
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ data: stats })
    }

    // Get statistics for all classes
    const stats = await classStatisticsService.getAllClassStatistics()
    const staleness = await classStatisticsService.checkStaleness()

    return NextResponse.json({
      data: stats,
      meta: {
        total: stats.length,
        isStale: staleness.isStale,
        age: staleness.age
      }
    })
  } catch (error) {
    console.error('[ClassStatistics API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
