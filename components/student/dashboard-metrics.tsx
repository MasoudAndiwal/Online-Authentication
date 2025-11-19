'use client'

import * as React from 'react'
import { EnhancedMetricCard } from '@/components/ui/enhanced-metric-card'
import { BookOpen, TrendingUp, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOptimizedAnimation } from '@/hooks/use-optimized-animation'

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
 * Optimized with hardware acceleration and reduced motion support
 */
export function DashboardMetrics({
  totalClasses,
  attendanceRate,
  presentDays,
  absentDays
}: DashboardMetricsProps) {
  const { shouldAnimate, getDuration } = useOptimizedAnimation()

  const containerVariants = shouldAnimate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <motion.div
      initial={containerVariants.initial}
      animate={containerVariants.animate}
      transition={{
        duration: getDuration(500) / 1000,
        delay: getDuration(200) / 1000,
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
      style={{ willChange: shouldAnimate ? 'transform, opacity' : 'auto' }}
    >
      {/* Total Classes Card */}
      <EnhancedMetricCard
        title="Total Classes"
        value={totalClasses}
        icon={<BookOpen className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0}
        className="bg-emerald-50/50"
      />

      {/* Attendance Rate Card */}
      <EnhancedMetricCard
        title="Attendance Rate"
        value={`${attendanceRate.toFixed(1)}%`}
        icon={<TrendingUp className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0.1}
        className="bg-emerald-50/50"
      />

      {/* Present Days Card */}
      <EnhancedMetricCard
        title="Present Days"
        value={presentDays}
        icon={<CheckCircle className="h-5 w-5" />}
        color="emerald"
        animateValue={true}
        delay={0.2}
        className="bg-emerald-50/50"
      />

      {/* Absent Days Card */}
      <EnhancedMetricCard
        title="Absent Days"
        value={absentDays}
        icon={<XCircle className="h-5 w-5" />}
        color="red"
        animateValue={true}
        delay={0.3}
        className="bg-red-50/50"
      />
    </motion.div>
  )
}
