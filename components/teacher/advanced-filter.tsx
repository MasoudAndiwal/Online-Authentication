'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Search,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  Settings
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface AdvancedReportFilters {
  dateRange: {
    startDate: Date
    endDate: Date
    preset?: 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisSemester' | 'custom'
  }
  classes: {
    selectedIds: string[]
    sessions: ('MORNING' | 'AFTERNOON')[]
    semesters: number[]
    majors: string[]
  }
  students: {
    statusTypes: ('Present' | 'Absent' | 'Sick' | 'Leave')[]
    riskLevels: ('low' | 'medium' | 'high')[]
    attendanceRange: {
      min: number
      max: number
    }
    searchQuery: string
  }
  attendance: {
    patterns: ('consistent' | 'irregular' | 'declining' | 'improving')[]
    timeOfDay: ('morning' | 'afternoon' | 'all')[]
    dayOfWeek: string[]
  }
  advanced: {
    includeTransferStudents: boolean
    includeInactiveStudents: boolean
    groupBy: 'class' | 'student' | 'date' | 'teacher'
    sortBy: 'name' | 'attendance' | 'risk' | 'date'
    sortOrder: 'asc' | 'desc'
  }
}

interface AdvancedFilterProps {
  filters: AdvancedReportFilters
  onFiltersChange: (filters: AdvancedReportFilters) => void
  onClose: () => void
  onApply: () => void
  className?: string
}

// Mock data - will be replaced with actual API calls
const mockClasses = [
  { id: '1', name: 'Computer Science 101', session: 'MORNING', semester: 1, major: 'Computer Science', studentCount: 28 },
  { id: '2', name: 'Data Structures', session: 'AFTERNOON', semester: 2, major: 'Computer Science', studentCount: 32 },
  { id: '3', name: 'Algorithms', session: 'MORNING', semester: 3, major: 'Computer Science', studentCount: 25 },
  { id: '4', name: 'Database Systems', session: 'AFTERNOON', semester: 4, major: 'Information Systems', studentCount: 30 },
  { id: '5', name: 'Software Engineering', session: 'MORNING', semester: 5, major: 'Software Engineering', studentCount: 27 },
  { id: '6', name: 'Web Development', session: 'AFTERNOON', semester: 3, major: 'Web Development', studentCount: 24 }
]

const datePresets = [
  { value: 'last7days', label: 'Last 7 Days', days: 7 },
  { value: 'last30days', label: 'Last 30 Days', days: 30 },
  { value: 'thisMonth', label: 'This Month', days: 0 },
  { value: 'lastMonth', label: 'Last Month', days: 0 },
  { value: 'thisSemester', label: 'This Semester', days: 0 },
  { value: 'custom', label: 'Custom Range', days: 0 }
]

const statusOptions = [
  { value: 'Present', label: 'Present', color: 'bg-green-100 text-green-700', count: 2156 },
  { value: 'Absent', label: 'Absent', color: 'bg-red-100 text-red-700', count: 143 },
  { value: 'Sick', label: 'Sick', color: 'bg-yellow-100 text-yellow-700', count: 67 },
  { value: 'Leave', label: 'Leave', color: 'bg-purple-100 text-purple-700', count: 34 }
]

const riskLevelOptions = [
  { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-700', count: 198 },
  { value: 'medium', label: 'Medium Risk', color: 'bg-orange-100 text-orange-700', count: 37 },
  { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-700', count: 12 }
]

const attendancePatterns = [
  { value: 'consistent', label: 'Consistent', description: 'Regular attendance pattern' },
  { value: 'irregular', label: 'Irregular', description: 'Unpredictable attendance' },
  { value: 'declining', label: 'Declining', description: 'Attendance getting worse' },
  { value: 'improving', label: 'Improving', description: 'Attendance getting better' }
]

const daysOfWeek = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' }
]

export function AdvancedFilter({ 
  filters, 
  onFiltersChange, 
  onClose, 
  onApply,
  className 
}: AdvancedFilterProps) {
  const [localFilters, setLocalFilters] = React.useState<AdvancedReportFilters>(filters)
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['dateRange', 'classes'])
  )
  const [hasChanges, setHasChanges] = React.useState(false)

  // Check if there are unsaved changes
  React.useEffect(() => {
    const changed = JSON.stringify(localFilters) !== JSON.stringify(filters)
    setHasChanges(changed)
  }, [localFilters, filters])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleDatePresetChange = (preset: string) => {
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (preset) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'thisSemester':
        // Assuming semester starts in September
        const semesterStart = now.getMonth() >= 8 ? 8 : 1 // September or February
        startDate = new Date(now.getFullYear(), semesterStart, 1)
        break
      default:
        return // Custom - don't change dates
    }

    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        startDate,
        endDate,
        preset: preset as any
      }
    }))
  }

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: new Date(value),
        preset: 'custom'
      }
    }))
  }

  const handleClassToggle = (classId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      classes: {
        ...prev.classes,
        selectedIds: prev.classes.selectedIds.includes(classId)
          ? prev.classes.selectedIds.filter(id => id !== classId)
          : [...prev.classes.selectedIds, classId]
      }
    }))
  }

  const handleSessionToggle = (session: 'MORNING' | 'AFTERNOON') => {
    setLocalFilters(prev => ({
      ...prev,
      classes: {
        ...prev.classes,
        sessions: prev.classes.sessions.includes(session)
          ? prev.classes.sessions.filter(s => s !== session)
          : [...prev.classes.sessions, session]
      }
    }))
  }

  const handleStatusToggle = (status: 'Present' | 'Absent' | 'Sick' | 'Leave') => {
    setLocalFilters(prev => ({
      ...prev,
      students: {
        ...prev.students,
        statusTypes: prev.students.statusTypes.includes(status)
          ? prev.students.statusTypes.filter(s => s !== status)
          : [...prev.students.statusTypes, status]
      }
    }))
  }

  const handleRiskLevelToggle = (level: 'low' | 'medium' | 'high') => {
    setLocalFilters(prev => ({
      ...prev,
      students: {
        ...prev.students,
        riskLevels: prev.students.riskLevels.includes(level)
          ? prev.students.riskLevels.filter(l => l !== level)
          : [...prev.students.riskLevels, level]
      }
    }))
  }

  const handleAttendanceRangeChange = (field: 'min' | 'max', value: number) => {
    setLocalFilters(prev => ({
      ...prev,
      students: {
        ...prev.students,
        attendanceRange: {
          ...prev.students.attendanceRange,
          [field]: value
        }
      }
    }))
  }

  const handlePatternToggle = (pattern: string) => {
    setLocalFilters(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        patterns: prev.attendance.patterns.includes(pattern as any)
          ? prev.attendance.patterns.filter(p => p !== pattern)
          : [...prev.attendance.patterns, pattern as any]
      }
    }))
  }

  const handleDayToggle = (day: string) => {
    setLocalFilters(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        dayOfWeek: prev.attendance.dayOfWeek.includes(day)
          ? prev.attendance.dayOfWeek.filter(d => d !== day)
          : [...prev.attendance.dayOfWeek, day]
      }
    }))
  }

  const handleReset = () => {
    const defaultFilters: AdvancedReportFilters = {
      dateRange: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        preset: 'last7days'
      },
      classes: {
        selectedIds: [],
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
        groupBy: 'class',
        sortBy: 'name',
        sortOrder: 'asc'
      }
    }
    setLocalFilters(defaultFilters)
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApply()
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.classes.selectedIds.length > 0) count++
    if (localFilters.students.statusTypes.length < 4) count++
    if (localFilters.students.riskLevels.length < 3) count++
    if (localFilters.students.searchQuery) count++
    if (localFilters.attendance.patterns.length < 4) count++
    if (localFilters.attendance.dayOfWeek.length > 0) count++
    return count
  }

  const FilterSection = ({ 
    id, 
    title, 
    icon, 
    children, 
    badge 
  }: { 
    id: string
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    badge?: number
  }) => (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="text-slate-600">{icon}</div>
          <span className="font-semibold text-slate-900">{title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-0">
              {badge}
            </Badge>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-slate-600 transition-transform",
          expandedSections.has(id) && "rotate-180"
        )} />
      </button>
      <AnimatePresence>
        {expandedSections.has(id) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

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
              {getActiveFiltersCount() > 0 && (
                <Badge className="bg-orange-100 text-orange-700 border-0">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
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

        <CardContent className="p-6 pt-0 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Date Range Section */}
          <FilterSection
            id="dateRange"
            title="Date Range"
            icon={<Calendar className="h-4 w-4" />}
          >
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Quick Presets
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={localFilters.dateRange.preset === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDatePresetChange(preset.value)}
                      className={cn(
                        'text-xs',
                        localFilters.dateRange.preset === preset.value
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'border-0 bg-slate-50 hover:bg-slate-100'
                      )}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Start Date</Label>
                  <input
                    type="date"
                    value={formatDate(localFilters.dateRange.startDate)}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full p-2 rounded-lg border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">End Date</Label>
                  <input
                    type="date"
                    value={formatDate(localFilters.dateRange.endDate)}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full p-2 rounded-lg border-0 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Classes Section */}
          <FilterSection
            id="classes"
            title="Classes"
            icon={<Users className="h-4 w-4" />}
            badge={localFilters.classes.selectedIds.length}
          >
            <div className="space-y-4">
              {/* Session Filter */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Sessions
                </Label>
                <div className="flex gap-2">
                  {['MORNING', 'AFTERNOON'].map((session) => (
                    <Button
                      key={session}
                      variant={localFilters.classes.sessions.includes(session as any) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSessionToggle(session as any)}
                      className={cn(
                        'text-xs',
                        localFilters.classes.sessions.includes(session as any)
                          ? 'bg-orange-600 hover:bg-orange-700'
                          : 'border-0 bg-slate-50 hover:bg-slate-100'
                      )}
                    >
                      {session}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Class Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Select Classes ({localFilters.classes.selectedIds.length} selected)
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const allSelected = localFilters.classes.selectedIds.length === mockClasses.length
                      setLocalFilters(prev => ({
                        ...prev,
                        classes: {
                          ...prev.classes,
                          selectedIds: allSelected ? [] : mockClasses.map(c => c.id)
                        }
                      }))
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg px-2 py-1"
                  >
                    {localFilters.classes.selectedIds.length === mockClasses.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {mockClasses.map((classItem) => (
                    <div
                      key={classItem.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all text-sm',
                        localFilters.classes.selectedIds.includes(classItem.id)
                          ? 'bg-orange-50 border-2 border-orange-200'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      )}
                      onClick={() => handleClassToggle(classItem.id)}
                    >
                      <Checkbox
                        checked={localFilters.classes.selectedIds.includes(classItem.id)}
                        onChange={() => handleClassToggle(classItem.id)}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {classItem.name}
                        </div>
                        <div className="text-xs text-slate-600">
                          {classItem.session} • {classItem.studentCount} students
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Students Section */}
          <FilterSection
            id="students"
            title="Students"
            icon={<Users className="h-4 w-4" />}
          >
            <div className="space-y-4">
              {/* Search */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Search Students
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or student ID..."
                    value={localFilters.students.searchQuery}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      students: { ...prev.students, searchQuery: e.target.value }
                    }))}
                    className="pl-10 border-0 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Attendance Range */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Attendance Rate Range
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Min %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={localFilters.students.attendanceRange.min}
                      onChange={(e) => handleAttendanceRangeChange('min', parseInt(e.target.value) || 0)}
                      className="border-0 bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600 mb-1 block">Max %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={localFilters.students.attendanceRange.max}
                      onChange={(e) => handleAttendanceRangeChange('max', parseInt(e.target.value) || 100)}
                      className="border-0 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Status Types */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Attendance Status
                </Label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge
                      key={status.value}
                      className={cn(
                        'cursor-pointer border-2 transition-all',
                        localFilters.students.statusTypes.includes(status.value as any)
                          ? `${status.color} border-current shadow-sm`
                          : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                      )}
                      onClick={() => handleStatusToggle(status.value as any)}
                    >
                      {status.label} ({status.count})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Risk Levels */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Risk Levels
                </Label>
                <div className="flex flex-wrap gap-2">
                  {riskLevelOptions.map((level) => (
                    <Badge
                      key={level.value}
                      className={cn(
                        'cursor-pointer border-2 transition-all',
                        localFilters.students.riskLevels.includes(level.value as any)
                          ? `${level.color} border-current shadow-sm`
                          : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                      )}
                      onClick={() => handleRiskLevelToggle(level.value as any)}
                    >
                      {level.label} ({level.count})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Attendance Patterns Section */}
          <FilterSection
            id="attendance"
            title="Attendance Patterns"
            icon={<TrendingUp className="h-4 w-4" />}
          >
            <div className="space-y-4">
              {/* Patterns */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Attendance Patterns
                </Label>
                <div className="space-y-2">
                  {attendancePatterns.map((pattern) => (
                    <div
                      key={pattern.value}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all',
                        localFilters.attendance.patterns.includes(pattern.value as any)
                          ? 'bg-orange-50 border-2 border-orange-200'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      )}
                      onClick={() => handlePatternToggle(pattern.value)}
                    >
                      <Checkbox
                        checked={localFilters.attendance.patterns.includes(pattern.value as any)}
                        onChange={() => handlePatternToggle(pattern.value)}
                        className="pointer-events-none"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {pattern.label}
                        </div>
                        <div className="text-xs text-slate-600">
                          {pattern.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Days of Week */}
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">
                  Specific Days ({localFilters.attendance.dayOfWeek.length} selected)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Badge
                      key={day.value}
                      className={cn(
                        'cursor-pointer border-2 transition-all',
                        localFilters.attendance.dayOfWeek.includes(day.value)
                          ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
                          : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                      )}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Advanced Options Section */}
          <FilterSection
            id="advanced"
            title="Advanced Options"
            icon={<Settings className="h-4 w-4" />}
          >
            <div className="space-y-4">
              {/* Include Options */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="include-transfer"
                    checked={localFilters.advanced.includeTransferStudents}
                    onCheckedChange={(checked) => 
                      setLocalFilters(prev => ({
                        ...prev,
                        advanced: { ...prev.advanced, includeTransferStudents: !!checked }
                      }))
                    }
                  />
                  <Label htmlFor="include-transfer" className="text-sm text-slate-700">
                    Include transfer students
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="include-inactive"
                    checked={localFilters.advanced.includeInactiveStudents}
                    onCheckedChange={(checked) => 
                      setLocalFilters(prev => ({
                        ...prev,
                        advanced: { ...prev.advanced, includeInactiveStudents: !!checked }
                      }))
                    }
                  />
                  <Label htmlFor="include-inactive" className="text-sm text-slate-700">
                    Include inactive students
                  </Label>
                </div>
              </div>

              {/* Grouping and Sorting */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Group By</Label>
                  <Select
                    value={localFilters.advanced.groupBy}
                    onValueChange={(value) => 
                      setLocalFilters(prev => ({
                        ...prev,
                        advanced: { ...prev.advanced, groupBy: value as any }
                      }))
                    }
                  >
                    <SelectTrigger className="border-0 bg-slate-50 focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs text-slate-600 mb-1 block">Sort By</Label>
                  <Select
                    value={localFilters.advanced.sortBy}
                    onValueChange={(value) => 
                      setLocalFilters(prev => ({
                        ...prev,
                        advanced: { ...prev.advanced, sortBy: value as any }
                      }))
                    }
                  >
                    <SelectTrigger className="border-0 bg-slate-50 focus:bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="risk">Risk Level</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-0 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
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