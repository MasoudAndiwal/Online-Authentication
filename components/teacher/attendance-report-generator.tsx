'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Loader2, Calendar, Users, Clock, FileText, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AttendanceReportGeneratorProps {
  classId: string
  className?: string
}

type DateRange = 'current-week' | 'last-week' | 'custom'

export function AttendanceReportGenerator({
  classId,
  className,
}: AttendanceReportGeneratorProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>('current-week')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [customStartDate, setCustomStartDate] = React.useState<string>('')
  const [customEndDate, setCustomEndDate] = React.useState<string>('')
  const [showExportDialog, setShowExportDialog] = React.useState(false)
  const [selectedFormat, setSelectedFormat] = React.useState<'pdf' | 'excel'>('pdf')

  const handleOpenExportDialog = () => {
    setShowExportDialog(true)
  }

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      setShowExportDialog(false)

      // Validate custom dates if selected
      if (dateRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast.error('Please select both start and end dates')
          return
        }

        const start = new Date(customStartDate)
        const end = new Date(customEndDate)

        if (start > end) {
          toast.error('Start date must be before end date')
          return
        }
      }

      // Prepare request body
      interface RequestBody {
        classId: string
        dateRange: DateRange
        customStartDate?: string
        customEndDate?: string
        format?: string
      }

      const requestBody: RequestBody = {
        classId,
        dateRange,
        format: selectedFormat,
      }

      if (dateRange === 'custom') {
        requestBody.customStartDate = customStartDate
        requestBody.customEndDate = customEndDate
      }

      // Call API based on format
      if (selectedFormat === 'pdf') {
        toast.info('PDF generation coming soon!')
        return
      }

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
      const extension = 'xlsx' // Currently only Excel is supported
      a.download = `attendance_${className || classId}_${new Date().getTime()}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

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
              <span>28 records</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>1 hour ago</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              Ready
            </span>
          </div>

          {/* Date Range Selection - Collapsible */}
          {dateRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border-0 bg-white/60 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}

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

            {/* View Detailed Report Link */}
            <motion.button
              whileHover={{ x: 4 }}
              className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-xs py-1.5 transition-colors"
            >
              View Detailed Report
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Export Configuration Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-0 overflow-hidden border-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">Export Configuration</DialogTitle>
            </div>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-6">
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
                    "w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                    selectedFormat === 'pdf'
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
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
                    "w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                    selectedFormat === 'excel'
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
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
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowExportDialog(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="flex-1 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold"
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
