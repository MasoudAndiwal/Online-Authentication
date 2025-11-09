'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
}

export function Progress({ 
  value, 
  max = 100, 
  className, 
  indicatorClassName 
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-slate-200',
      className
    )}>
      <motion.div
        className={cn(
          'h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full',
          indicatorClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}