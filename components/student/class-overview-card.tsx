'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, Clock } from 'lucide-react'

interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
  room: string
  sessionType: 'lecture' | 'lab' | 'tutorial'
}

interface ClassOverviewCardProps {
  className: string
  classCode: string
  semester: number
  academicYear: string
  credits: number
  room: string
  building: string
  schedule: ClassSchedule[]
  major?: string
  studentCount?: number
  session?: string
}

/**
 * Class Overview Card Component
 * Displays class details including name, code, semester, year, credits
 * Shows room and building location
 * Creates weekly schedule grid
 * Styled with glass morphism and green accents
 * Validates: Requirements 5.1, 5.3
 */
export function ClassOverviewCard({
  className,
  classCode,
  semester,
  academicYear,
  credits,
  room,
  building,
  schedule,
  major,
  studentCount,
  session
}: ClassOverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
            Class Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 lg:p-6 space-y-6">
          {/* Class Information */}
          <div className="space-y-4">
            {/* Class Name and Code */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 sm:p-5">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700 mb-1">
                {className}
              </h3>
              <p className="text-sm sm:text-base text-emerald-600 font-medium">
                {classCode}
              </p>
            </div>

            {/* Academic Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Semester */}
              <InfoItem
                icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Semester"
                value={`Semester ${semester}`}
              />

              {/* Academic Year */}
              <InfoItem
                icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Academic Year"
                value={academicYear}
              />

              {/* Session */}
              {session && (
                <InfoItem
                  icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Session"
                  value={session}
                />
              )}

              {/* Major */}
              {major && (
                <InfoItem
                  icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Major"
                  value={major}
                />
              )}

              {/* Student Count */}
              {studentCount !== undefined && (
                <InfoItem
                  icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Students Enrolled"
                  value={`${studentCount} Students`}
                />
              )}
            </div>
          </div>

          {/* Weekly Schedule */}
          {schedule && schedule.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-base sm:text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                Weekly Schedule
              </h4>

              {/* Schedule Grid - Responsive */}
              <div className="space-y-2 sm:space-y-3">
                {schedule.map((session, index) => (
                  <ScheduleItem key={index} session={session} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-0 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-emerald-600">
          {icon}
        </div>
        <span className="text-xs sm:text-sm text-slate-600 font-medium">
          {label}
        </span>
      </div>
      <p className="text-sm sm:text-base font-semibold text-slate-800 ml-6 sm:ml-7">
        {value}
      </p>
    </div>
  )
}

interface ScheduleItemProps {
  session: ClassSchedule
}

function ScheduleItem({ session }: ScheduleItemProps) {
  const sessionTypeColors = {
    lecture: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200'
    },
    lab: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    tutorial: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    }
  }

  const colors = sessionTypeColors[session.sessionType]

  return (
    <div className={`${colors.bg} rounded-lg p-3 sm:p-4 border-0 shadow-sm`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        {/* Day */}
        <div className={`${colors.bg} ${colors.text} px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold border-0 shadow-sm`}>
          {session.day}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="font-medium">
            {session.startTime} - {session.endTime}
          </span>
        </div>
      </div>
    </div>
  )
}
