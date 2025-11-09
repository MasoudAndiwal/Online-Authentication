'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Settings, 
  FileText, 
  Table, 
  File,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Minus
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  reportService, 
  ExportOptions, 
  ExportProgress, 
  ExportFormat 
} from '@/lib/services/report-service'

interface ExportManagerProps {
  isOpen: boolean
  onClose: () => void
  reportId: string | null
  reportData?: any
  className?: string
}

interface ExportConfig extends ExportOptions {
  title: string
  description: string
  estimatedSize: string
  processingTime: string
}

const exportConfigs: Record<ExportFormat, ExportConfig> = {
  pdf: {
    format: 'pdf',
    title: 'PDF Document',
    description: 'Professional formatted report with charts, graphs, and detailed analysis',
    estimatedSize: '2.5 MB',
    processingTime: '30-45 seconds',
    includeCharts: true,
    includeRawData: false
  },
  excel: {
    format: 'excel',
    title: 'Excel Spreadsheet',
    description: 'Detailed data with formulas, pivot tables, and interactive charts',
    estimatedSize: '1.8 MB',
    processingTime: '20-30 seconds',
    includeCharts: true,
    includeRawData: true
  },
  csv: {
    format: 'csv',
    title: 'CSV File',
    description: 'Raw data in comma-separated format for further analysis',
    estimatedSize: '0.5 MB',
    processingTime: '10-15 seconds',
    includeCharts: false,
    includeRawData: true
  }
}

type ExportState = 'config' | 'processing' | 'success' | 'error'

export function ExportManager({ 
  isOpen, 
  onClose, 
  reportId, 
  reportData,
  className 
}: ExportManagerProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('pdf')
  const [exportState, setExportState] = React.useState<ExportState>('config')
  const [exportOptions, setExportOptions] = React.useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
    dateRange: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    customFields: []
  })
  const [progress, setProgress] = React.useState<ExportProgress | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [customFieldsExpanded, setCustomFieldsExpanded] = React.useState(false)

  // Available custom fields for export
  const availableFields = [
    { id: 'student-photos', label: 'Student Photos', description: 'Include student profile pictures' },
    { id: 'contact-info', label: 'Contact Information', description: 'Student and parent contact details' },
    { id: 'academic-history', label: 'Academic History', description: 'Previous semester performance' },
    { id: 'attendance-notes', label: 'Attendance Notes', description: 'Teacher comments and observations' },
    { id: 'risk-analysis', label: 'Risk Analysis', description: 'Detailed risk assessment and recommendations' },
    { id: 'parent-notifications', label: 'Parent Notifications', description: 'History of parent communications' }
  ]

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setExportState('config')
      setProgress(null)
      setErrorMessage(null)
      setSelectedFormat('pdf')
      setExportOptions(prev => ({ ...prev, format: 'pdf' }))
    }
  }, [isOpen])

  // Update export options when format changes
  React.useEffect(() => {
    const config = exportConfigs[selectedFormat]
    setExportOptions(prev => ({
      ...prev,
      format: selectedFormat,
      includeCharts: config.includeCharts,
      includeRawData: config.includeRawData
    }))
  }, [selectedFormat])

  const handleFormatChange = (format: ExportFormat) => {
    setSelectedFormat(format)
  }

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCustomFieldToggle = (fieldId: string) => {
    setExportOptions(prev => ({
      ...prev,
      customFields: prev.customFields?.includes(fieldId)
        ? prev.customFields.filter(id => id !== fieldId)
        : [...(prev.customFields || []), fieldId]
    }))
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange!,
        [field]: new Date(value)
      }
    }))
  }

  const handleExport = async () => {
    if (!reportData) {
      setErrorMessage('No report data available for export')
      setExportState('error')
      return
    }

    setExportState('processing')
    setProgress(null)
    setErrorMessage(null)

    try {
      await reportService.exportReport(
        reportData,
        exportOptions,
        (progressUpdate) => {
          setProgress(progressUpdate)
        }
      )

      setExportState('success')
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (error) {
      setExportState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Export failed')
    }
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getStateIcon = () => {
    switch (exportState) {
      case 'processing':
        return <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      default:
        return <Settings className="w-6 h-6 text-orange-600" />
    }
  }

  const getStateTitle = () => {
    switch (exportState) {
      case 'processing':
        return 'Exporting Report'
      case 'success':
        return 'Export Complete'
      case 'error':
        return 'Export Failed'
      default:
        return 'Export Configuration'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'sm:max-w-2xl rounded-2xl border-0 bg-white/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto',
        className
      )}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
              {getStateIcon()}
            </div>
            {getStateTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration State */}
          <AnimatePresence>
            {exportState === 'config' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Format Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700">
                    Export Format
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(exportConfigs).map(([format, config]) => (
                      <motion.button
                        key={format}
                        onClick={() => handleFormatChange(format as ExportFormat)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                          selectedFormat === format
                            ? 'border-orange-200 bg-orange-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-25'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'p-2 rounded-lg',
                            format === 'pdf' ? 'bg-red-100 text-red-600' :
                            format === 'excel' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          )}>
                            {format === 'pdf' ? <FileText className="w-5 h-5" /> :
                             format === 'excel' ? <Table className="w-5 h-5" /> :
                             <File className="w-5 h-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">
                                {config.title}
                              </h3>
                              <Badge className="bg-slate-100 text-slate-600 text-xs border-0">
                                {config.estimatedSize}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              {config.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              Processing time: {config.processingTime}
                            </p>
                          </div>
                          {selectedFormat === format && (
                            <CheckCircle className="w-5 h-5 text-orange-600" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">
                    Export Options
                  </Label>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-charts"
                        checked={exportOptions.includeCharts}
                        onCheckedChange={(checked) => 
                          handleOptionChange('includeCharts', checked)
                        }
                      />
                      <Label htmlFor="include-charts" className="text-sm text-slate-700">
                        Include charts and visualizations
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="include-raw-data"
                        checked={exportOptions.includeRawData}
                        onCheckedChange={(checked) => 
                          handleOptionChange('includeRawData', checked)
                        }
                      />
                      <Label htmlFor="include-raw-data" className="text-sm text-slate-700">
                        Include raw data tables
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">Start Date</Label>
                      <input
                        type="date"
                        value={formatDate(exportOptions.dateRange!.startDate)}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        className="w-full p-3 rounded-xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 mb-1 block">End Date</Label>
                      <input
                        type="date"
                        value={formatDate(exportOptions.dateRange!.endDate)}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        className="w-full p-3 rounded-xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-700">
                      Additional Fields ({exportOptions.customFields?.length || 0} selected)
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCustomFieldsExpanded(!customFieldsExpanded)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-2 py-1"
                    >
                      {customFieldsExpanded ? (
                        <>
                          <Minus className="h-4 w-4 mr-1" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Expand
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <AnimatePresence>
                    {customFieldsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 max-h-40 overflow-y-auto"
                      >
                        {availableFields.map((field) => (
                          <div
                            key={field.id}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all',
                              exportOptions.customFields?.includes(field.id)
                                ? 'bg-orange-50 border-2 border-orange-200'
                                : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                            )}
                            onClick={() => handleCustomFieldToggle(field.id)}
                          >
                            <Checkbox
                              checked={exportOptions.customFields?.includes(field.id) || false}
                              onChange={() => handleCustomFieldToggle(field.id)}
                              className="pointer-events-none mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900">
                                {field.label}
                              </div>
                              <div className="text-xs text-slate-600">
                                {field.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-0 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExport}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl font-semibold border-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing State */}
          <AnimatePresence>
            {exportState === 'processing' && progress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="space-y-2">
                  <Progress value={progress.progress} className="h-3" />
                  <p className="text-sm text-slate-600">
                    {progress.message} ({progress.progress}%)
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Please don't close this window while exporting...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {exportState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  Export Completed Successfully!
                </h3>
                <p className="text-sm text-slate-600">
                  Your report has been downloaded to your device.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          <AnimatePresence>
            {exportState === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  Export Failed
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => setExportState('config')}
                  variant="outline"
                  className="border-0 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}