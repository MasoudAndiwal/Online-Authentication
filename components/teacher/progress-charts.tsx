'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Calendar, BarChart3, LineChart, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Types for chart data
export interface AttendanceDataPoint {
  date: Date
  present: number
  absent: number
  sick: number
  leave: number
  total: number
  attendanceRate: number
}

export interface WeeklyAttendanceData {
  weekStart: Date
  weekEnd: Date
  days: AttendanceDataPoint[]
  weeklyRate: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface MonthlyAttendanceData {
  month: string
  year: number
  weeks: WeeklyAttendanceData[]
  monthlyRate: number
  totalClasses: number
  totalPresent: number
  totalAbsent: number
}

interface ProgressChartsProps {
  weeklyData: WeeklyAttendanceData[]
  monthlyData: MonthlyAttendanceData[]
  selectedPeriod: 'week' | 'month'
  onPeriodChange: (period: 'week' | 'month') => void
  className?: string
}

export function ProgressCharts({
  weeklyData,
  monthlyData,
  selectedPeriod,
  onPeriodChange,
  className
}: ProgressChartsProps) {
  const [hoveredDataPoint, setHoveredDataPoint] = React.useState<AttendanceDataPoint | null>(null)
  const [selectedWeek, setSelectedWeek] = React.useState<WeeklyAttendanceData | null>(
    weeklyData[0] || null
  )

  // Calculate overall trends
  const overallTrend = React.useMemo(() => {
    if (weeklyData.length < 2) return { direction: 'stable', percentage: 0 }
    
    const recent = weeklyData[weeklyData.length - 1]?.weeklyRate || 0
    const previous = weeklyData[weeklyData.length - 2]?.weeklyRate || 0
    const change = recent - previous
    
    return {
      direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
      percentage: Math.abs(change)
    }
  }, [weeklyData])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Period Selection and Overview */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Attendance Trends & Analytics
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('week')}
                className={selectedPeriod === 'week' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                }
              >
                <Calendar className="w-4 h-4 mr-1" />
                Weekly
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPeriodChange('month')}
                className={selectedPeriod === 'month' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                }
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Monthly
              </Button>
            </div>
          </div>

          {/* Overall Trend Indicator */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {overallTrend.direction === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : overallTrend.direction === 'down' ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : (
                <LineChart className="w-5 h-5 text-slate-600" />
              )}
              <span className="text-sm font-medium text-slate-700">
                {overallTrend.direction === 'up' ? 'Improving' : 
                 overallTrend.direction === 'down' ? 'Declining' : 'Stable'}
              </span>
              {overallTrend.percentage > 0 && (
                <Badge className={cn(
                  'border-0 shadow-sm',
                  overallTrend.direction === 'up' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                )}>
                  {overallTrend.percentage.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly View */}
      {selectedPeriod === 'week' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week Selection */}
          <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Select Week
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {weeklyData.map((week, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedWeek(week)}
                    className={cn(
                      'w-full p-3 rounded-lg text-left transition-all duration-200',
                      'hover:bg-orange-50 hover:shadow-sm',
                      selectedWeek === week 
                        ? 'bg-orange-100 shadow-sm ring-2 ring-orange-200' 
                        : 'bg-white/60'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {week.weekStart.toLocaleDateString()} - {week.weekEnd.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-600">
                          {week.days.length} days
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'text-lg font-bold',
                          week.weeklyRate >= 90 ? 'text-green-600' :
                          week.weeklyRate >= 75 ? 'text-orange-600' : 'text-red-600'
                        )}>
                          {Math.round(week.weeklyRate)}%
                        </div>
                        <div className="flex items-center gap-1">
                          {week.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : week.trend === 'down' ? (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          ) : (
                            <div className="w-3 h-3" />
                          )}
                          <span className="text-xs text-slate-600">
                            {week.trendPercentage > 0 && `${week.trendPercentage.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Breakdown Chart */}
          <Card className="lg:col-span-2 rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Daily Attendance Breakdown
              </CardTitle>
              {selectedWeek && (
                <p className="text-sm text-slate-600">
                  {selectedWeek.weekStart.toLocaleDateString()} - {selectedWeek.weekEnd.toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {selectedWeek ? (
                <div className="space-y-4">
                  {/* Daily Bars */}
                  <div className="space-y-3">
                    {selectedWeek.days.map((day, index) => (
                      <motion.div
                        key={index}
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => setHoveredDataPoint(day)}
                        onMouseLeave={() => setHoveredDataPoint(null)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-16 text-sm font-medium text-slate-700">
                            {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                          <div className="flex-1">
                            <div className="flex h-6 rounded-full overflow-hidden bg-slate-200">
                              {/* Present */}
                              <motion.div
                                className="bg-gradient-to-r from-green-400 to-green-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(day.present / day.total) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                              {/* Sick */}
                              <motion.div
                                className="bg-gradient-to-r from-yellow-400 to-yellow-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(day.sick / day.total) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                              />
                              {/* Leave */}
                              <motion.div
                                className="bg-gradient-to-r from-purple-400 to-purple-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(day.leave / day.total) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                              />
                              {/* Absent */}
                              <motion.div
                                className="bg-gradient-to-r from-red-400 to-red-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(day.absent / day.total) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.6 }}
                              />
                            </div>
                          </div>
                          <div className="w-16 text-right">
                            <span className={cn(
                              'text-sm font-bold',
                              day.attendanceRate >= 90 ? 'text-green-600' :
                              day.attendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'
                            )}>
                              {Math.round(day.attendanceRate)}%
                            </span>
                          </div>
                        </div>

                        {/* Tooltip */}
                        {hoveredDataPoint === day && (
                          <motion.div
                            className="absolute z-10 bg-slate-900 text-white p-3 rounded-lg shadow-lg text-sm"
                            style={{ top: '-80px', left: '50%', transform: 'translateX(-50%)' }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <div className="space-y-1">
                              <div>Date: {day.date.toLocaleDateString()}</div>
                              <div>Present: {day.present}/{day.total}</div>
                              <div>Absent: {day.absent}/{day.total}</div>
                              {day.sick > 0 && <div>Sick: {day.sick}/{day.total}</div>}
                              {day.leave > 0 && <div>Leave: {day.leave}/{day.total}</div>}
                              <div className="font-bold">Rate: {day.attendanceRate.toFixed(1)}%</div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
                      <span className="text-sm text-slate-600">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600" />
                      <span className="text-sm text-slate-600">Sick</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
                      <span className="text-sm text-slate-600">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600" />
                      <span className="text-sm text-slate-600">Absent</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-slate-500">
                  Select a week to view daily breakdown
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly View */}
      {selectedPeriod === 'month' && (
        <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Monthly Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthlyData.map((month, index) => (
                <motion.div
                  key={`${month.month}-${month.year}`}
                  className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {month.month} {month.year}
                    </h3>
                    <div className={cn(
                      'text-3xl font-bold mt-2',
                      month.monthlyRate >= 90 ? 'text-green-600' :
                      month.monthlyRate >= 75 ? 'text-orange-600' : 'text-red-600'
                    )}>
                      {Math.round(month.monthlyRate)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Classes:</span>
                      <span className="font-medium">{month.totalClasses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Present:</span>
                      <span className="font-medium text-green-600">{month.totalPresent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Absent:</span>
                      <span className="font-medium text-red-600">{month.totalAbsent}</span>
                    </div>
                  </div>

                  {/* Weekly breakdown mini chart */}
                  <div className="mt-4">
                    <div className="text-xs text-slate-600 mb-2">Weekly Breakdown</div>
                    <div className="flex gap-1">
                      {month.weeks.map((week, weekIndex) => (
                        <div
                          key={weekIndex}
                          className={cn(
                            'flex-1 h-2 rounded-full',
                            week.weeklyRate >= 90 ? 'bg-green-500' :
                            week.weeklyRate >= 75 ? 'bg-orange-500' : 'bg-red-500'
                          )}
                          title={`Week ${weekIndex + 1}: ${week.weeklyRate.toFixed(1)}%`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}