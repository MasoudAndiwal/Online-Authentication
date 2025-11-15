'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Loader2, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)

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
      }

      const requestBody: RequestBody = {
        classId,
        dateRange,
      }

      if (dateRange === 'custom') {
        requestBody.customStartDate = customStartDate
        requestBody.customEndDate = customEndDate
      }

      // Call API
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
      a.download = `attendance_${className || classId}_${new Date().getTime()}.xlsx`
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
    >
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Generate Weekly Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Select Date Range
            </label>
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
              <SelectTrigger className="border-0 bg-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-week">Current Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border-0 bg-white rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border-0 bg-white rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl rounded-xl py-3 font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate & Download Excel Report
              </>
            )}
          </Button>

          {/* Info Text */}
          <p className="text-xs text-slate-600 text-center">
            Report will be generated in Excel format with attendance data for the selected week
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
