'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendDirection?: 'up' | 'down'
  color?: 'blue' | 'emerald' | 'green' | 'red' | 'orange' | 'purple'
  gradient?: string
  className?: string
  animated?: boolean
}

const colorConfig = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-400/20',
    trendColor: 'text-blue-100'
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-400/20',
    trendColor: 'text-emerald-100'
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    iconBg: 'bg-green-400/20',
    trendColor: 'text-green-100'
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    iconBg: 'bg-red-400/20',
    trendColor: 'text-red-100'
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-400/20',
    trendColor: 'text-orange-100'
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-400/20',
    trendColor: 'text-purple-100'
  }
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'blue',
  gradient,
  className,
  animated = true
}: MetricCardProps) {
  const config = colorConfig[color]
  const gradientClass = gradient || `bg-gradient-to-br ${config.gradient}`

  return (
    <motion.div
      whileHover={animated ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300',
        gradientClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <motion.p 
            className="text-2xl font-bold"
            initial={animated ? { opacity: 0, y: 10 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.p 
              className={cn("text-sm mt-1 flex items-center", config.trendColor)}
              initial={animated ? { opacity: 0 } : undefined}
              animate={animated ? { opacity: 1 } : undefined}
              transition={{ delay: 0.2 }}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {trend}
            </motion.p>
          )}
        </div>
        <motion.div 
          className={cn("rounded-lg p-3", config.iconBg)}
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { scale: 1, rotate: 0 } : undefined}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}