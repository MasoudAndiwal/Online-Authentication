'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, BarChart3, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/lib/hooks/use-responsive'
import { useHapticFeedback } from '@/lib/hooks/use-touch-gestures'

// Import our progress tracking components
import { StudentProgressGrid, type StudentProgressData } from './student-progress-card'
import { ProgressCharts, type WeeklyAttendanceData, type MonthlyAttendanceData } from './progress-charts'
import { RiskAssessment, type RiskAssessmentData } from './risk-assessment'

// Main section view types
type ProgressView = 'overview' | 'charts' | 'risk-assessment'

interface StudentProgressSectionProps {
  classId?: string
  className?: string
}

// Mock data generators for demonstration
const generateMockStudentData = (): StudentProgressData[] => {
  const students = [
    { name: 'Ahmad Hassan', id: 'STU001', risk: 'high', rate: 72 },
    { name: 'Fatima Ali', id: 'STU002', risk: 'low', rate: 95 },
    { name: 'Omar Khalil', id: 'STU003', risk: 'medium', rate: 83 },
    { name: 'Layla Ahmed', id: 'STU004', risk: 'low', rate: 91 },
    { name: 'Yusuf Ibrahim', id: 'STU005', risk: 'critical', rate: 65 },
    { name: 'Aisha Mohammad', id: 'STU006', risk: 'medium', rate: 78 },
  ]

  return students.map((student, index) => ({
    id: student.id,
    name: student.name,
    studentId: student.id,
    email: `${student.name.toLowerCase().replace(' ', '.')}@university.edu`,
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    attendanceRate: student.rate,
    presentHours: Math.floor((student.rate / 100) * 120),
    absentHours: Math.floor(((100 - student.rate) / 100) * 120),
    sickHours: Math.floor(Math.random() * 10),
    leaveHours: Math.floor(Math.random() * 5),
    totalHours: 120,
    isAtRisk: student.risk !== 'low',
    riskType: student.rate < 70 ? 'محروم' : student.rate < 80 ? 'تصدیق طلب' : undefined,
    riskLevel: student.risk as 'low' | 'medium' | 'high' | 'critical',
    remainingAllowableAbsences: Math.max(0, Math.floor((75 - (100 - student.rate)) / 2)),
    lastAttendanceDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    attendanceHistory: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      status: Math.random() > 0.2 ? 'PRESENT' : Math.random() > 0.5 ? 'ABSENT' : 'SICK' as const,
      subject: 'Computer Science',
      period: Math.floor(Math.random() * 6) + 1
    }))
  }))
}

const generateMockWeeklyData = (): WeeklyAttendanceData[] => {
  return Array.from({ length: 8 }, (_, weekIndex) => {
    const weekStart = new Date(Date.now() - (weekIndex * 7 + 7) * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    
    const days = Array.from({ length: 5 }, (_, dayIndex) => {
      const date = new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000)
      const total = 30
      const present = Math.floor(total * (0.8 + Math.random() * 0.15))
      const sick = Math.floor(Math.random() * 3)
      const leave = Math.floor(Math.random() * 2)
      const absent = total - present - sick - leave
      
      return {
        date,
        present,
        absent,
        sick,
        leave,
        total,
        attendanceRate: (present / total) * 100
      }
    })
    
    const weeklyRate = days.reduce((sum, day) => sum + day.attendanceRate, 0) / days.length
    const prevWeekRate = weekIndex > 0 ? 85 + Math.random() * 10 : weeklyRate
    const trendPercentage = Math.abs(weeklyRate - prevWeekRate)
    
    return {
      weekStart,
      weekEnd,
      days,
      weeklyRate,
      trend: weeklyRate > prevWeekRate + 1 ? 'up' : weeklyRate < prevWeekRate - 1 ? 'down' : 'stable',
      trendPercentage
    }
  }).reverse()
}

const generateMockMonthlyData = (): MonthlyAttendanceData[] => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June']
  
  return months.map((month, index) => ({
    month,
    year: 2024,
    weeks: generateMockWeeklyData().slice(0, 4),
    monthlyRate: 80 + Math.random() * 15,
    totalClasses: 80,
    totalPresent: Math.floor(80 * (0.8 + Math.random() * 0.15)),
    totalAbsent: Math.floor(80 * (0.05 + Math.random() * 0.15))
  }))
}

const generateMockRiskData = (studentData: StudentProgressData[]): RiskAssessmentData[] => {
  return studentData.map(student => ({
    studentId: student.id,
    studentName: student.name,
    studentAvatar: student.avatar,
    currentAttendanceRate: student.attendanceRate,
    totalHours: student.totalHours,
    absentHours: student.absentHours,
    sickHours: student.sickHours,
    leaveHours: student.leaveHours,
    riskLevel: student.riskLevel,
    riskType: student.riskType,
    remainingAllowableAbsences: student.remainingAllowableAbsences || 0,
    daysUntilRisk: Math.max(1, Math.floor(Math.random() * 30)),
    recentTrend: student.attendanceRate > 85 ? 'improving' : student.attendanceRate < 75 ? 'declining' : 'stable',
    consecutiveAbsences: student.riskLevel === 'critical' ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 3),
    lastAttendanceDate: student.lastAttendanceDate || new Date(),
    concerningPatterns: student.riskLevel !== 'low' ? [
      'Frequent Monday absences',
      'Declining trend over past 3 weeks'
    ].slice(0, Math.floor(Math.random() * 2) + 1) : [],
    recommendations: [
      {
        id: '1',
        type: 'contact',
        priority: student.riskLevel === 'critical' ? 'high' : 'medium',
        title: 'Contact student directly',
        description: 'Reach out to understand attendance challenges',
        actionRequired: true,
        completed: false
      },
      {
        id: '2',
        type: 'monitoring',
        priority: 'medium',
        title: 'Increase monitoring frequency',
        description: 'Check attendance daily for next two weeks',
        actionRequired: true,
        completed: false
      }
    ],
    alertLevel: student.riskLevel === 'critical' ? 'urgent' : student.riskLevel === 'high' ? 'warning' : 'watch'
  }))
}

export function StudentProgressSection({ classId, className }: StudentProgressSectionProps) {
  const [activeView, setActiveView] = React.useState<ProgressView>('overview')
  const [selectedPeriod, setSelectedPeriod] = React.useState<'week' | 'month'>('week')
  
  // Responsive and touch support
  const { isMobile, isTouch } = useResponsive()
  const { lightTap } = useHapticFeedback()
  
  // Mock data - in real implementation, this would come from props or API calls
  const studentData = React.useMemo(() => generateMockStudentData(), [])
  const weeklyData = React.useMemo(() => generateMockWeeklyData(), [])
  const monthlyData = React.useMemo(() => generateMockMonthlyData(), [])
  const riskData = React.useMemo(() => generateMockRiskData(studentData), [studentData])

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    const totalStudents = studentData.length
    const atRiskStudents = studentData.filter(s => s.isAtRisk).length
    const averageAttendance = studentData.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents
    const criticalRisk = riskData.filter(s => s.riskLevel === 'critical').length
    
    return {
      totalStudents,
      atRiskStudents,
      averageAttendance,
      criticalRisk
    }
  }, [studentData, riskData])

  const handleViewDetails = (_studentId: string) => {
    // In real implementation, this would navigate to detailed student view
  }

  const handleContactStudent = (_studentId: string) => {
    // In real implementation, this would open contact modal or initiate communication
  }

  const handleMarkRecommendationComplete = (_studentId: string, _recommendationId: string) => {
    // In real implementation, this would update the recommendation status
  }

  const handleCreateAlert = (_studentId: string, _alertType: string) => {
    // In real implementation, this would create a system alert
  }

  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* Section Header with Navigation - Mobile Responsive */}
      <Card className="rounded-xl sm:rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                Student Progress Tracking
              </CardTitle>
              <p className="text-sm sm:text-base text-slate-600 mt-1">
                Monitor attendance patterns, identify at-risk students, and track progress trends
              </p>
            </div>

            {/* View Navigation - Mobile Responsive */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              <Button
                variant={activeView === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveView('overview');
                  if (isTouch) lightTap();
                }}
                className={cn(
                  "min-h-[44px] touch-manipulation flex-shrink-0",
                  activeView === 'overview' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                )}
              >
                <Users className="w-4 h-4 sm:mr-1" />
                <span className="hidden xs:inline ml-1">Overview</span>
              </Button>
              <Button
                variant={activeView === 'charts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveView('charts');
                  if (isTouch) lightTap();
                }}
                className={cn(
                  "min-h-[44px] touch-manipulation flex-shrink-0",
                  activeView === 'charts' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                )}
              >
                <BarChart3 className="w-4 h-4 sm:mr-1" />
                <span className="hidden xs:inline ml-1">Analytics</span>
              </Button>
              <Button
                variant={activeView === 'risk-assessment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveView('risk-assessment');
                  if (isTouch) lightTap();
                }}
                className={cn(
                  "min-h-[44px] touch-manipulation flex-shrink-0",
                  activeView === 'risk-assessment' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                )}
              >
                <AlertTriangle className="w-4 h-4 sm:mr-1" />
                <span className="hidden xs:inline ml-1">Risk</span>
              </Button>
            </div>
          </div>

          {/* Summary Statistics - Mobile Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <motion.div
              className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                    {summaryStats.totalStudents}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 truncate">Total Students</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {Math.round(summaryStats.averageAttendance)}%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 truncate">Avg Attendance</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                    {summaryStats.atRiskStudents}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 truncate">At Risk</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
                    {summaryStats.criticalRisk}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-600 truncate">Critical Risk</div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardHeader>
      </Card>

      {/* Content based on active view */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'overview' && (
          <StudentProgressGrid
            students={studentData}
            onViewDetails={handleViewDetails}
            onContactStudent={handleContactStudent}
          />
        )}

        {activeView === 'charts' && (
          <ProgressCharts
            weeklyData={weeklyData}
            monthlyData={monthlyData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        )}

        {activeView === 'risk-assessment' && (
          <RiskAssessment
            riskData={riskData}
            onContactStudent={handleContactStudent}
            onMarkRecommendationComplete={handleMarkRecommendationComplete}
            onCreateAlert={handleCreateAlert}
          />
        )}
      </motion.div>
    </div>
  )
}