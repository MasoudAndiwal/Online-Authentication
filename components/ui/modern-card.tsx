'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}

const variantClasses = {
  default: 'bg-white border border-slate-200/60 shadow-sm',
  elevated: 'bg-white border-0 shadow-lg shadow-slate-200/50',
  glass: 'bg-white/70 backdrop-blur-xl border-0 shadow-lg shadow-slate-200/30',
  gradient: 'bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 border-0 shadow-md'
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6', 
  lg: 'p-8',
  xl: 'p-10'
}

export function ModernCard({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  padding = 'md'
}: ModernCardProps) {
  return (
    <motion.div
      whileHover={hover ? { 
        y: -4, 
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      } : undefined}
      className={cn(
        'rounded-2xl transition-all duration-300 relative overflow-hidden',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:shadow-xl hover:shadow-slate-200/40',
        className
      )}
    >
      {/* Subtle shine effect */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

interface ModernCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardHeader({ children, className }: ModernCardHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {children}
    </div>
  )
}

interface ModernCardTitleProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export function ModernCardTitle({ children, className, icon }: ModernCardTitleProps) {
  return (
    <h3 className={cn(
      'text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3',
      className
    )}>
      {icon && (
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </h3>
  )
}

interface ModernCardContentProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardContent({ children, className }: ModernCardContentProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  )
}

// Modern Metric Card with 3D Effects
interface ModernMetricCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: string
  trendLabel?: string
  color?: 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'amber'
  className?: string
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

export function ModernMetricCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'blue',
  className
}: ModernMetricCardProps) {
  const colors = colorClasses[color]
  
  return (
    <ModernCard 
      variant="glass" 
      className={cn('relative overflow-hidden group', className)}
      hover={true}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div className={cn(
          'w-full h-full rounded-full bg-gradient-to-br transform translate-x-8 -translate-y-8',
          colors.bg
        )} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          {icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotateY: 10 }}
              className={cn(
                'p-2.5 rounded-xl shadow-lg relative overflow-hidden',
                `bg-gradient-to-br ${colors.bg} ${colors.glow}`
              )}
            >
              {/* Icon shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
              <div className="relative z-10 text-white">
                {icon}
              </div>
            </motion.div>
          )}
        </div>

        {/* Value with Count-up Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            {value}
          </p>
        </motion.div>

        {/* Trend */}
        {trend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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

// Modern Alert Card
interface ModernAlertCardProps {
  title: string
  message: string
  type?: 'info' | 'warning' | 'success' | 'error'
  action?: React.ReactNode
  className?: string
}

const alertColors = {
  info: {
    bg: 'from-blue-50 to-blue-100/50',
    border: 'border-blue-200/50',
    icon: 'text-blue-600',
    title: 'text-blue-900'
  },
  warning: {
    bg: 'from-amber-50 to-amber-100/50', 
    border: 'border-amber-200/50',
    icon: 'text-amber-600',
    title: 'text-amber-900'
  },
  success: {
    bg: 'from-emerald-50 to-emerald-100/50',
    border: 'border-emerald-200/50', 
    icon: 'text-emerald-600',
    title: 'text-emerald-900'
  },
  error: {
    bg: 'from-red-50 to-red-100/50',
    border: 'border-red-200/50',
    icon: 'text-red-600', 
    title: 'text-red-900'
  }
}

export function ModernAlertCard({
  title,
  message,
  type = 'info',
  action,
  className
}: ModernAlertCardProps) {
  const colors = alertColors[type]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'p-6 rounded-2xl border backdrop-blur-sm relative overflow-hidden',
        `bg-gradient-to-br ${colors.bg} ${colors.border}`,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className={cn('font-semibold mb-2', colors.title)}>
            {title}
          </h4>
          <p className="text-slate-700 text-sm leading-relaxed">
            {message}
          </p>
        </div>
        {action && (
          <div className="ml-4 flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  )
}