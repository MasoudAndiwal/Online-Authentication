'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Loader2, Calendar, Users, Clock, FileText, CalendarDays, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { SkeletonAttendanceReportGenerator } from './skeleton-loaders'
import { getDateRange, validateDateRange, type DateRangeType } from '@/lib/utils/date-ranges'

interface AttendanceReportGeneratorProps {
  classId: string
  className?: string
}

// Helper function to format time ago
function getTimeAgo(date: Date | null): string {
  if (!date) return 'Never generated'
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

export function AttendanceReportGenerator({
  classId,
  className,
}: AttendanceReportGeneratorProps) {
  const [dateRangeType, setDateRangeType] = React.useState<DateRangeType>('current-week')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [customStartDate, setCustomStartDate] = React.useState<Date | undefined>()
  const [customEndDate, setCustomEndDate] = React.useState<Date | undefined>()
  const [showExportDialog, setShowExportDialog] = React.useState(false)
  const [selectedFormat, setSelectedFormat] = React.useState<'pdf' | 'excel'>('excel')

  
  // New state for database data
  const [totalRecords, setTotalRecords] = React.useState<number>(0)
  const [lastGenerated, setLastGenerated] = React.useState<Date | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Fetch data from database
  React.useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch attendance records count
        const recordsResponse = await fetch(`/api/classes/${classId}/attendance/count`)
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json()
          setTotalRecords(recordsData.count || 0)
        }
        
        // Fetch last generated report time (from localStorage or API)
        const lastGen = localStorage.getItem(`report-last-gen-${classId}`)
        if (lastGen) {
          setLastGenerated(new Date(lastGen))
        }
        
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (classId) {
      fetchReportData()
    }
  }, [classId])

  // Get current date range info
  const currentDateRange = React.useMemo(() => {
    try {
      return getDateRange(dateRangeType, customStartDate, customEndDate)
    } catch {
      return null
    }
  }, [dateRangeType, customStartDate, customEndDate])

  // Validate current selection
  const dateValidation = React.useMemo(() => {
    if (dateRangeType === 'custom') {
      if (!customStartDate || !customEndDate) {
        return { isValid: false, error: 'Please select both start and end dates' }
      }
      return validateDateRange(customStartDate, customEndDate)
    }
    return { isValid: true }
  }, [dateRangeType, customStartDate, customEndDate])



  const handleOpenExportDialog = () => {
    setShowExportDialog(true)
  }

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      setShowExportDialog(false)

      // Validate date range
      if (!dateValidation.isValid) {
        toast.error(dateValidation.error || 'Invalid date range')
        setIsGenerating(false)
        return
      }

      // Get the actual date range
      const range = getDateRange(dateRangeType, customStartDate, customEndDate)

      // Prepare request body
      interface RequestBody {
        classId: string
        dateRange: DateRangeType
        customStartDate?: string
        customEndDate?: string
        format?: string
      }

      const requestBody: RequestBody = {
        classId,
        dateRange: dateRangeType,
        customStartDate: range.from.toISOString().split('T')[0],
        customEndDate: range.to.toISOString().split('T')[0],
        format: selectedFormat,
      }

      // Call API based on format
      if (selectedFormat === 'pdf') {
        const response = await fetch('/api/reports/attendance/pdf-alt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to generate PDF report')
        }

        // Download PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // Excel format
        const response = await fetch('/api/reports/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to generate report')
        }

        // Download file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const extension = 'xlsx'
        a.download = `attendance_${classId}_${new Date().getTime()}.${extension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      // Save last generated time
      const now = new Date()
      localStorage.setItem(`report-last-gen-${classId}`, now.toISOString())
      setLastGenerated(now)
      
      toast.success('Report generated and downloaded successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate report'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return <SkeletonAttendanceReportGenerator className={className} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("max-w-2xl", className)}
    >
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 via-orange-50/80 to-orange-100/50 overflow-hidden">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <motion.div
                className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar className="h-6 w-6 text-white" />
              </motion.div>

              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-0.5">
                  Weekly Attendance Report
                </h3>
                <p className="text-xs text-slate-600">
                  Weekly attendance report with student marks
                </p>
              </div>
            </div>
          </div>

          {/* Info Stats */}
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{isLoading ? '...' : `${totalRecords} records`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{isLoading ? '...' : getTimeAgo(lastGenerated)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              {isLoading ? 'Loading...' : lastGenerated ? 'Ready' : 'Not Generated'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* Generate Report Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleOpenExportDialog}
                disabled={isGenerating}
                className={cn(
                  "w-full bg-white hover:bg-white/90 text-orange-600 shadow-md border-0 rounded-xl h-10 font-semibold text-sm transition-all duration-200",
                  isGenerating && "opacity-70"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
                {!isGenerating && (
                  <Download className="h-4 w-4 ml-auto" />
                )}
              </Button>
            </motion.div>


          </div>
        </CardContent>
      </Card>

      {/* Export Configuration Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[650px] rounded-3xl p-0 overflow-hidden border-0">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Export Configuration</DialogTitle>
                <p className="text-sm text-slate-600 mt-1">Configure your attendance report settings</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Date Range Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-slate-700">Date Range</h3>
              </div>
              
              {/* Quick Date Range Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(['current-week', 'last-week'] as DateRangeType[]).map((type) => {
                  const range = getDateRange(type)
                  const isSelected = dateRangeType === type
                  return (
                    <motion.button
                      key={type}
                      onClick={() => setDateRangeType(type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "p-4 rounded-2xl border-0 transition-all duration-200 text-left",
                        isSelected
                          ? "bg-orange-50 shadow-md"
                          : "bg-white hover:bg-slate-50 shadow-sm"
                      )}
                      style={{ border: 'none' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{range.label}</h4>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{range.description}</p>
                    </motion.button>
                  )
                })}
              </div>

              {/* Custom Range Option */}
              <motion.button
                onClick={() => setDateRangeType('custom')}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "w-full p-4 rounded-2xl border-0 transition-all duration-200 text-left",
                  dateRangeType === 'custom'
                    ? "bg-orange-50 shadow-md"
                    : "bg-white hover:bg-slate-50 shadow-sm"
                )}
                style={{ border: 'none' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">Custom Range</h4>
                  {dateRangeType === 'custom' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-slate-600">Choose your own start and end dates</p>
              </motion.button>

              {/* Custom Date Pickers */}
              {dateRangeType === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        Start Date
                      </label>
                      <DatePicker
                        date={customStartDate}
                        onDateChange={setCustomStartDate}
                        placeholder="Select start date"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">
                        End Date
                      </label>
                      <DatePicker
                        date={customEndDate}
                        onDateChange={setCustomEndDate}
                        placeholder="Select end date"
                      />
                    </div>
                  </div>

                  {/* Date Range Validation */}
                  {!dateValidation.isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{dateValidation.error}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}



              {/* Date Range Preview */}
              {currentDateRange && dateValidation.isValid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Selected Range</p>
                      <p className="text-sm text-slate-600 mb-1">{currentDateRange.description}</p>
                      <p className="text-xs text-slate-500">
                        {currentDateRange.from.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} - {currentDateRange.to.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} (Gregorian)
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 border-0">
                      {Math.ceil((currentDateRange.to.getTime() - currentDateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Export Format Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Export Format</h3>
              <div className="space-y-3">
                {/* PDF Option */}
                <motion.button
                  onClick={() => setSelectedFormat('pdf')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full p-4 rounded-2xl border-0 transition-all duration-200 text-left",
                    selectedFormat === 'pdf'
                      ? "bg-orange-50 shadow-md"
                      : "bg-white hover:bg-slate-50 shadow-sm"
                  )}
                  style={{ border: 'none' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-xl flex-shrink-0">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">PDF Document</h4>
                        <span className="text-xs font-semibold text-slate-500">~150 KB</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Printable attendance report with student names, dates, and attendance marks
                      </p>
                      <p className="text-xs text-slate-500">
                        Processing time: 5-10 seconds
                      </p>
                    </div>
                    {selectedFormat === 'pdf' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.button>

                {/* Excel Option */}
                <motion.button
                  onClick={() => setSelectedFormat('excel')}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full p-4 rounded-2xl border-0 transition-all duration-200 text-left",
                    selectedFormat === 'excel'
                      ? "bg-orange-50 shadow-md"
                      : "bg-white hover:bg-slate-50 shadow-sm"
                  )}
                  style={{ border: 'none' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-xl flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">Excel Spreadsheet</h4>
                        <span className="text-xs font-semibold text-slate-500">~80 KB</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Editable spreadsheet with student attendance data, period-wise marks, and summary
                      </p>
                      <p className="text-xs text-slate-500">
                        Processing time: 3-5 seconds
                      </p>
                    </div>
                    {selectedFormat === 'excel' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={() => setShowExportDialog(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating || !dateValidation.isValid}
                className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </motion.div>
  )
}
