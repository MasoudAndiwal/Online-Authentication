'use client'

import * as React from 'react'
import { ClassOverviewCard } from './class-overview-card'
import { TeacherInformationCard } from './teacher-information-card'
import { AttendancePolicyCard } from './attendance-policy-card'

interface ClassSchedule {
  day: string
  startTime: string
  endTime: string
  room: string
  sessionType: 'lecture' | 'lab' | 'tutorial'
}

interface ClassInformationSectionProps {
  // Class data
  className: string
  classCode: string
  semester: number
  academicYear: string
  credits: number
  room: string
  building: string
  schedule: ClassSchedule[]
  
  // Teacher data
  teacherName: string
  teacherTitle?: string
  teacherEmail: string
  officeHours: string
  officeLocation: string
  teacherAvatar?: string
  
  // Policy data
  maxAbsences: number
  mahroomThreshold: number
  tasdiqThreshold: number
  
  // Callbacks
  onContactTeacher: () => void
}

/**
 * Class Information Section Component
 * Combines all class information cards with responsive layout
 * Stack cards vertically on mobile
 * Two-column layout on tablet
 * Multi-column layout on desktop
 * Ensures schedule grid is readable on all screen sizes
 * Validates: Requirements 7.1
 */
export function ClassInformationSection({
  className,
  classCode,
  semester,
  academicYear,
  credits,
  room,
  building,
  schedule,
  teacherName,
  teacherTitle,
  teacherEmail,
  officeHours,
  officeLocation,
  teacherAvatar,
  maxAbsences,
  mahroomThreshold,
  tasdiqThreshold,
  onContactTeacher
}: ClassInformationSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mobile: Stack all cards vertically (< 768px) */}
      {/* Tablet: Two-column layout (768px - 1023px) */}
      {/* Desktop: Multi-column layout (>= 1024px) */}
      
      {/* Class Overview - Full width on all screens */}
      <div className="w-full">
        <ClassOverviewCard
          className={className}
          classCode={classCode}
          semester={semester}
          academicYear={academicYear}
          credits={credits}
          room={room}
          building={building}
          schedule={schedule}
        />
      </div>

      {/* Teacher Info and Policy - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Teacher Information Card */}
        <TeacherInformationCard
          teacherName={teacherName}
          teacherTitle={teacherTitle}
          email={teacherEmail}
          officeHours={officeHours}
          officeLocation={officeLocation}
          avatar={teacherAvatar}
          onContactTeacher={onContactTeacher}
        />

        {/* Attendance Policy Card */}
        <AttendancePolicyCard
          maxAbsences={maxAbsences}
          mahroomThreshold={mahroomThreshold}
          tasdiqThreshold={tasdiqThreshold}
        />
      </div>
    </div>
  )
}
