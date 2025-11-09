'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingDown, 
  Phone, 
  Mail, 
  MessageSquare,
  Bell,
  BellRing,
  User,
  Calendar,
  Target,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Types for risk assessment
export interface RiskAssessmentData {
  studentId: string
  studentName: string
  studentAvatar?: string
  currentAttendanceRate: number
  totalHours: number
  absentHours: number
  sickHours: number
  leaveHours: number
  
  // Risk calculations
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskType?: 'محروم' | 'تصدیق طلب'
  remainingAllowableAbsences: number
  daysUntilRisk: number
  
  // Patterns and trends
  recentTrend: 'improving' | 'declining' | 'stable'
  consecutiveAbsences: number
  lastAttendanceDate: Date
  concerningPatterns: string[]
  
  // Recommendations
  recommendations: Recommendation[]
  alertLevel: 'none' | 'watch' | 'warning' | 'urgent'
}

export interface Recommendation {
  id: string
  type: 'contact' | 'intervention' | 'monitoring' | 'administrative'
  priority: 'low' | 'medium' | 'high'
  title: string
  description: string
  actionRequired: boolean
  dueDate?: Date
  completed: boolean
}

export interface AlertPattern {
  type: 'consecutive_absences' | 'declining_trend' | 'threshold_approaching' | 'irregular_pattern'
  severity: 'low' | 'medium' | 'high'
  description: string
  detectedDate: Date
  isActive: boolean
}

interface RiskAssessmentProps {
  riskData: RiskAssessmentData[]
  onContactStudent?: (studentId: string) => void
  onMarkRecommendationComplete?: (studentId: string, recommendationId: string) => void
  onCreateAlert?: (studentId: string, alertType: string) => void
  className?: string
}

export function RiskAssessment({
  riskData,
  onContactStudent,
  onMarkRecommendationComplete,
  onCreateAlert,
  className
}: RiskAssessmentProps) {
  const [selectedStudent, setSelectedStudent] = React.useState<RiskAssessmentData | null>(null)
  const [filterLevel, setFilterLevel] = React.useState<'all' | 'medium' | 'high' | 'critical'>('all')

  // Filter students based on risk level
  const filteredStudents = React.useMemo(() => {
    if (filterLevel === 'all') return riskData
    return riskData.filter(student => student.riskLevel === filterLevel)
  }, [riskData, filterLevel])

  // Sort students by risk level and urgency
  const sortedStudents = React.useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aRisk = riskOrder[a.riskLevel]
      const bRisk = riskOrder[b.riskLevel]
      
      if (aRisk !== bRisk) return bRisk - aRisk
      return a.daysUntilRisk - b.daysUntilRisk
    })
  }, [filteredStudents])

  // Get risk level configuration
  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: AlertTriangle,
          label: 'Critical Risk',
          description: 'Immediate action required'
        }
      case 'high':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: AlertCircle,
          label: 'High Risk',
          description: 'Close monitoring needed'
        }
      case 'medium':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Clock,
          label: 'Medium Risk',
          description: 'Watch for patterns'
        }
      default:
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircle,
          label: 'Low Risk',
          description: 'Good standing'
        }
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Risk Overview and Filters */}
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Risk Assessment & Recommendations
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Monitor student attendance patterns and receive actionable recommendations
              </p>
            </div>
            
            {/* Risk Level Filters */}
            <div className="flex gap-2">
              {(['all', 'medium', 'high', 'critical'] as const).map((level) => (
                <Button
                  key={level}
                  variant={filterLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel(level)}
                  className={filterLevel === level 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-0'
                  }
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                  {level !== 'all' && (
                    <Badge className="ml-2 bg-white/20 text-current border-0">
                      {riskData.filter(s => s.riskLevel === level).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
              const count = riskData.filter(s => s.riskLevel === level).length
              const config = getRiskConfig(level)
              const Icon = config.icon
              
              return (
                <motion.div
                  key={level}
                  className={cn(
                    'p-4 rounded-xl border-2',
                    config.bgColor,
                    config.borderColor
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5', config.color)} />
                    <div>
                      <div className={cn('text-2xl font-bold', config.color)}>
                        {count}
                      </div>
                      <div className="text-sm text-slate-600">
                        {config.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardHeader>
      </Card>

      {/* Student Risk Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedStudents.map((student, index) => {
          const config = getRiskConfig(student.riskLevel)
          const Icon = config.icon
          
          return (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                'rounded-2xl shadow-lg border-2 transition-all duration-300',
                config.bgColor,
                config.borderColor,
                'hover:shadow-xl hover:scale-[1.02]'
              )}>
                <CardHeader className="p-5">
                  <div className="flex items-start justify-between">
                    {/* Student Info */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white ring-offset-2">
                        <AvatarImage src={student.studentAvatar} alt={student.studentName} />
                        <AvatarFallback className="bg-orange-600 text-white font-semibold">
                          {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {student.studentName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn(
                            'border-0 shadow-sm',
                            config.bgColor.replace('50', '100'),
                            config.color
                          )}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          {student.riskType && (
                            <Badge className="bg-red-100 text-red-700 border-0 shadow-sm animate-pulse">
                              {student.riskType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Rate */}
                    <div className="text-right">
                      <div className={cn(
                        'text-2xl font-bold',
                        student.currentAttendanceRate >= 90 ? 'text-green-600' :
                        student.currentAttendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'
                      )}>
                        {Math.round(student.currentAttendanceRate)}%
                      </div>
                      <p className="text-sm text-slate-600">Attendance</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  {/* Risk Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Remaining absences:</span>
                      <span className={cn(
                        'font-semibold',
                        student.remainingAllowableAbsences <= 2 ? 'text-red-600' :
                        student.remainingAllowableAbsences <= 5 ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {student.remainingAllowableAbsences}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Days until risk:</span>
                      <span className={cn(
                        'font-semibold',
                        student.daysUntilRisk <= 7 ? 'text-red-600' :
                        student.daysUntilRisk <= 14 ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {student.daysUntilRisk} days
                      </span>
                    </div>

                    {student.consecutiveAbsences > 0 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span>{student.consecutiveAbsences} consecutive absences</span>
                      </div>
                    )}
                  </div>

                  {/* Concerning Patterns */}
                  {student.concerningPatterns.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Concerning Patterns:</h4>
                      <div className="space-y-1">
                        {student.concerningPatterns.map((pattern, patternIndex) => (
                          <div key={patternIndex} className="flex items-center gap-2 text-sm text-orange-700">
                            <AlertCircle className="w-3 h-3" />
                            <span>{pattern}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Recommendations ({student.recommendations.filter(r => !r.completed).length} pending):
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {student.recommendations.slice(0, 3).map((rec) => (
                        <div
                          key={rec.id}
                          className={cn(
                            'p-2 rounded-lg text-sm',
                            rec.completed ? 'bg-green-50 text-green-700' : 'bg-white/60'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{rec.title}</div>
                              <div className="text-xs text-slate-600 mt-1">{rec.description}</div>
                            </div>
                            {!rec.completed && onMarkRecommendationComplete && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onMarkRecommendationComplete(student.studentId, rec.id)}
                                className="text-xs h-6 px-2"
                              >
                                Mark Done
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {onContactStudent && (
                      <Button
                        size="sm"
                        onClick={() => onContactStudent(student.studentId)}
                        className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0 shadow-sm"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Contact
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedStudent(student)}
                      className="bg-white/60 hover:bg-white border-0 shadow-sm"
                    >
                      View Details
                    </Button>

                    {student.riskLevel === 'critical' && onCreateAlert && (
                      <Button
                        size="sm"
                        onClick={() => onCreateAlert(student.studentId, 'urgent_intervention')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <BellRing className="w-3 h-3 mr-1" />
                        Alert
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed Student Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedStudent.studentAvatar} alt={selectedStudent.studentName} />
                      <AvatarFallback className="bg-orange-600 text-white text-lg font-semibold">
                        {selectedStudent.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedStudent.studentName}
                      </h2>
                      <p className="text-slate-600">Detailed Risk Assessment</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedStudent(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </Button>
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900">
                      {selectedStudent.totalHours}
                    </div>
                    <div className="text-sm text-slate-600">Total Hours</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedStudent.absentHours}
                    </div>
                    <div className="text-sm text-slate-600">Absent Hours</div>
                  </div>
                </div>

                {/* All Recommendations */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    All Recommendations
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={cn(
                          'p-4 rounded-lg border',
                          rec.completed 
                            ? 'bg-green-50 border-green-200' 
                            : rec.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : rec.priority === 'medium'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-slate-50 border-slate-200'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{rec.title}</h4>
                              <Badge className={cn(
                                'text-xs border-0',
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-slate-100 text-slate-700'
                              )}>
                                {rec.priority} priority
                              </Badge>
                              {rec.completed && (
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                            {rec.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar className="w-3 h-3" />
                                Due: {rec.dueDate.toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          {!rec.completed && onMarkRecommendationComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                onMarkRecommendationComplete(selectedStudent.studentId, rec.id)
                                setSelectedStudent(null)
                              }}
                              className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-0"
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {sortedStudents.length === 0 && (
        <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Students at Risk
            </h3>
            <p className="text-slate-600">
              {filterLevel === 'all' 
                ? 'All students are maintaining good attendance records.'
                : `No students currently have ${filterLevel} risk level.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}