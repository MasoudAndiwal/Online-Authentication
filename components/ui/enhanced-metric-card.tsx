'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import CountUp from '@/components/CountUp'
import { ModernCard } from './modern-card'

// Enhanced Metric Card with Count-up Animations
interface EnhancedMetricCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: string
  trendLabel?: string
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'amber'
  className?: string
  animateValue?: boolean
  delay?: number
}

const colorClasses = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-600',
    light: 'bg-blue-50'
  },
  emerald: {
    bg: 'from-emerald-500 to-emerald-600', 
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-600',
    light: 'bg-emerald-50'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    glow: 'shadow-purple-500/20', 
    text: 'text-purple-600',
    light: 'bg-purple-50'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    glow: 'shadow-orange-500/20',
    text: 'text-orange-600', 
    light: 'bg-orange-50'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    glow: 'shadow-red-500/20',
    text: 'text-red-600',
    light: 'bg-red-50'
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-600',
    light: 'bg-amber-50'
  }
}

export function EnhancedMetricCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'orange',
  className,
  animateValue = true,
  delay = 0
}: EnhancedMetricCardProps) {
  const colors = colorClasses[color]
  
  // Extract numeric value for count-up animation
  const numericValue = React.useMemo(() => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      // Handle percentage values
      if (value.includes('%')) {
        return parseFloat(value.replace('%', ''))
      }
      // Handle comma-separated numbers
      const cleanValue = value.replace(/,/g, '')
      const parsed = parseFloat(cleanValue)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }, [value])

  // Determine if value should have percentage or comma formatting
  const isPercentage = typeof value === 'string' && value.includes('%')
  const shouldUseCommas = numericValue >= 1000 && !isPercentage

  return (
    <ModernCard 
      variant="glass" 
      className={cn('relative overflow-hidden group', className)}
      hover={true}
      role="article"
      aria-label={`${title}: ${value}${trend ? `, ${trend} ${trendLabel || ''}` : ''}`}
      style={{ willChange: 'transform' }}
    >
      {/* Background Pattern - Hardware accelerated */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5" aria-hidden="true">
        <div 
          className={cn(
            'w-full h-full rounded-full bg-gradient-to-br',
            colors.bg
          )}
          style={{ transform: 'translate3d(2rem, -2rem, 0)' }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide" id={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}>
            {title}
          </p>
          {icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotateY: 10 }}
              className={cn(
                'p-2.5 rounded-xl shadow-lg relative overflow-hidden',
                `bg-gradient-to-br ${colors.bg} ${colors.glow}`
              )}
              aria-hidden="true"
              style={{ willChange: 'transform' }}
            >
              {/* Icon shine effect - Hardware accelerated */}
              <div 
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -skew-x-12 group-hover:translate-x-[-200%] transition-transform duration-1000"
                style={{ 
                  transform: 'translate3d(100%, 0, 0)',
                  willChange: 'transform'
                }}
              />
              <div className="relative z-10 text-white">
                {icon}
              </div>
            </motion.div>
          )}
        </div>

        {/* Value with Count-up Animation - Hardware accelerated */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 + delay }}
          style={{ willChange: 'transform, opacity' }}
        >
          <p 
            className="text-3xl font-bold text-slate-900 mb-2 tracking-tight"
            aria-labelledby={`metric-${title.replace(/\s+/g, '-').toLowerCase()}`}
            aria-live="polite"
          >
            {animateValue && numericValue > 0 ? (
              <>
                <CountUp
                  to={numericValue}
                  duration={2}
                  delay={delay}
                  separator={shouldUseCommas ? ',' : ''}
                  className="inline"
                />
                {isPercentage && '%'}
              </>
            ) : (
              value
            )}
          </p>
        </motion.div>

        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + delay }}
            className="flex items-center space-x-2"
          >
            <span className={cn(
              'text-sm font-semibold px-2 py-1 rounded-lg',
              colors.light,
              colors.text
            )}>
              {trend}
            </span>
            {trendLabel && (
              <span className="text-xs text-slate-500 font-medium">
                {trendLabel}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </ModernCard>
  )
}