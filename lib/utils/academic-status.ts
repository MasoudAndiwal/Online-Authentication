import { AcademicStatus } from '@/components/student/academic-standing-alerts'

export interface AttendanceData {
  attendanceRate: number
  absentHours: number
  totalHours: number
  presentHours: number
  sickHours: number
  leaveHours: number
}

export interface AcademicStatusResult {
  status: AcademicStatus
  remainingAbsences: number
  remainingAbsencesBeforeTasdiq: number
  remainingAbsencesBeforeMahroom: number
  message: string
}

/**
 * Calculate academic status based on attendance data
 * 
 * Status determination:
 * - good-standing: attendance >= 90%
 * - warning: 85% <= attendance < 90%
 * - tasdiq: 75% <= attendance < 85% (Certification Required)
 * - mahroom: attendance < 75% (Disqualified)
 * 
 * @param attendanceData - Student's attendance data
 * @param mahroomThreshold - Minimum attendance percentage to avoid disqualification (default: 75%)
 * @param tasdiqThreshold - Minimum attendance percentage to avoid certification requirement (default: 85%)
 * @returns Academic status result with remaining absences and message
 */
export function calculateAcademicStatus(
  attendanceData: AttendanceData,
  mahroomThreshold: number = 75,
  tasdiqThreshold: number = 85
): AcademicStatusResult {
  const { attendanceRate, absentHours, totalHours } = attendanceData

  // Calculate maximum allowable absences for each threshold
  const maxAbsencesForMahroom = totalHours > 0 
    ? Math.floor(totalHours * (1 - mahroomThreshold / 100))
    : 0
  
  const maxAbsencesForTasdiq = totalHours > 0
    ? Math.floor(totalHours * (1 - tasdiqThreshold / 100))
    : 0

  // Calculate remaining absences
  const remainingAbsencesBeforeMahroom = Math.max(0, maxAbsencesForMahroom - absentHours)
  const remainingAbsencesBeforeTasdiq = Math.max(0, maxAbsencesForTasdiq - absentHours)

  // Determine status based on attendance rate
  let status: AcademicStatus
  let message: string
  let remainingAbsences: number

  if (attendanceRate < mahroomThreshold) {
    status = 'mahroom'
    remainingAbsences = 0
    message = `Critical: You have exceeded the maximum allowed absences. Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below the required ${mahroomThreshold}%.`
  } else if (attendanceRate < tasdiqThreshold) {
    status = 'tasdiq'
    remainingAbsences = remainingAbsencesBeforeMahroom
    message = `Warning: Your attendance rate is ${attendanceRate.toFixed(1)}%, which is below ${tasdiqThreshold}%. You need to submit medical certificates.`
  } else if (attendanceRate < 90) {
    status = 'warning'
    remainingAbsences = remainingAbsencesBeforeTasdiq
    message = `Caution: Your attendance rate is ${attendanceRate.toFixed(1)}%. You have ${remainingAbsencesBeforeTasdiq} absence(s) remaining before requiring certification.`
  } else {
    status = 'good-standing'
    remainingAbsences = remainingAbsencesBeforeTasdiq
    message = `Excellent: Your attendance rate is ${attendanceRate.toFixed(1)}%. You're in good standing!`
  }

  return {
    status,
    remainingAbsences,
    remainingAbsencesBeforeTasdiq,
    remainingAbsencesBeforeMahroom,
    message
  }
}

/**
 * Get a user-friendly explanation for the academic status
 * 
 * @param status - The academic status
 * @returns A detailed explanation in English with Arabic terms
 */
export function getStatusExplanation(status: AcademicStatus): string {
  switch (status) {
    case 'good-standing':
      return 'You are in good standing with excellent attendance. Keep up the great work!'
    
    case 'warning':
      return 'Your attendance needs attention. Please maintain good attendance to avoid complications.'
    
    case 'mahroom':
      return 'محروم (Mahroom) means "Disqualified" - you have exceeded the maximum allowed absences and are not eligible for final exams. Contact your teacher immediately.'
    
    case 'tasdiq':
      return 'تصدیق طلب (Tasdiq Talab) means "Certification Required" - you need to submit medical certificates to restore your exam eligibility.'
    
    default:
      return 'Status unknown. Please contact your teacher for clarification.'
  }
}

/**
 * Determine if the status requires immediate action
 * 
 * @param status - The academic status
 * @returns True if immediate action is required
 */
export function requiresImmediateAction(status: AcademicStatus): boolean {
  return status === 'mahroom' || status === 'tasdiq'
}

/**
 * Get the appropriate action message for the status
 * 
 * @param status - The academic status
 * @returns Action message for the student
 */
export function getActionMessage(status: AcademicStatus): string {
  switch (status) {
    case 'good-standing':
      return 'Continue maintaining excellent attendance!'
    
    case 'warning':
      return 'Monitor your attendance closely and avoid unnecessary absences.'
    
    case 'mahroom':
      return 'Contact your teacher or office immediately to discuss your options.'
    
    case 'tasdiq':
      return 'Upload medical certificates as soon as possible to restore eligibility.'
    
    default:
      return 'Contact your teacher if you have questions about your status.'
  }
}
