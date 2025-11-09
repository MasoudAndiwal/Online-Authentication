'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, User, AlertTriangle, CheckCircle, Clock, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressIndicator } from '@/components/ui/progress-indicator'
import { cn } from '@/lib/utils'

// Types for student progress data
export interface StudentProgressData {
  id: string
  name: string
  studentId: string
  email?: string
  phone?: string
  avatar?: string
  attendanceRate: number
  presentHours: number
  absentHours: number
  sickHours: number
  leaveHours: number
  totalHours: number
  isAtRisk: boolean
  riskType?: 'محروم' | 'تصدیق طلب'
  riskLevel: 'low' | 'medium' | 'high'
  remainingAllowableAbsences?: number
  lastAttendanceDate?: Date
  attendanceHistory: AttendanceHistoryEntry[]
}

export interface AttendanceHistoryEntry {
  date: Date
  status: 'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE'
  subject?: string
  period?: number
}

interface StudentProgressCardProps {
  student: StudentProgressData
  onViewDetails?: (studentId: string) => void
  onContactStudent?: (studentId: string) => void
  className?: string
}

export function StudentProgressCard({
  student,
  onViewDetails,
  onContactStudent,
  className
}: StudentProgressCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Calculate status breakdown percentages
  const statusBreakdown = React.useMemo(() => {
    const total = student.totalHours || 1 // Avoid division by zero
    return {
      present: (student.presentHours / total) * 100,
      absent: (student.absentHours / total) * 100,
      sick: (student.sickHours / total) * 100,
      leave: (student.leaveHours / total) * 100
    }
  }, [student])

  // Determine status indicator ring color
  const getStatusRingColor = () => {
    if (student.riskLevel === 'high') return 'ring-red-500'
    if (student.riskLevel === 'medium') return 'ring-orange-500'
    return 'ring-green-500'
  }

  // Get risk badge configuration
  const getRiskBadgeConfig = () => {
    if (student.riskType === 'محروم') {
      return {
        label: 'محروم',
        className: 'bg-red-50 text-red-700 border-0 shadow-sm animate-pulse'
      }
    }
    if (student.riskType === 'تصدیق طلب') {
      return {
        label: 'تصدیق طلب',
        className: 'bg-orange-100 text-orange-700 border-0 shadow-sm'
      }
    }
    return {
      label: 'Good Standing',
      className: 'bg-green-50 text-green-700 border-0 shadow-sm'
    }
  }

  const riskBadge = getRiskBadgeConfig()

  return (
    <Card className={cn(
      'rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50',
      'hover:scale-[1.02] hover:shadow-xl transition-all duration-300',
      'overflow-hidden',
      className
    )}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          {/* Student Avatar and Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={cn(
                'h-16 w-16 ring-4 ring-offset-2 ring-offset-white transition-all duration-300',
                getStatusRingColor()
              )}>
                <AvatarImage src={student.avatar} alt={student.name} />
                <AvatarFallback className="bg-orange-600 text-white text-lg font-semibold">
                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              {/* Status indicator dot */}
              <div className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white',
                student.riskLevel === 'high' ? 'bg-red-500' :
                student.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {student.name}
              </h3>
              <p className="text-sm text-slate-600">
                ID: {student.studentId}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={riskBadge.className}>
                  {riskBadge.label}
                </Badge>
                {student.isAtRisk && (
                  <Badge className="bg-yellow-50 text-yellow-700 border-0 shadow-sm">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    At Risk
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="text-right">
            <motion.div
              className="text-3xl font-bold text-orange-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.round(student.attendanceRate)}%
            </motion.div>
            <p className="text-sm text-slate-600">Attendance Rate</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        {/* Progress Bars */}
        <div className="space-y-3 mb-4">
          <ProgressIndicator
            percentage={statusBreakdown.present}
            label="Present"
            color="green"
            animated={true}
            size="sm"
          />
          <ProgressIndicator
            percentage={statusBreakdown.absent}
            label="Absent"
            color="red"
            animated={true}
            size="sm"
          />
          {statusBreakdown.sick > 0 && (
            <ProgressIndicator
              percentage={statusBreakdown.sick}
              label="Sick"
              color="yellow"
              animated={true}
              size="sm"
            />
          )}
          {statusBreakdown.leave > 0 && (
            <ProgressIndicator
              percentage={statusBreakdown.leave}
              label="Leave"
              color="purple"
              animated={true}
              size="sm"
            />
          )}
        </div>

        {/* Risk Information */}
        {student.isAtRisk && student.remainingAllowableAbsences !== undefined && (
          <motion.div
            className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {student.remainingAllowableAbsences} absences remaining before {student.riskType}
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(student.id)}
                className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm"
              >
                View Details
              </Button>
            )}
            {onContactStudent && student.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onContactStudent(student.id)}
                className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 shadow-sm"
              >
                <Phone className="w-3 h-3 mr-1" />
                Contact
              </Button>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:bg-orange-50"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                More
              </>
            )}
          </Button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-orange-200">
                {/* Detailed Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {student.presentHours}
                    </div>
                    <div className="text-sm text-slate-600">Present Hours</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-600">
                      {student.absentHours}
                    </div>
                    <div className="text-sm text-slate-600">Absent Hours</div>
                  </div>
                </div>

                {/* Contact Information */}
                {(student.email || student.phone) && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-slate-700">Contact Information</h4>
                    {student.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </div>
                    )}
                  </div>
                )}

                {/* Last Attendance */}
                {student.lastAttendanceDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    Last attendance: {student.lastAttendanceDate.toLocaleDateString()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// Grid component for displaying multiple student progress cards
interface StudentProgressGridProps {
  students: StudentProgressData[]
  onViewDetails?: (studentId: string) => void
  onContactStudent?: (studentId: string) => void
  className?: string
}

export function StudentProgressGrid({
  students,
  onViewDetails,
  onContactStudent,
  className
}: StudentProgressGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      className
    )}>
      {students.map((student, index) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StudentProgressCard
            student={student}
            onViewDetails={onViewDetails}
            onContactStudent={onContactStudent}
          />
        </motion.div>
      ))}
    </div>
  )
}