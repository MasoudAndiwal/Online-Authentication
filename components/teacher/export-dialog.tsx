'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  FileText, 
  File, 
  Table,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type ExportFormat = 'pdf' | 'excel' | 'csv'

interface ExportOption {
  format: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  fileSize: string
}

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  reportId: string | null
  className?: string
}

const exportOptions: ExportOption[] = [
  {
    format: 'pdf',
    label: 'PDF Document',
    description: 'Professional formatted report with charts and graphs',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    fileSize: '~2.5 MB'
  },
  {
    format: 'excel',
    label: 'Excel Spreadsheet',
    description: 'Detailed data with formulas and pivot tables',
    icon: <Table className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    fileSize: '~1.8 MB'
  },
  {
    format: 'csv',
    label: 'CSV File',
    description: 'Raw data for further analysis and processing',
    icon: <File className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    fileSize: '~0.5 MB'
  }
]

type ExportState = 'idle' | 'preparing' | 'downloading' | 'success' | 'error'

export function ExportDialog({ isOpen, onClose, reportId, className }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat | null>(null)
  const [exportState, setExportState] = React.useState<ExportState>('idle')
  const [progress, setProgress] = React.useState(0)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFormat(null)
      setExportState('idle')
      setProgress(0)
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleExport = async (format: ExportFormat) => {
    setSelectedFormat(format)
    setExportState('preparing')
    setProgress(0)
    setErrorMessage(null)

    try {
      // Simulate export process with progress updates
      const steps = [
        { message: 'Preparing data...', progress: 20 },
        { message: 'Generating report...', progress: 50 },
        { message: 'Formatting output...', progress: 80 },
        { message: 'Finalizing download...', progress: 100 }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setProgress(step.progress)
      }

      setExportState('downloading')
      
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setExportState('success')
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      setExportState('error')
      setErrorMessage('Failed to export report. Please try again.')
    }
  }

  const getStateIcon = () => {
    switch (exportState) {
      case 'preparing':
      case 'downloading':
        return <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Download className="w-5 h-5 text-slate-600" />
    }
  }

  const getStateMessage = () => {
    switch (exportState) {
      case 'preparing':
        return 'Preparing your report...'
      case 'downloading':
        return 'Download starting...'
      case 'success':
        return 'Export completed successfully!'
      case 'error':
        return errorMessage || 'Export failed'
      default:
        return 'Choose your preferred export format'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'sm:max-w-md rounded-2xl border-0 bg-white/95 backdrop-blur-xl shadow-2xl',
        className
      )}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
              {getStateIcon()}
            </div>
            Export Report
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            {getStateMessage()}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          <AnimatePresence>
            {(exportState === 'preparing' || exportState === 'downloading') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-slate-600 text-center">
                  {progress}% complete
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {exportState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-4"
              >
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">
                  Your report has been downloaded successfully!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {exportState === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-4"
              >
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-700 mb-3">
                  {errorMessage}
                </p>
                <Button
                  onClick={() => setExportState('idle')}
                  variant="outline"
                  size="sm"
                  className="border-0 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export Options */}
          <AnimatePresence>
            {exportState === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {exportOptions.map((option, index) => (
                  <motion.button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 border-transparent transition-all duration-200',
                      'hover:border-orange-200 hover:shadow-md text-left',
                      option.bgColor
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('p-2 rounded-lg', option.color)}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {option.label}
                          </h3>
                          <Badge className="bg-slate-100 text-slate-600 text-xs border-0">
                            {option.fileSize}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {option.description}
                        </p>
                      </div>
                      <Download className="w-5 h-5 text-slate-400" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Close Button */}
          <AnimatePresence>
            {exportState === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-0 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}