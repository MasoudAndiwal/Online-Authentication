'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, AlertCircle, CheckCircle, XCircle, Pin } from 'lucide-react'

interface ThresholdWarningsProps {
  attendanceRate: number
  absentHours: number
  totalHours: number
  mahroomThreshold?: number // Percentage threshold for محروم (e.g., 75%)
  tasdiqThreshold?: number // Percentage threshold for تصدیق طلب (e.g., 85%)
}

/**
 * Threshold Warnings Component
 * Displays warnings about approaching محروم (Disqualified) and تصدیق طلب (Certification Required) thresholds
 * Shows remaining allowable absences with color-coded warning zones
 * Green zone (>85%), Yellow zone (75-85%), Orange zone (approaching محروم), Red zone (محروم or تصدیق طلب)
 */
export function ThresholdWarnings({
  attendanceRate,
  absentHours,
  totalHours,
  mahroomThreshold = 75, // Default: 75% attendance required
  tasdiqThreshold = 85 // Default: 85% attendance for certification
}: ThresholdWarningsProps) {
  // Calculate maximum allowable absences based on thresholds
  const maxAbsencesForMahroom = totalHours > 0 
    ? Math.floor(totalHours * (1 - mahroomThreshold / 100))
    : 0
  
  const maxAbsencesForTasdiq = totalHours > 0
    ? Math.floor(totalHours * (1 - tasdiqThreshold / 100))
    : 0

  // Calculate remaining absences
  const remainingAbsencesBeforeMahroom = Math.max(0, maxAbsencesForMahroom - absentHours)
  const remainingAbsencesBeforeTasdiq = Math.max(0, maxAbsencesForTasdiq - absentHours)

  // Determine warning zone
  const getWarningZone = () => {
    if (attendanceRate < mahroomThreshold) {
      return 'red' // Critical: محروم status
    } else if (attendanceRate < tasdiqThreshold) {
      return 'orange' // Warning: تصدیق طلب status
    } else if (attendanceRate < 90) {
      return 'yellow' // Caution: Approaching warning zone
    } else {
      return 'green' // Good standing
    }
  }

  const warningZone = getWarningZone()

  // Get warning message based on zone
  const getWarningMessage = () => {
    if (warningZone === 'red') {
      return {
        title: 'Critical: Disqualified (محروم)',
        message: `You have exceeded the maximum allowed absences. Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below the required ${mahroomThreshold}%. You are not eligible for final exams.`,
        icon: <XCircle className="h-6 w-6" />,
        action: 'Contact your teacher or office immediately'
      }
    } else if (warningZone === 'orange') {
      return {
        title: 'Warning: Certification Required (تصدیق طلب)',
        message: `Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below ${tasdiqThreshold}%. You need to submit medical certificates to restore exam eligibility. You have ${remainingAbsencesBeforeMahroom} absence(s) remaining before disqualification.`,
        icon: <AlertCircle className="h-6 w-6" />,
        action: 'Upload medical documentation as soon as possible'
      }
    } else if (warningZone === 'yellow') {
      return {
        title: 'Caution: Watch Your Absences',
        message: `Your attendance rate is ${attendanceRate.toFixed(1)}%. You have ${remainingAbsencesBeforeTasdiq} absence(s) remaining before requiring certification, and ${remainingAbsencesBeforeMahroom} absence(s) before disqualification.`,
        icon: <AlertTriangle className="h-6 w-6" />,
        action: 'Try to maintain good attendance'
      }
    } else {
      return {
        title: 'Excellent: Good Standing',
        message: `Great job! Your attendance rate is ${attendanceRate.toFixed(1)}%. You have ${remainingAbsencesBeforeTasdiq} absence(s) remaining before requiring certification, and ${remainingAbsencesBeforeMahroom} absence(s) before disqualification.`,
        icon: <CheckCircle className="h-6 w-6" />,
        action: 'Keep up the excellent work!'
      }
    }
  }

  const warning = getWarningMessage()

  // Color classes for each zone
  const zoneColors = {
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100/50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      title: 'text-orange-800',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-700'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700'
    }
  }

  const colors = zoneColors[warningZone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className={`rounded-2xl shadow-xl border-0 ${colors.bg}`}>
        <CardContent className="p-4 sm:p-5 lg:p-6">
          {/* Header with Icon */}
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <motion.div
              className={colors.icon}
              animate={warningZone === 'red' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: warningZone === 'red' ? Infinity : 0 }}
            >
              {warning.icon}
            </motion.div>
            <div className="flex-1">
              <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${colors.title} mb-2`}>
                {warning.title}
              </h3>
              <p className={`text-sm sm:text-base ${colors.text} leading-relaxed`}>
                {warning.message}
              </p>
            </div>
          </div>

          {/* Threshold Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {/* Mahroom Threshold */}
            <div className={`${colors.badge} rounded-xl p-3 sm:p-4`}>
              <div className="text-xs sm:text-sm font-medium mb-1">
                Disqualification Threshold (محروم)
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {remainingAbsencesBeforeMahroom}
              </div>
              <div className="text-xs sm:text-sm opacity-80">
                absence(s) remaining
              </div>
            </div>

            {/* Tasdiq Threshold */}
            <div className={`${colors.badge} rounded-xl p-3 sm:p-4`}>
              <div className="text-xs sm:text-sm font-medium mb-1">
                Certification Threshold (تصدیق طلب)
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {remainingAbsencesBeforeTasdiq}
              </div>
              <div className="text-xs sm:text-sm opacity-80">
                absence(s) remaining
              </div>
            </div>
          </div>

          {/* Action Message */}
          <div className={`mt-4 sm:mt-6 p-3 sm:p-4 ${colors.badge} rounded-xl`}>
            <div className="flex items-center gap-2">
              <Pin className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                {warning.action}
              </p>
            </div>
          </div>

          {/* Visual Threshold Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="text-slate-600">Attendance Rate</span>
              <span className={`font-semibold ${colors.text}`}>
                {attendanceRate.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-3 sm:h-4 bg-slate-200 rounded-full overflow-hidden">
              {/* Threshold markers */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
                style={{ left: `${tasdiqThreshold}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: `${mahroomThreshold}%` }}
              />
              {/* Progress fill */}
              <motion.div
                className={`h-full ${
                  warningZone === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  warningZone === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  warningZone === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${attendanceRate}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span className="text-red-600">{mahroomThreshold}%</span>
              <span className="text-orange-600">{tasdiqThreshold}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
