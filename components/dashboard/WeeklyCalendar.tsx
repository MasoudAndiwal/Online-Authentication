'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekData, DayAttendance } from '@/types/types';
import { GRADIENT_ACCENTS } from '@/lib/constants';
import { StaggerChildren, StaggerItem } from '@/components/animations';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  weekData: WeekData;
  onWeekChange: (direction: 'prev' | 'next') => void;
}

/**
 * WeeklyCalendar component displays attendance status for each day of the week
 * with navigation controls and animated day cards
 */
export function WeeklyCalendar({ weekData, onWeekChange }: WeeklyCalendarProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleWeekChange = async (direction: 'prev' | 'next') => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    onWeekChange(direction);
    
    // Reset navigation state after animation
    setTimeout(() => setIsNavigating(false), 300);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isNavigating) return;
    
    // Right swipe = previous week, Left swipe = next week (RTL behavior)
    if (direction === 'right') {
      handleWeekChange('prev');
    } else if (direction === 'left') {
      handleWeekChange('next');
    }
  };

  const formatDateRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('fa-IR', { month: 'long' });
    const endMonth = end.toLocaleDateString('fa-IR', { month: 'long' });
    
    if (startMonth === endMonth) {
      return `${start.getDate()} - ${end.getDate()} ${startMonth}`;
    } else {
      return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth}`;
    }
  };

  return (
    <motion.section 
      className="bg-white border-0 shadow-sm rounded-xl p-6"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
      aria-label="تقویم هفتگی حضور و غیاب"
    >
      {/* Calendar Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            تقویم هفتگی
          </h2>
          <p className="text-sm text-slate-600">
            {formatDateRange(weekData.startDate, weekData.endDate)}
          </p>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleWeekChange('prev')}
            disabled={isNavigating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWeekChange('prev');
              }
            }}
            className={cn(
              "w-10 h-10 rounded-lg border-0 shadow-md",
              "bg-gradient-to-r from-blue-500 to-violet-500",
              "text-white flex items-center justify-center",
              "transition-all duration-200 hover:shadow-lg hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="هفته قبل"
            tabIndex={0}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleWeekChange('next')}
            disabled={isNavigating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWeekChange('next');
              }
            }}
            className={cn(
              "w-10 h-10 rounded-lg border-0 shadow-md",
              "bg-gradient-to-r from-blue-500 to-violet-500",
              "text-white flex items-center justify-center",
              "transition-all duration-200 hover:shadow-lg hover:scale-105",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="هفته بعد"
            tabIndex={0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Day Cards Grid with Swipe Support */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          const swipeThreshold = 100;
          const swipeVelocityThreshold = 500;
          
          if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > swipeVelocityThreshold) {
            if (offset.x > 0) {
              handleSwipe('right');
            } else {
              handleSwipe('left');
            }
          }
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <StaggerChildren 
          staggerDelay={0.1}
          className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3"
        >
          {weekData.days.map((day, index) => (
            <DayCard key={`${day.date}-${index}`} day={day} />
          ))}
        </StaggerChildren>
      </motion.div>
    </motion.section>
  );
}

/**
 * Individual day card component with status visualization
 */
function DayCard({ day }: { day: DayAttendance }) {
  const shouldReduceMotion = useReducedMotion();
  const getStatusGradient = (status: DayAttendance['status']) => {
    switch (status) {
      case 'present':
        return GRADIENT_ACCENTS.present;
      case 'absent':
        return GRADIENT_ACCENTS.absent;
      case 'sick':
        return GRADIENT_ACCENTS.sick;
      case 'leave':
        return GRADIENT_ACCENTS.leave;
      case 'future':
        return GRADIENT_ACCENTS.future;
      default:
        return GRADIENT_ACCENTS.future;
    }
  };

  const getStatusText = (status: DayAttendance['status']) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'absent':
        return 'غایب';
      case 'sick':
        return 'مریضی';
      case 'leave':
        return 'مرخصی';
      case 'future':
        return 'آینده';
      default:
        return 'نامشخص';
    }
  };

  const getTextColor = (status: DayAttendance['status']) => {
    return status === 'future' ? 'text-slate-100' : 'text-white';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  return (
    <StaggerItem>
      <motion.article
        className={cn(
          "border-0 shadow-md rounded-xl p-4 min-h-[120px]",
          "transition-all duration-300 hover:shadow-lg hover:scale-105",
          "cursor-pointer",
          getStatusGradient(day.status)
        )}
        whileHover={shouldReduceMotion ? {} : { y: -2 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        role="button"
        tabIndex={0}
        aria-label={`${day.dayName} ${formatDate(day.date)} - وضعیت: ${getStatusText(day.status)}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Could trigger day detail view in future
          }
        }}
      >
        {/* Day Name */}
        <div className={cn("text-center mb-2", getTextColor(day.status))}>
          <div className="text-xs font-medium opacity-90">
            {day.dayName}
          </div>
          <div className="text-lg font-bold">
            {formatDate(day.date)}
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-3">
          <span className={cn(
            "inline-block px-2 py-1 rounded-full text-xs font-medium",
            "bg-white/20 backdrop-blur-sm",
            getTextColor(day.status)
          )}>
            {getStatusText(day.status)}
          </span>
        </div>

        {/* Session Indicators */}
        {day.sessions.length > 0 && (
          <div className="flex justify-center gap-1">
            {day.sessions.map((session, index) => (
              <SessionDot 
                key={`${session.period}-${index}`} 
                session={session} 
              />
            ))}
          </div>
        )}
      </motion.article>
    </StaggerItem>
  );
}

/**
 * Session dot indicator component
 */
function SessionDot({ session }: { session: { period: number; courseName: string; status: string } }) {
  const getSessionColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-400';
      case 'absent':
        return 'bg-red-400';
      case 'sick':
        return 'bg-amber-400';
      case 'leave':
        return 'bg-cyan-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        getSessionColor(session.status)
      )}
      title={`${session.courseName} - جلسه ${session.period}`}
    />
  );
}