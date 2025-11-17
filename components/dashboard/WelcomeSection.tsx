'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Student } from '@/types/types';

interface WelcomeSectionProps {
  student: Student;
  currentTime: string;
}

export function WelcomeSection({ student, currentTime }: WelcomeSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <motion.section
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-blue-500 to-blue-600 border-0 shadow-lg rounded-2xl p-6 md:p-8 lg:p-10"
      aria-label="قسم الترحيب"
    >
      {/* Decorative animated shapes */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={shouldReduceMotion ? { duration: 0 } : {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={shouldReduceMotion ? { duration: 0 } : {
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/10 rounded-full blur-xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            {getGreeting()}
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {student.name}
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4, duration: 0.4 }}
          className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/90"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm sm:text-base" aria-label={`رقم الطالب: ${student.studentNumber}`}>{student.studentNumber}</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time className="text-sm sm:text-base" dateTime={new Date().toISOString()}>{currentTime}</time>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
