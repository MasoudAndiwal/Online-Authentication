'use client'

import * as React from 'react'

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
<></>
  )
}