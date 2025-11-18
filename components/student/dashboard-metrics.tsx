'use client'

import * as React from 'react'
import { EnhancedMetricCard } from '@/components/ui/enhanced-metric-card'
import { BookOpen, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardMetricsProps {
  totalClasses: number
  attendanceRate: number
  presentDays: number
  absentDays: number
}

/**
 * Dashboard Metrics Component
 * Displays four metric cards with count-up animations and glass morphism design
 * Features emerald gradient backgrounds and 3D hover effects (disabled on mobile)
 * Responsive grid: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
 */
export function DashboardMetrics({
  totalClasses,
  attendanceRate,
  presentDays,
  absentDays
}: DashboardMetricsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
    >
      {/* Total Classes Card */}
      <EnhancedMetricCard
        title="Total Classes"
        value={totalClasses}
        icon={<BookOpen className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100/50"
      />

      {/* Attendance Rate Card */}
      <EnhancedMetricCard
        title="Attendance Rate"
        value={`${attendanceRate.toFixed(1)}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0.1}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100/50"
      />

      {/* Present Days Card */}
      <EnhancedMetricCard
        title="Present Days"
        value={presentDays}
        icon={<CheckCircle className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0.2}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100/50"
      />

      {/* Absent Days Card */}
      <EnhancedMetricCard
        title="Absent Days"
        value={absentDays}
        icon={<XCircle className="h-5 w-5" />}
        color="red"
        animateValue={true}
        delay={0.3}
        className="bg-gradient-to-br from-red-50 to-red-100/50"
      />
    </motion.div>
  )
}
