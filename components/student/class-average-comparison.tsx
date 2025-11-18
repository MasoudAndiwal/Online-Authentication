'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Award, Star, ThumbsUp, Target, Zap, TrendingDown, AlertCircle } from 'lucide-react'

interface ClassAverageComparisonProps {
  studentRate: number
  classAverage: number
  ranking: number
  totalStudents?: number
}

/**
 * Class Average Comparison Component
 * Displays student's attendance compared to class average
 * Shows ranking/percentile (anonymized) and visual comparison chart
 * Displays encouraging message when exceeding class average
 */
export function ClassAverageComparison({
  studentRate,
  classAverage,
  ranking,
  totalStudents = 30 // Default estimate if not provided
}: ClassAverageComparisonProps) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate percentile (higher is better)
  const percentile = totalStudents > 0 
    ? Math.round(((totalStudents - ranking + 1) / totalStudents) * 100)
    : 0

  // Determine if student is above or below average
  const isAboveAverage = studentRate >= classAverage
  const difference = Math.abs(studentRate - classAverage)

  // Get encouraging message and icon
  const getMessageData = () => {
    if (isAboveAverage) {
      if (difference >= 10) {
        return {
          text: "Outstanding! You're significantly above the class average!",
          icon: Star,
          iconColor: "text-yellow-500"
        }
      } else if (difference >= 5) {
        return {
          text: "Excellent! You're performing better than the class average!",
          icon: ThumbsUp,
          iconColor: "text-emerald-500"
        }
      } else {
        return {
          text: "Great job! You're above the class average!",
          icon: TrendingUp,
          iconColor: "text-emerald-500"
        }
      }
    } else {
      if (difference >= 10) {
        return {
          text: "Your attendance needs attention. Let's work on improving it!",
          icon: AlertCircle,
          iconColor: "text-orange-500"
        }
      } else if (difference >= 5) {
        return {
          text: "You're slightly below average. A little more effort will help!",
          icon: TrendingDown,
          iconColor: "text-blue-500"
        }
      } else {
        return {
          text: "You're close to the class average. Keep it up!",
          icon: Target,
          iconColor: "text-blue-500"
        }
      }
    }
  }

  const messageData = getMessageData()
  const MessageIcon = messageData.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Class Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 space-y-6">
          {/* Encouraging Message */}
          <div className={`p-4 rounded-xl border-0 ${
            isAboveAverage 
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
              : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/80 ${messageData.iconColor}`}>
                <MessageIcon className="h-5 w-5" />
              </div>
              <p className={`text-sm sm:text-base font-medium ${
                isAboveAverage ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {messageData.text}
              </p>
            </div>
          </div>

          {/* Comparison Bars */}
          <div className="space-y-6">
            {/* Student Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-slate-700">
                    Your Attendance
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-emerald-600">
                  {studentRate.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 sm:h-5 bg-slate-200 rounded-full overflow-hidden">
                {isClient && (
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${studentRate}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>

            {/* Class Average */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-500 p-1.5 rounded-lg text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-slate-700">
                    Class Average
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  {classAverage.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 sm:h-5 bg-slate-200 rounded-full overflow-hidden">
                {isClient && (
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${classAverage}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Difference Indicator */}
          <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-xl border-0 shadow-sm">
            <span className="text-sm sm:text-base text-slate-600">
              You are
            </span>
            <span className={`text-lg sm:text-xl font-bold ${
              isAboveAverage ? 'text-emerald-600' : 'text-orange-600'
            }`}>
              {difference.toFixed(1)}%
            </span>
            <span className="text-sm sm:text-base text-slate-600">
              {isAboveAverage ? 'above' : 'below'} average
            </span>
          </div>

          {/* Ranking Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ranking */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border-0 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-purple-700">
                  Your Ranking
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700">
                #{ranking}
              </div>
              <div className="text-xs sm:text-sm text-purple-600 mt-1">
                out of ~{totalStudents} students
              </div>
            </div>

            {/* Percentile */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border-0 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                <span className="text-xs sm:text-sm font-medium text-indigo-700">
                  Percentile
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-indigo-700">
                {percentile}th
              </div>
              <div className="text-xs sm:text-sm text-indigo-600 mt-1">
                Better than {percentile}% of class
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="text-xs sm:text-sm text-slate-500 text-center italic">
            Rankings are anonymized. Individual student data is not revealed.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
