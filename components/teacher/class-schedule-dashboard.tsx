'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Schedule data interfaces
export interface ClassScheduleEntry {
  id: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  dayName: string
  startTime: string
  endTime: string
  duration: number // in minutes
  room: string
  building: string
  subject: string
  teacherName: string
  teacherId: string
  type: 'lecture' | 'lab' | 'tutorial' | 'exam'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  attendanceCount?: number
  totalStudents: number
  notes?: string
  isRecurring: boolean
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly'
  color: string
}

interface ClassScheduleDashboardProps {
  classId: string
  className?: string
}

export function ClassScheduleDashboard({ classId, className }: ClassScheduleDashboardProps) {
  const [selectedWeek, setSelectedWeek] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('week')
  const [filterType, setFilterType] = React.useState<string>('all')
  const [isLoading, setIsLoading] = React.useState(false)

  // Mock schedule data - will be replaced with actual API calls
  const [scheduleEntries] = React.useState<ClassScheduleEntry[]>([
    {
      id: '1',
      dayOfWeek: 1, // Monday
      dayName: 'Monday',
      startTime: '08:00',
      endTime: '09:30',
      duration: 90,
      room: 'A-204',
      building: 'Engineering Building',
      subject: 'Computer Science Fundamentals',
      teacherName: 'Dr. Ahmed Hassan',
      teacherId: 'T001',
      type: 'lecture',
      status: 'scheduled',
      attendanceCount: 26,
      totalStudents: 28,
      isRecurring: true,
      recurringPattern: 'weekly',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      dayOfWeek: 3, // Wednesday
      dayName: 'Wednesday',
      startTime: '10:00',
      endTime: '11:30',
      duration: 90,
      room: 'B-101',
      building: 'Engineering Building',
      subject: 'Programming Lab',
      teacherName: 'Dr. Ahmed Hassan',
      teacherId: 'T001',
      type: 'lab',
      status: 'scheduled',
      attendanceCount: 24,
      totalStudents: 28,
      isRecurring: true,
      recurringPattern: 'weekly',
      color: 'bg-green-500'
    },
    {
      id: '3',
      dayOfWeek: 5, // Friday
      dayName: 'Friday',
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      room: 'C-301',
      building: 'Engineering Building',
      subject: 'Tutorial Session',
      teacherName: 'Dr. Ahmed Hassan',
      teacherId: 'T001',
      type: 'tutorial',
      status: 'completed',
      attendanceCount: 28,
      totalStudents: 28,
      isRecurring: true,
      recurringPattern: 'weekly',
      color: 'bg-purple-500'
    }
  ])

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ]

  // Filter schedule entries
  const filteredEntries = React.useMemo(() => {
    return scheduleEntries.filter(entry => {
      if (filterType === 'all') return true
      return entry.type === filterType
    })
  }, [scheduleEntries, filterType])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="h-4 w-4" />
      case 'lab':
        return <Users className="h-4 w-4" />
      case 'tutorial':
        return <Clock className="h-4 w-4" />
      case 'exam':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'lab':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'tutorial':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'exam':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'rescheduled':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getAttendanceRate = (attendanceCount: number, totalStudents: number) => {
    return ((attendanceCount / totalStudents) * 100).toFixed(1)
  }

  const handleAddSchedule = () => {
    console.log('Adding new schedule entry for class:', classId)
  }

  const handleEditSchedule = (entryId: string) => {
    console.log('Editing schedule entry:', entryId)
  }

  const handleDeleteSchedule = (entryId: string) => {
    console.log('Deleting schedule entry:', entryId)
  }

  const handleExportSchedule = () => {
    console.log('Exporting schedule for class:', classId)
  }

  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(selectedWeek)
    startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay()) // Start from Sunday
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const weekDates = getCurrentWeekDates()

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
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                    Class Schedule
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    Manage class timetable and sessions for Class {classId}
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={handleAddSchedule}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-xl shadow-orange-500/25 rounded-2xl px-6 py-3 text-base font-semibold border-0"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Schedule
              </Button>
              <Button
                onClick={handleExportSchedule}
                variant="outline"
                className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-2xl px-6 py-3 text-base font-semibold"
              >
                <Download className="h-5 w-5 mr-2" />
                Export Schedule
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
              <SelectTrigger className="w-32 border-0 bg-slate-50 focus:bg-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-0 bg-slate-50 focus:bg-white rounded-xl">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lecture">Lectures</SelectItem>
                <SelectItem value="lab">Labs</SelectItem>
                <SelectItem value="tutorial">Tutorials</SelectItem>
                <SelectItem value="exam">Exams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevWeek = new Date(selectedWeek)
                prevWeek.setDate(selectedWeek.getDate() - 7)
                setSelectedWeek(prevWeek)
              }}
              className="border-0 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              ←
            </Button>
            <span className="text-sm font-medium text-slate-700 px-4">
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextWeek = new Date(selectedWeek)
                nextWeek.setDate(selectedWeek.getDate() + 7)
                setSelectedWeek(nextWeek)
              }}
              className="border-0 bg-slate-50 hover:bg-slate-100 rounded-lg"
            >
              →
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Schedule Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-0 overflow-hidden"
      >
        <div className="grid grid-cols-8 gap-0">
          {/* Time column header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Time</span>
          </div>
          
          {/* Day headers */}
          {daysOfWeek.map((day, index) => (
            <div key={day} className="p-4 bg-slate-50 border-b border-slate-200 text-center">
              <div className="text-sm font-semibold text-slate-700">{day}</div>
              <div className="text-xs text-slate-500 mt-1">
                {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}

          {/* Time slots and schedule entries */}
          {timeSlots.map((time, timeIndex) => (
            <React.Fragment key={time}>
              {/* Time label */}
              <div className="p-2 text-xs text-slate-600 border-b border-slate-100 bg-slate-25">
                {time}
              </div>
              
              {/* Day columns */}
              {daysOfWeek.map((day, dayIndex) => {
                const dayEntries = filteredEntries.filter(entry => entry.dayOfWeek === dayIndex)
                const timeEntry = dayEntries.find(entry => entry.startTime === time)
                
                return (
                  <div key={`${day}-${time}`} className="p-1 border-b border-slate-100 min-h-[60px] relative">
                    {timeEntry && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-1 rounded-lg p-2 text-xs text-white shadow-sm"
                        style={{ backgroundColor: timeEntry.color.replace('bg-', '') }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold truncate">{timeEntry.subject}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 text-white hover:bg-white/20">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSchedule(timeEntry.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteSchedule(timeEntry.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-xs opacity-90">
                          {timeEntry.startTime} - {timeEntry.endTime}
                        </div>
                        <div className="text-xs opacity-90">
                          {timeEntry.room}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Schedule Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg text-white', entry.color)}>
                      {getTypeIcon(entry.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900">
                        {entry.subject}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {entry.dayName} • {entry.startTime} - {entry.endTime}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditSchedule(entry.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSchedule(entry.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex gap-2">
                    <Badge className={cn('border-2', getTypeBadgeColor(entry.type))}>
                      {entry.type}
                    </Badge>
                    <Badge className={cn('border-2', getStatusBadgeColor(entry.status))}>
                      {entry.status}
                    </Badge>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{entry.room}, {entry.building}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{entry.duration} minutes</span>
                  </div>

                  {/* Attendance */}
                  {entry.attendanceCount !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Attendance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          {entry.attendanceCount}/{entry.totalStudents}
                        </span>
                        <span className={cn(
                          'text-sm font-bold',
                          parseFloat(getAttendanceRate(entry.attendanceCount, entry.totalStudents)) >= 90 
                            ? 'text-green-600' 
                            : parseFloat(getAttendanceRate(entry.attendanceCount, entry.totalStudents)) >= 75 
                            ? 'text-orange-600' 
                            : 'text-red-600'
                        )}>
                          ({getAttendanceRate(entry.attendanceCount, entry.totalStudents)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Recurring Pattern */}
                  {entry.isRecurring && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        <strong>Recurring:</strong> {entry.recurringPattern}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-700">
                        <strong>Notes:</strong> {entry.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No schedule entries found
          </h3>
          <p className="text-slate-600 mb-6">
            {filterType !== 'all'
              ? `No ${filterType} sessions found for this class.`
              : 'This class doesn\'t have any scheduled sessions yet.'}
          </p>
          <Button
            onClick={handleAddSchedule}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl px-6 py-3 font-semibold border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Schedule
          </Button>
        </motion.div>
      )}
    </div>
  )
}