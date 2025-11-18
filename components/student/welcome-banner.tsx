'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { Calendar, MessageSquare } from 'lucide-react'

interface WelcomeBannerProps {
  studentName: string
  attendanceRate: number
  onViewAttendance?: () => void
  onContactTeacher?: () => void
}

/**
 * Welcome Banner Component
 * Displays personalized greeting with motivational message based on attendance performance
 * Features green gradient background with floating elements and quick action buttons
 * Fully responsive with adaptive text sizes and button layouts
 */
export function WelcomeBanner({
  studentName,
  attendanceRate,
  onViewAttendance,
  onContactTeacher
}: WelcomeBannerProps) {
  const isMobile = useIsMobile()

  // Determine motivational message based on attendance rate
  const getMotivationalMessage = (rate: number) => {
    if (rate >= 95) {
      return {
        message: "Outstanding attendance! Keep up the excellent work!",
        status: 'excellent' as const
      }
    } else if (rate >= 85) {
      return {
        message: "Great job! You're doing well. Stay consistent!",
        status: 'good' as const
      }
    } else if (rate >= 75) {
      return {
        message: "Your attendance needs attention. Let's improve together!",
        status: 'warning' as const
      }
    } else {
      return {
        message: "Urgent: Your attendance is at risk. Please contact your teacher.",
        status: 'critical' as const
      }
    }
  }

  const { message, status } = getMotivationalMessage(attendanceRate)

  // Floating elements animation variants
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-4 sm:p-6 lg:p-12 shadow-xl"
    >
      {/* Floating Elements - Hidden on mobile for performance */}
      {!isMobile && (
        <>
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"
            aria-hidden="true"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '1s' }}
            className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
            aria-hidden="true"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '2s' }}
            className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-xl"
            aria-hidden="true"
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl sm:text-2xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4"
        >
          Welcome back, {studentName}!
        </motion.h1>

        {/* Motivational Message */}
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`text-sm sm:text-base lg:text-xl mb-6 sm:mb-8 ${
            status === 'critical' 
              ? 'text-red-100 font-semibold' 
              : status === 'warning'
              ? 'text-yellow-100 font-medium'
              : 'text-emerald-50'
          }`}
        >
          {message}
        </motion.p>

        {/* Quick Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <Button
            onClick={onViewAttendance}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-xl shadow-emerald-500/25 border-0 text-white min-h-[44px] text-sm sm:text-base"
            size="lg"
          >
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            View Attendance
          </Button>
          <Button
            onClick={onContactTeacher}
            variant="secondary"
            className="bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg border-0 text-emerald-700 hover:text-emerald-800 min-h-[44px] text-sm sm:text-base"
            size="lg"
          >
            <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Contact Teacher
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
