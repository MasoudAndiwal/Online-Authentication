'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Users, 
  Filter,
  RotateCcw,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export interface ReportFilters {
  dateRange: {
    startDate: Date
    endDate: Date
  }
  classIds: string[]
  statusTypes: ('Present' | 'Absent' | 'Sick' | 'Leave')[]
  riskLevels: ('low' | 'medium' | 'high')[]
}

interface FilterPanelProps {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  onClose: () => void
  className?: string
}

// Mock data - will be replaced with actual API calls
const mockClasses = [
  { id: '1', name: 'Computer Science 101', studentCount: 28 },
  { id: '2', name: 'Data Structures', studentCount: 32 },
  { id: '3', name: 'Algorithms', studentCount: 25 },
  { id: '4', name: 'Database Systems', studentCount: 30 },
  { id: '5', name: 'Software Engineering', studentCount: 27 },
  { id: '6', name: 'Web Development', studentCount: 24 },
  { id: '7', name: 'Mobile Development', studentCount: 22 },
  { id: '8', name: 'Machine Learning', studentCount: 20 }
]

const statusOptions = [
  { value: 'Present' as const, label: 'Present', color: 'bg-green-100 text-green-700' },
  { value: 'Absent' as const, label: 'Absent', color: 'bg-red-100 text-red-700' },
  { value: 'Sick' as const, label: 'Sick', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Leave' as const, label: 'Leave', color: 'bg-purple-100 text-purple-700' }
]

const riskLevelOptions = [
  { value: 'low' as const, label: 'Low Risk', color: 'bg-green-100 text-green-700' },
  { value: 'medium' as const, label: 'Medium Risk', color: 'bg-orange-100 text-orange-700' },
  { value: 'high' as const, label: 'High Risk', color: 'bg-red-100 text-red-700' }
]

export function FilterPanel({ 
  filters, 
  onFiltersChange, 
  onClose, 
  className 
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = React.useState<ReportFilters>(filters)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Check if there are unsaved changes
  React.useEffect(() => {
    const changed = JSON.stringify(localFilters) !== JSON.stringify(filters)
    setHasChanges(changed)
  }, [localFilters, filters])

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: new Date(value)
      }
    }))
  }

  const handleClassToggle = (classId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }))
  }

  const handleStatusToggle = (status: 'Present' | 'Absent' | 'Sick' | 'Leave') => {
    setLocalFilters(prev => ({
      ...prev,
      statusTypes: prev.statusTypes.includes(status)
        ? prev.statusTypes.filter(s => s !== status)
        : [...prev.statusTypes, status]
    }))
  }

  const handleRiskLevelToggle = (level: 'low' | 'medium' | 'high') => {
    setLocalFilters(prev => ({
      ...prev,
      riskLevels: prev.riskLevels.includes(level)
        ? prev.riskLevels.filter(l => l !== level)
        : [...prev.riskLevels, level]
    }))
  }

  const handleSelectAllClasses = () => {
    const allSelected = localFilters.classIds.length === mockClasses.length
    setLocalFilters(prev => ({
      ...prev,
      classIds: allSelected ? [] : mockClasses.map(c => c.id)
    }))
  }

  const handleSelectAllStatuses = () => {
    const allSelected = localFilters.statusTypes.length === statusOptions.length
    setLocalFilters(prev => ({
      ...prev,
      statusTypes: allSelected ? [] : statusOptions.map(s => s.value)
    }))
  }

  const handleSelectAllRiskLevels = () => {
    const allSelected = localFilters.riskLevels.length === riskLevelOptions.length
    setLocalFilters(prev => ({
      ...prev,
      riskLevels: allSelected ? [] : riskLevelOptions.map(r => r.value)
    }))
  }

  const handleReset = () => {
    const defaultFilters: ReportFilters = {
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      classIds: [],
      statusTypes: ['Present', 'Absent', 'Sick', 'Leave'],
      riskLevels: ['low', 'medium', 'high']
    }
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn('relative', className)}
    >
      <Card className="rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-xl">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/25">
                <Filter className="h-5 w-5 text-white" />
              </div>
              Advanced Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600 mb-1 block">Start Date</Label>
                <input
                  type="date"
                  value={formatDate(localFilters.dateRange.startDate)}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full p-3 rounded-xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 mb-1 block">End Date</Label>
                <input
                  type="date"
                  value={formatDate(localFilters.dateRange.endDate)}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full p-3 rounded-xl border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Classes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Classes ({localFilters.classIds.length} selected)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllClasses}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-2 py-1"
              >
                {localFilters.classIds.length === mockClasses.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {mockClasses.map((classItem) => (
                <motion.div
                  key={classItem.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
                    localFilters.classIds.includes(classItem.id)
                      ? 'bg-orange-50 border-2 border-orange-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                  )}
                  onClick={() => handleClassToggle(classItem.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox
                    checked={localFilters.classIds.includes(classItem.id)}
                    onChange={() => handleClassToggle(classItem.id)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {classItem.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      {classItem.studentCount} students
                    </div>
                  </div>
                  {localFilters.classIds.includes(classItem.id) && (
                    <Check className="h-4 w-4 text-orange-600" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Status Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700">
                Attendance Status ({localFilters.statusTypes.length} selected)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllStatuses}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-2 py-1"
              >
                {localFilters.statusTypes.length === statusOptions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <motion.div
                  key={status.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className={cn(
                      'cursor-pointer border-2 transition-all',
                      localFilters.statusTypes.includes(status.value)
                        ? `${status.color} border-current shadow-sm`
                        : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                    )}
                    onClick={() => handleStatusToggle(status.value)}
                  >
                    {status.label}
                    {localFilters.statusTypes.includes(status.value) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Risk Levels */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700">
                Risk Levels ({localFilters.riskLevels.length} selected)
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAllRiskLevels}
                className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-2 py-1"
              >
                {localFilters.riskLevels.length === riskLevelOptions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {riskLevelOptions.map((level) => (
                <motion.div
                  key={level.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className={cn(
                      'cursor-pointer border-2 transition-all',
                      localFilters.riskLevels.includes(level.value)
                        ? `${level.color} border-current shadow-sm`
                        : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                    )}
                    onClick={() => handleRiskLevelToggle(level.value)}
                  >
                    {level.label}
                    {localFilters.riskLevels.includes(level.value) && (
                      <Check className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-0 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleApply}
              disabled={!hasChanges}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl font-semibold border-0"
            >
              <Check className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}