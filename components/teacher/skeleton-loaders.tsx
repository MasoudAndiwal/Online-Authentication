'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Shimmer animation component with gradient
export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

// Skeleton base component with shimmer
interface SkeletonProps {
  className?: string
  shimmer?: boolean
}

function SkeletonBase({ className, shimmer = true }: SkeletonProps) {
  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      <div className="bg-gradient-to-r from-slate-200 to-slate-300 w-full h-full" />
      {shimmer && <ShimmerEffect />}
    </div>
  )
}

// Skeleton Metric Card - matches enhanced-metric-card structure
export function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Icon skeleton */}
          <SkeletonBase className="h-11 w-11 rounded-xl flex-shrink-0" />
          
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <SkeletonBase className="h-4 w-24" />
            {/* Value skeleton */}
            <SkeletonBase className="h-8 w-16" />
            {/* Subtitle skeleton */}
            <SkeletonBase className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Class Card - matches class card structure
export function SkeletonClassCard({ className }: { className?: string }) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50',
      'overflow-hidden',
      className
    )}>
      <CardHeader className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Icon skeleton */}
            <SkeletonBase className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              {/* Class name skeleton */}
              <SkeletonBase className="h-5 w-40" />
              {/* Room info skeleton */}
              <SkeletonBase className="h-4 w-24" />
            </div>
          </div>
          {/* Menu button skeleton */}
          <SkeletonBase className="h-8 w-8 rounded-lg" shimmer={false} />
        </div>

        {/* Stats skeleton */}
        <div className="space-y-2 mb-4">
          <SkeletonBase className="h-4 w-32" />
          <SkeletonBase className="h-4 w-36" />
          <SkeletonBase className="h-4 w-28" />
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <SkeletonBase className="h-9 flex-1 rounded-xl" />
          <SkeletonBase className="h-9 flex-1 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Student Progress Card - matches student-progress-card structure
export function SkeletonStudentProgressCard({ className }: { className?: string }) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50',
      'overflow-hidden',
      className
    )}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Avatar skeleton */}
            <SkeletonBase className="h-16 w-16 rounded-full flex-shrink-0" />
            
            <div className="flex-1 space-y-2">
              {/* Name skeleton */}
              <SkeletonBase className="h-5 w-32" />
              {/* ID skeleton */}
              <SkeletonBase className="h-4 w-24" />
              {/* Badges skeleton */}
              <div className="flex gap-2">
                <SkeletonBase className="h-6 w-20 rounded-full" />
                <SkeletonBase className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>

          {/* Attendance rate skeleton */}
          <div className="text-right space-y-1">
            <SkeletonBase className="h-8 w-16 ml-auto" />
            <SkeletonBase className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {/* Progress bars skeleton */}
        <div className="space-y-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <SkeletonBase className="h-3 w-20" />
              <SkeletonBase className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <SkeletonBase className="h-8 w-24 rounded-lg" />
            <SkeletonBase className="h-8 w-20 rounded-lg" />
          </div>
          <SkeletonBase className="h-8 w-16 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// Skeleton Report Card - matches report-card structure
export function SkeletonReportCard({ className }: { className?: string }) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50',
      'overflow-hidden',
      className
    )}>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Icon skeleton */}
            <SkeletonBase className="h-12 w-12 rounded-2xl flex-shrink-0" />
            
            <div className="flex-1 space-y-2">
              {/* Title skeleton */}
              <SkeletonBase className="h-6 w-48" />
              {/* Description skeleton */}
              <SkeletonBase className="h-4 w-full" />
              <SkeletonBase className="h-4 w-3/4" />
            </div>
          </div>
          {/* Menu skeleton */}
          <SkeletonBase className="h-8 w-8 rounded-lg" shimmer={false} />
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        {/* Stats skeleton */}
        <div className="flex items-center gap-6 mb-6">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 w-32" />
        </div>

        {/* Badge skeleton */}
        <div className="mb-6">
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-3">
          <SkeletonBase className="h-10 flex-1 rounded-xl" />
          <SkeletonBase className="h-10 w-10 rounded-xl" />
        </div>

        {/* View details link skeleton */}
        <SkeletonBase className="h-10 w-full rounded-xl mt-4" />
      </CardContent>
    </Card>
  )
}

// Skeleton Attendance Grid - matches attendance table structure
export function SkeletonAttendanceGrid({ 
  rows = 5, 
  className 
}: { 
  rows?: number
  className?: string 
}) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl overflow-hidden',
      className
    )}>
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
        <div className="grid grid-cols-5 gap-4">
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 w-16" />
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-4 w-16" />
        </div>
      </div>

      {/* Rows skeleton */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              {/* Student info */}
              <div className="flex items-center gap-3">
                <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
                <SkeletonBase className="h-4 w-24" />
              </div>
              {/* Status buttons */}
              <SkeletonBase className="h-8 w-20 rounded-lg" />
              <SkeletonBase className="h-8 w-20 rounded-lg" />
              <SkeletonBase className="h-8 w-20 rounded-lg" />
              <SkeletonBase className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Skeleton Notification Item
export function SkeletonNotificationItem({ className }: { className?: string }) {
  return (
    <div className={cn(
      'p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200',
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Title skeleton */}
          <SkeletonBase className="h-4 w-48" />
          {/* Message skeleton */}
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-3/4" />
          {/* Time skeleton */}
          <SkeletonBase className="h-3 w-24" />
        </div>

        {/* Action button skeleton */}
        <SkeletonBase className="h-8 w-8 rounded-lg" shimmer={false} />
      </div>
    </div>
  )
}

// Skeleton Chart - for progress charts
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl',
      className
    )}>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-6 w-40" />
          <SkeletonBase className="h-8 w-24 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {/* Chart bars skeleton */}
        <div className="flex items-end justify-between gap-2 h-48">
          {Array.from({ length: 7 }).map((_, i) => {
            const height = `${Math.random() * 60 + 40}%`;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg" style={{ height }}>
                  <SkeletonBase className="w-full h-full" />
                </div>
                <SkeletonBase className="h-3 w-8" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Grid layouts for multiple skeleton cards
interface SkeletonGridProps {
  count?: number
  columns?: 2 | 3 | 4
  className?: string
}

export function SkeletonMetricGrid({ 
  count = 4, 
  columns = 4, 
  className 
}: SkeletonGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonMetricCard />
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonClassGrid({ 
  count = 6, 
  columns = 3, 
  className 
}: SkeletonGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonClassCard />
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonStudentProgressGrid({ 
  count = 6, 
  columns = 3, 
  className 
}: SkeletonGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonStudentProgressCard />
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonReportGrid({ 
  count = 4, 
  columns = 2, 
  className 
}: SkeletonGridProps) {
  return (
    <div className={cn(
      'grid gap-6',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonReportCard />
        </motion.div>
      ))}
    </div>
  )
}

// Full page skeleton for teacher dashboard
export function SkeletonTeacherDashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Header skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <SkeletonBase className="h-10 w-64" />
        <SkeletonBase className="h-6 w-96" />
      </motion.div>

      {/* Metrics grid skeleton */}
      <SkeletonMetricGrid count={4} columns={4} />

      {/* Quick actions skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="rounded-2xl shadow-lg border-0 bg-white/60 backdrop-blur-sm p-6">
          <div className="flex gap-3">
            <SkeletonBase className="h-10 flex-1 rounded-xl" />
            <SkeletonBase className="h-10 flex-1 rounded-xl" />
            <SkeletonBase className="h-10 flex-1 rounded-xl" />
          </div>
        </Card>
      </motion.div>

      {/* Classes grid skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <SkeletonBase className="h-8 w-32" />
        <SkeletonClassGrid count={6} columns={3} />
      </motion.div>
    </div>
  )
}
