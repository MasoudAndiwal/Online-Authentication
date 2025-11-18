'use client'

import * as React from 'react'
import { AcademicStandingAlerts } from './academic-standing-alerts'
import { 
  calculateAcademicStatus, 
  type AttendanceData 
} from '@/lib/utils/academic-status'

interface AcademicStandingSectionProps {
  attendanceData: AttendanceData
  mahroomThreshold?: number
  tasdiqThreshold?: number
  onContactTeacher?: () => void
  onUploadDocumentation?: () => void
  onViewPolicy?: () => void
  className?: string
}

/**
 * Academic Standing Section Component
 * 
 * Smart wrapper component that:
 * 1. Calculates academic status based on attendance data
 * 2. Determines remaining absences before reaching thresholds
 * 3. Displays the appropriate alert card with correct styling and actions
 * 4. Provides clear explanations in English with Arabic terms
 * 
 * This component handles all the logic for determining which alert to show,
 * making it easy to integrate into the student dashboard.
 * 
 * Usage:
 * ```tsx
 * <AcademicStandingSection
 *   attendanceData={{
 *     attendanceRate: 88.5,
 *     absentHours: 12,
 *     totalHours: 100,
 *     presentHours: 88,
 *     sickHours: 0,
 *     leaveHours: 0
 *   }}
 *   onContactTeacher={() => router.push('/student/messages')}
 *   onUploadDocumentation={() => router.push('/student/upload')}
 *   onViewPolicy={() => router.push('/student/help')}
 * />
 * ```
 */
export function AcademicStandingSection({
  attendanceData,
  mahroomThreshold = 75,
  tasdiqThreshold = 85,
  onContactTeacher,
  onUploadDocumentation,
  onViewPolicy,
  className = ''
}: AcademicStandingSectionProps) {
  
  // Calculate academic status based on attendance data
  const statusResult = React.useMemo(() => {
    return calculateAcademicStatus(
      attendanceData,
      mahroomThreshold,
      tasdiqThreshold
    )
  }, [attendanceData, mahroomThreshold, tasdiqThreshold])

  return (
    <AcademicStandingAlerts
      status={statusResult.status}
      attendanceRate={attendanceData.attendanceRate}
      remainingAbsences={statusResult.remainingAbsences}
      mahroomThreshold={mahroomThreshold}
      tasdiqThreshold={tasdiqThreshold}
      onContactTeacher={onContactTeacher}
      onUploadDocumentation={onUploadDocumentation}
      onViewPolicy={onViewPolicy}
      className={className}
    />
  )
}
