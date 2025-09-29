'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressIndicatorProps {
  percentage: number
  label?: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'emerald'
  animated?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-200',
    fill: 'from-blue-400 to-blue-600',
    text: 'text-blue-700'
  },
  green: {
    bg: 'bg-green-200',
    fill: 'from-green-400 to-green-600',
    text: 'text-green-700'
  },
  yellow: {
    bg: 'bg-yellow-200',
    fill: 'from-yellow-400 to-yellow-600',
    text: 'text-yellow-700'
  },
  red: {
    bg: 'bg-red-200',
    fill: 'from-red-400 to-red-600',
    text: 'text-red-700'
  },
  purple: {
    bg: 'bg-purple-200',
    fill: 'from-purple-400 to-purple-600',
    text: 'text-purple-700'
  },
  emerald: {
    bg: 'bg-emerald-200',
    fill: 'from-emerald-400 to-emerald-600',
    text: 'text-emerald-700'
  }
}

const sizeConfig = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

export function ProgressIndicator({
  percentage,
  label,
  color = 'blue',
  animated = true,
  showPercentage = true,
  size = 'md',
  className
}: ProgressIndicatorProps) {
  const [displayPercentage, setDisplayPercentage] = React.useState(0)
  const config = colorConfig[color]
  const sizeClass = sizeConfig[size]

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayPercentage(percentage)
    }
  }, [percentage, animated])

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {showPercentage && (
            <motion.span 
              className={cn("text-sm font-bold", config.text)}
              animate={animated ? { opacity: [0.5, 1, 0.5] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(displayPercentage)}%
            </motion.span>
          )}
        </div>
      )}
      
      <div className={cn('w-full rounded-full overflow-hidden', config.bg, sizeClass)}>
        <motion.div
          className={cn('h-full bg-gradient-to-r rounded-full', config.fill)}
          initial={{ width: 0 }}
          animate={{ width: `${displayPercentage}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
        />
      </div>
    </div>
  )
}

// Circular progress indicator
interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'emerald'
  animated?: boolean
  showPercentage?: boolean
  className?: string
}

export function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'blue',
  animated = true,
  showPercentage = true,
  className
}: CircularProgressProps) {
  const [displayPercentage, setDisplayPercentage] = React.useState(0)
  const config = colorConfig[color]
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayPercentage(percentage)
    }
  }, [percentage, animated])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={config.bg.replace('bg-', 'text-')}
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-600)`} />
          </linearGradient>
        </defs>
      </svg>
      
      {showPercentage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <span className={cn("text-2xl font-bold", config.text)}>
            {Math.round(displayPercentage)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}