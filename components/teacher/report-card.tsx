'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  MoreVertical, 
  RefreshCw,
  Calendar,
  Users,
  Clock,
  ChevronRight,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Color configurations for different report types
const colorConfigs = {
  orange: {
    bg: 'from-orange-50 to-orange-100/50',
    icon: 'from-orange-500 to-orange-600',
    iconShadow: 'shadow-orange-500/25',
    button: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    accent: 'text-orange-600'
  },
  blue: {
    bg: 'from-blue-50 to-blue-100/50',
    icon: 'from-blue-500 to-blue-600',
    iconShadow: 'shadow-blue-500/25',
    button: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    accent: 'text-blue-600'
  },
  green: {
    bg: 'from-green-50 to-green-100/50',
    icon: 'from-green-500 to-green-600',
    iconShadow: 'shadow-green-500/25',
    button: 'bg-green-50 text-green-700 hover:bg-green-100',
    badge: 'bg-green-100 text-green-700',
    accent: 'text-green-600'
  },
  purple: {
    bg: 'from-purple-50 to-purple-100/50',
    icon: 'from-purple-500 to-purple-600',
    iconShadow: 'shadow-purple-500/25',
    button: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    accent: 'text-purple-600'
  }
}

export interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: 'orange' | 'blue' | 'green' | 'purple'
  lastGenerated?: Date
  dataCount: number
  isLoading?: boolean
}

interface ReportCardProps {
  report: ReportType
  onGenerate: () => void
  onExport: (format: 'pdf' | 'excel' | 'csv') => void
  onAdvancedExport?: () => void
  lastGeneratedText: string
  className?: string
}

export function ReportCard({ 
  report, 
  onGenerate, 
  onExport, 
  onAdvancedExport,
  lastGeneratedText,
  className 
}: ReportCardProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState<string | null>(null)
  
  const colors = colorConfigs[report.color]

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    onGenerate()
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(format)
    // Simulate export time
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsExporting(null)
    onExport(format)
  }

  return (
    <motion.div
      className={cn('group', className)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={cn(
        'rounded-2xl shadow-lg border-0 relative overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:shadow-black/10',
        `bg-gradient-to-br ${colors.bg}`
      )}>
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className={cn(
            'w-full h-full rounded-full transform translate-x-8 -translate-y-8',
            `bg-gradient-to-br ${colors.icon}`
          )} />
        </div>

        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <motion.div
                className={cn(
                  'p-3 rounded-2xl shadow-lg relative overflow-hidden flex-shrink-0',
                  `bg-gradient-to-br ${colors.icon} ${colors.iconShadow}`
                )}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                {/* Icon shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
                <div className="relative z-10 text-white">
                  {report.icon}
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* More Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-white/60 rounded-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                {onAdvancedExport && (
                  <DropdownMenuItem onClick={onAdvancedExport}>
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Export
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                {report.dataCount} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {lastGeneratedText}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <Badge className={cn(
              'border-0 shadow-sm',
              colors.badge
            )}>
              {report.lastGenerated ? 'Ready' : 'Not Generated'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || report.isLoading}
                className={cn(
                  'w-full shadow-sm border-0 rounded-xl font-semibold transition-all duration-300',
                  colors.button,
                  'relative overflow-hidden group/btn'
                )}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover/btn:translate-x-[-200%] transition-transform duration-700" />
                <div className="relative z-10 flex items-center justify-center">
                  {isGenerating || report.isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </div>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!report.lastGenerated || isExporting !== null}
                    className={cn(
                      'border-0 shadow-sm rounded-xl transition-all duration-300',
                      colors.button
                    )}
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting !== null}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                    {isExporting === 'pdf' && (
                      <RefreshCw className="h-3 w-3 ml-2 animate-spin" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('excel')}
                    disabled={isExporting !== null}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export Excel
                    {isExporting === 'excel' && (
                      <RefreshCw className="h-3 w-3 ml-2 animate-spin" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport('csv')}
                    disabled={isExporting !== null}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export CSV
                    {isExporting === 'csv' && (
                      <RefreshCw className="h-3 w-3 ml-2 animate-spin" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>

          {/* View Details Link */}
          <motion.button
            className={cn(
              'w-full mt-4 p-3 rounded-xl text-sm font-medium transition-all duration-200',
              'hover:bg-white/60 flex items-center justify-center gap-2',
              colors.accent
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => console.log('View details for:', report.id)}
          >
            View Detailed Report
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  )
}