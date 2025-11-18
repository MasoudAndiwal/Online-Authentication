'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Comprehensive Loading Skeleton Components
 * Provides shimmer-effect skeletons for all student dashboard components
 * Optimized for performance with hardware acceleration
 */

/**
 * Metric Card Skeleton
 * Used for dashboard metrics loading state
 */
export function MetricCardSkeleton() {
  return (
    <Card className="rounded-2xl shadow-sm bg-white border-0">
      <CardContent className="p-4 sm:p-5 lg:p-6">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl animate-shimmer-emerald" />
              <div>
                <div className="h-4 w-24 sm:w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
                <div className="h-3 w-16 sm:w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
              </div>
            </div>
          </div>
          <div className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Calendar Skeleton
 * Used for weekly attendance calendar loading state
 */
export function CalendarSkeleton() {
  return (
    <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-4 sm:p-6 animate-pulse">
      <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 animate-shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl animate-shimmer-emerald" />
        ))}
      </div>
    </div>
  )
}

/**
 * Progress Tracker Skeleton
 * Used for progress tracker loading state
 */
export function ProgressTrackerSkeleton() {
  return (
    <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-4 sm:p-6 animate-pulse">
      <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-6 animate-shimmer" />
      <div className="flex flex-col md:flex-row gap-6">
        {/* Circular progress */}
        <div className="flex items-center justify-center">
          <div className="h-40 w-40 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 animate-shimmer-emerald" />
        </div>
        {/* Progress bars */}
        <div className="flex-1 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
              <div className="h-3 w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Alert Card Skeleton
 * Used for academic standing alerts loading state
 */
export function AlertCardSkeleton() {
  return (
    <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-4 sm:p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 animate-shimmer-emerald flex-shrink-0" />
        <div className="flex-1">
          <div className="h-6 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-3 animate-shimmer" />
          <div className="h-4 w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded mb-2 animate-shimmer" />
          <div className="h-4 w-3/4 bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

/**
 * Message List Skeleton
 * Used for messaging interface loading state
 */
export function MessageListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white/80 backdrop-blur-xl border-0 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 animate-shimmer-emerald flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-shimmer" />
              <div className="h-3 w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded mb-1 animate-shimmer" />
              <div className="h-3 w-2/3 bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Timeline Skeleton
 * Used for attendance history timeline loading state
 */
export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-400 animate-shimmer-emerald" />
            {i < 5 && <div className="w-0.5 h-20 bg-gradient-to-b from-slate-200 to-slate-300 animate-shimmer" />}
          </div>
          <div className="flex-1 pb-8">
            <div className="rounded-xl bg-white/80 backdrop-blur-xl border-0 p-4">
              <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-3 animate-shimmer" />
              <div className="h-3 w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded mb-2 animate-shimmer" />
              <div className="h-3 w-3/4 bg-gradient-to-r from-slate-100 to-slate-200 rounded animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * FAQ Skeleton
 * Used for FAQ accordion loading state
 */
export function FAQSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl bg-white/80 backdrop-blur-xl border-0 p-4 animate-pulse">
          <div className="h-5 w-3/4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-shimmer" />
        </div>
      ))}
    </div>
  )
}

/**
 * Chart Skeleton
 * Used for trend analysis charts loading state
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-4 sm:p-6 animate-pulse">
      <div className="h-8 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-6 animate-shimmer" />
      <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl animate-shimmer" />
    </div>
  )
}

/**
 * Generic Card Skeleton
 * Reusable skeleton for any card-based content
 */
export function GenericCardSkeleton({ height = 'h-48' }: { height?: string }) {
  return (
    <div className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0 p-4 sm:p-6 animate-pulse">
      <div className="h-6 w-40 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-4 animate-shimmer" />
      <div className={`${height} bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl animate-shimmer`} />
    </div>
  )
}

/**
 * Full Page Skeleton
 * Used for entire page loading states
 */
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="h-32 rounded-2xl bg-gradient-to-r from-emerald-100 to-emerald-200 animate-shimmer-emerald" />
        
        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GenericCardSkeleton height="h-64" />
          <GenericCardSkeleton height="h-64" />
        </div>
      </div>
    </div>
  )
}
