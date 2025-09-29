'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Skeleton Card Component
interface SkeletonCardProps {
  className?: string
  showAvatar?: boolean
  lines?: number
}

export function SkeletonCard({ 
  className, 
  showAvatar = false, 
  lines = 3 
}: SkeletonCardProps) {
  return (
    <div className={cn(
      'bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg',
      className
    )}>
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {showAvatar && (
              <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
            )}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-3 bg-slate-200 rounded",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton Table Component
interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  className 
}: SkeletonTableProps) {
  return (
    <div className={cn(
      'bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden',
      className
    )}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded w-20"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-slate-100 last:border-b-0">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={cn(
                    "h-4 bg-slate-200 rounded",
                    colIndex === 0 ? "w-32" : "w-16"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shimmer Effect Component
export function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'slate'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    white: 'text-white',
    slate: 'text-slate-600'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        'inline-block border-2 border-current border-t-transparent rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}

// Page Loading Component
export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
        />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-slate-900 mb-2"
        >
          Loading Dashboard
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600"
        >
          Please wait while we prepare your data...
        </motion.p>
      </motion.div>
    </div>
  )
}

// Content Loading Component
export function ContentLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-12"
    >
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-slate-600">{message}</p>
      </div>
    </motion.div>
  )
}

// Skeleton Grid Component
interface SkeletonGridProps {
  items?: number
  columns?: number
  className?: string
}

export function SkeletonGrid({ 
  items = 6, 
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
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}