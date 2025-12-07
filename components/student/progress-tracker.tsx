'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, CheckCircle, XCircle, Heart, Calendar } from 'lucide-react'

interface ProgressTrackerProps {
  attendanceRate: number
  presentHours: number
  absentHours: number
  sickHours: number
  leaveHours: number
  totalHours: number
}

/**
 * Progress Tracker Component
 * Displays circular progress indicator and horizontal progress bars
 * Shows attendance statistics with animated fill effects
 * Styled with green gradients for positive metrics
 */
export function ProgressTracker({
  attendanceRate,
  presentHours,
  absentHours,
  sickHours,
  leaveHours,
  totalHours
}: ProgressTrackerProps) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate percentages
  const presentPercentage = totalHours > 0 ? (presentHours / totalHours) * 100 : 0
  const absentPercentage = totalHours > 0 ? (absentHours / totalHours) * 100 : 0
  const sickPercentage = totalHours > 0 ? (sickHours / totalHours) * 100 : 0
  const leavePercentage = totalHours > 0 ? (leaveHours / totalHours) * 100 : 0

  // Circular progress calculation - using viewBox-based coordinates
  const size = 200 // viewBox size
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2 // 94
  const center = size / 2 // 100
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Progress & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 space-y-6 sm:space-y-8">
          {/* Circular Progress Indicator */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
              {/* Background Circle */}
              <svg 
                className="w-full h-full transform -rotate-90"
                viewBox={`0 0 ${size} ${size}`}
              >
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="none"
                  className="text-slate-200"
                />
                {/* Progress Circle */}
                {isClient && (
                  <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="url(#emeraldGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                )}
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-center px-4"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-emerald-600 to-emerald-700 bg-clip-text text-transparent whitespace-nowrap">
                    {attendanceRate.toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 mt-1">
                    Attendance Rate
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm sm:text-base text-slate-600">
                Total Hours: <span className="font-semibold text-slate-800">{totalHours}</span>
              </p>
            </div>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-4 sm:space-y-5">
            {/* Present Hours */}
            <ProgressBar
              label="Present"
              hours={presentHours}
              percentage={presentPercentage}
              color="emerald"
              icon={<CheckCircle className="h-4 w-4" />}
              delay={0.6}
            />

            {/* Absent Hours */}
            <ProgressBar
              label="Absent"
              hours={absentHours}
              percentage={absentPercentage}
              color="red"
              icon={<XCircle className="h-4 w-4" />}
              delay={0.7}
            />

            {/* Sick Hours */}
            <ProgressBar
              label="Sick"
              hours={sickHours}
              percentage={sickPercentage}
              color="yellow"
              icon={<Heart className="h-4 w-4" />}
              delay={0.8}
            />

            {/* Leave Hours */}
            <ProgressBar
              label="Leave"
              hours={leaveHours}
              percentage={leavePercentage}
              color="blue"
              icon={<Calendar className="h-4 w-4" />}
              delay={0.9}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ProgressBarProps {
  label: string
  hours: number
  percentage: number
  color: 'emerald' | 'red' | 'yellow' | 'blue'
  icon: React.ReactNode
  delay: number
}

function ProgressBar({ label, hours, percentage, color, icon, delay }: ProgressBarProps) {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100',
      fill: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-500'
    },
    red: {
      bg: 'bg-red-100',
      fill: 'bg-gradient-to-r from-red-500 to-red-600',
      text: 'text-red-700',
      iconBg: 'bg-red-500'
    },
    yellow: {
      bg: 'bg-yellow-100',
      fill: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      text: 'text-yellow-700',
      iconBg: 'bg-yellow-500'
    },
    blue: {
      bg: 'bg-blue-100',
      fill: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-blue-700',
      iconBg: 'bg-blue-500'
    }
  }

  const colors = colorClasses[color]

  return (
    <div className="space-y-2">
      {/* Label and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${colors.iconBg} p-1.5 rounded-lg text-white`}>
            {icon}
          </div>
          <span className="text-sm sm:text-base font-medium text-slate-700">
            {label}
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm sm:text-base font-semibold ${colors.text}`}>
            {hours} hrs
          </span>
          <span className="text-xs sm:text-sm text-slate-500 ml-2">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`h-3 sm:h-4 ${colors.bg} rounded-full overflow-hidden`}>
        {isClient && (
          <motion.div
            className={`h-full ${colors.fill} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  )
}
