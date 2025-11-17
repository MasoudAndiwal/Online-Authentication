'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ExportManager } from './export-manager'
import { AdvancedFilter, AdvancedReportFilters } from './advanced-filter'
import { reportService } from '@/lib/services/report-service'
import { AttendanceReportGenerator } from './attendance-report-generator'
import { SkeletonMetricGrid } from './skeleton-loaders'

// Class-specific report types
export interface ClassReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: 'orange' | 'blue' | 'green' | 'purple'
  lastGenerated?: Date
  dataCount: number
  isLoading?: boolean
}

interface ClassReportsDashboardProps {
  classId: string
  className?: string
}

export function ClassReportsDashboard({ classId, className }: ClassReportsDashboardProps) {
  const [selectedReportId, setSelectedReportId] = React.useState<string | null>(null)
  const [selectedReportData, setSelectedReportData] = React.useState<unknown>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false)
  const [showExportManager, setShowExportManager] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState<string | null>(null)
  
  // State for class data
  const [classData, setClassData] = React.useState<{ name: string; session: string } | null>(null)
  const [classLoading, setClassLoading] = React.useState(true)
  
  // State for class statistics
  const [classStats, setClassStats] = React.useState({
    totalStudents: 0,
    averageAttendance: 0,
    studentsAtRisk: 0,
    perfectAttendance: 0,
    lastUpdated: new Date()
  })
  const [statsLoading, setStatsLoading] = React.useState(true)
  
  // Fetch class data and statistics
  React.useEffect(() => {
    const fetchClassData = async () => {
      try {
        setClassLoading(true)
        const response = await fetch(`/api/classes/${classId}`)
        if (response.ok) {
          const data = await response.json()
          setClassData({ name: data.name, session: data.session })
        }
      } catch (error) {
        console.error('Error fetching class data:', error)
      } finally {
        setClassLoading(false)
      }
    }
    
    const fetchClassStats = async () => {
      try {
        setStatsLoading(true)
        const response = await fetch(`/api/classes/${classId}/stats`)
        if (response.ok) {
          const data = await response.json()
          setClassStats({
            totalStudents: data.totalStudents,
            averageAttendance: data.averageAttendance,
            studentsAtRisk: data.studentsAtRisk,
            perfectAttendance: data.perfectAttendance,
            lastUpdated: new Date(data.lastUpdated)
          })
        }
      } catch (error) {
        console.error('Error fetching class stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    
    if (classId) {
      fetchClassData()
      fetchClassStats()
    }
  }, [classId])
  
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedReportFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      preset: 'last7days'
    },
    classes: {
      selectedIds: [classId], // Pre-select current class
      sessions: ['MORNING', 'AFTERNOON'],
      semesters: [1, 2, 3, 4, 5, 6],
      majors: []
    },
    students: {
      statusTypes: ['Present', 'Absent', 'Sick', 'Leave'],
      riskLevels: ['low', 'medium', 'high'],
      attendanceRange: { min: 0, max: 100 },
      searchQuery: ''
    },
    attendance: {
      patterns: ['consistent', 'irregular', 'declining', 'improving'],
      timeOfDay: ['morning', 'afternoon', 'all'],
      dayOfWeek: []
    },
    advanced: {
      includeTransferStudents: true,
      includeInactiveStudents: false,
      groupBy: 'student',
      sortBy: 'name',
      sortOrder: 'asc'
    }
  })

  // Class-specific reports - Only Weekly Attendance Report
  const [reports, setReports] = React.useState<ClassReportType[]>([
    {
      id: 'weekly-attendance-report',
      title: 'Weekly Attendance Report',
      description: 'Weekly attendance report with student marks',
      icon: <Calendar className="w-6 h-6" />,
      color: 'orange',
      lastGenerated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      dataCount: 28,
      isLoading: false
    }
  ])



  const handleGenerateReport = async (reportId: string) => {
    setSelectedReportId(reportId)
    setIsGenerating(reportId)
    
    try {
      // Convert filters for API call
      const apiFilters = {
        dateRange: advancedFilters.dateRange,
        classIds: [classId], // Always filter to current class
        statusTypes: advancedFilters.students.statusTypes,
        riskLevels: advancedFilters.students.riskLevels
      }
      
      const reportData = await reportService.generateReport(reportId, apiFilters)
      setSelectedReportData(reportData)
      
      // Update the report's last generated time
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, lastGenerated: new Date(), isLoading: false }
          : report
      ))
      
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(null)
    }
  }

  const handleExportReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setShowExportManager(true)
  }

  const handleAdvancedExport = (reportId: string) => {
    setSelectedReportId(reportId)
    setShowExportManager(true)
  }

  const getLastGeneratedText = (date?: Date) => {
    if (!date) return 'Never generated'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }



  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Background Gradient - Orange Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-orange-500/5 to-orange-400/10" />
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-4 left-8 w-16 h-16 bg-orange-500/20 rounded-full blur-lg animate-pulse delay-1000" />
        
        <div className="relative p-6 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-xl shadow-orange-500/25">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                    Class Reports
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    {classLoading ? (
                      'Loading class information...'
                    ) : classData ? (
                      `Weekly attendance report for ${classData.name} - ${classData.session}`
                    ) : (
                      `Weekly attendance report for Class ${classId}`
                    )}
                  </p>
                </div>
              </motion.div>
            </div>


          </div>
        </div>
      </motion.div>

      {/* Stats Cards Grid */}
      {statsLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <SkeletonMetricGrid count={4} columns={4} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Students Card */}
          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {classStats.totalStudents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Attendance Card */}
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Avg Attendance
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {classStats.averageAttendance}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students At Risk Card */}
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/25">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  At Risk
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {classStats.studentsAtRisk}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Perfect Attendance Card */}
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Perfect
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {classStats.perfectAttendance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Attendance Report Generator */}
      <AttendanceReportGenerator classId={classId} className={className} />

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AdvancedFilter
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onClose={() => setShowAdvancedFilters(false)}
            onApply={() => setShowAdvancedFilters(false)}
          />
        </motion.div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
           
          </motion.div>
        ))}
      </div>

      {/* Export Manager */}
      {showExportManager && (
        <ExportManager
          isOpen={showExportManager}
          onClose={() => setShowExportManager(false)}
          reportId={selectedReportId}
          reportData={selectedReportData}
        />
      )}
    </div>
  )
}