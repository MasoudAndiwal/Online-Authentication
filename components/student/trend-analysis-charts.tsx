'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar } from 'lucide-react'

interface TrendDataPoint {
  label: string
  value: number
  present: number
  absent: number
  sick: number
  leave: number
}

interface TrendAnalysisChartsProps {
  weeklyData?: TrendDataPoint[]
  monthlyData?: TrendDataPoint[]
}

/**
 * Trend Analysis Charts Component
 * Displays interactive charts showing attendance patterns over time
 * Features weekly and monthly breakdowns with hover tooltips
 * Responsive and touch-friendly design
 */
export function TrendAnalysisCharts({
  weeklyData = generateMockWeeklyData(),
  monthlyData = generateMockMonthlyData()
}: TrendAnalysisChartsProps) {
  const [activeView, setActiveView] = React.useState<'weekly' | 'monthly'>('weekly')
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  const currentData = activeView === 'weekly' ? weeklyData : monthlyData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              Attendance Trends
            </CardTitle>
            
            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('weekly')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeView === 'weekly'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setActiveView('monthly')}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  activeView === 'monthly'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Chart */}
          <div className="relative">
            <AttendanceChart
              data={currentData}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <LegendItem color="emerald" label="Present" />
            <LegendItem color="red" label="Absent" />
            <LegendItem color="yellow" label="Sick" />
            <LegendItem color="blue" label="Leave" />
          </div>

          {/* Tooltip */}
          {hoveredIndex !== null && currentData[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-slate-50 rounded-xl border-0 shadow-sm"
            >
              <div className="text-sm sm:text-base font-semibold text-slate-800 mb-2">
                {currentData[hoveredIndex].label}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Present: {currentData[hoveredIndex].present}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-slate-600">Absent: {currentData[hoveredIndex].absent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-slate-600">Sick: {currentData[hoveredIndex].sick}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Leave: {currentData[hoveredIndex].leave}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-300">
                <span className="text-sm font-semibold text-slate-700">
                  Attendance Rate: {currentData[hoveredIndex].value.toFixed(1)}%
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface AttendanceChartProps {
  data: TrendDataPoint[]
  hoveredIndex: number | null
  onHover: (index: number | null) => void
}

function AttendanceChart({ data, hoveredIndex, onHover }: AttendanceChartProps) {
  const chartHeight = 200
  const chartWidth = 100 // percentage
  const maxValue = 100 // percentage

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px] sm:min-w-0">
        {/* Y-axis labels */}
        <div className="flex items-end justify-between mb-2 px-2">
          {[100, 75, 50, 25, 0].map((value) => (
            <div key={value} className="text-xs text-slate-500">
              {value}%
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="relative" style={{ height: chartHeight }}>
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-slate-200" />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-1 sm:gap-2 px-2">
            {data.map((point, index) => {
              const barHeight = (point.value / maxValue) * chartHeight
              const isHovered = hoveredIndex === index

              return (
                <motion.div
                  key={index}
                  className="flex-1 max-w-[60px] cursor-pointer touch-manipulation"
                  onMouseEnter={() => onHover(index)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onHover(isHovered ? null : index)}
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <motion.div
                    className={`w-full h-full rounded-t-lg transition-all ${
                      isHovered
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-500 shadow-lg scale-105'
                        : 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex items-center justify-around gap-1 sm:gap-2 mt-2 px-2">
          {data.map((point, index) => (
            <div
              key={index}
              className={`flex-1 max-w-[60px] text-center text-xs ${
                hoveredIndex === index
                  ? 'text-emerald-600 font-semibold'
                  : 'text-slate-600'
              }`}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface LegendItemProps {
  color: 'emerald' | 'red' | 'yellow' | 'blue'
  label: string
}

function LegendItem({ color, label }: LegendItemProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${colorClasses[color]}`} />
      <span className="text-xs sm:text-sm text-slate-600">{label}</span>
    </div>
  )
}

// Mock data generators (to be replaced with real API data)
function generateMockWeeklyData(): TrendDataPoint[] {
  return [
    { label: 'Week 1', value: 95, present: 19, absent: 1, sick: 0, leave: 0 },
    { label: 'Week 2', value: 90, present: 18, absent: 2, sick: 0, leave: 0 },
    { label: 'Week 3', value: 85, present: 17, absent: 2, sick: 1, leave: 0 },
    { label: 'Week 4', value: 92, present: 18, absent: 1, sick: 1, leave: 0 },
    { label: 'Week 5', value: 88, present: 17, absent: 2, sick: 1, leave: 0 },
    { label: 'Week 6', value: 94, present: 19, absent: 1, sick: 0, leave: 0 },
  ]
}

function generateMockMonthlyData(): TrendDataPoint[] {
  return [
    { label: 'Sep', value: 92, present: 74, absent: 5, sick: 2, leave: 1 },
    { label: 'Oct', value: 88, present: 70, absent: 8, sick: 3, leave: 1 },
    { label: 'Nov', value: 90, present: 72, absent: 6, sick: 2, leave: 2 },
    { label: 'Dec', value: 85, present: 68, absent: 10, sick: 2, leave: 2 },
  ]
}
