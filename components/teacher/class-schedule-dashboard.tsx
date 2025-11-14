'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string): string => {
  try {
    const [hours, minutes] = time24.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time24;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch {
    return time24;
  }
};

// Utility function to get period number based on time
// 6 periods total: 3 in morning, 3 in afternoon
const getPeriodNumber = (startTime: string): number => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  // Morning session periods (8:30 AM - 12:45 PM)
  // Period 1: 8:30 - 9:10
  if (totalMinutes >= 510 && totalMinutes < 550) return 1;
  // Period 2: 9:10 - 9:50
  if (totalMinutes >= 550 && totalMinutes < 590) return 2;
  // Period 3: 9:50 - 10:30
  if (totalMinutes >= 590 && totalMinutes < 630) return 3;
  // Period 4: 10:45 - 11:25 (after break)
  if (totalMinutes >= 645 && totalMinutes < 685) return 4;
  // Period 5: 11:25 - 12:05
  if (totalMinutes >= 685 && totalMinutes < 725) return 5;
  // Period 6: 12:05 - 12:45
  if (totalMinutes >= 725 && totalMinutes < 765) return 6;
  
  // Afternoon session periods (1:15 PM - 5:30 PM)
  // Period 1: 1:15 - 1:55
  if (totalMinutes >= 795 && totalMinutes < 835) return 1;
  // Period 2: 1:55 - 2:35
  if (totalMinutes >= 835 && totalMinutes < 875) return 2;
  // Period 3: 2:35 - 3:15
  if (totalMinutes >= 875 && totalMinutes < 915) return 3;
  // Period 4: 3:30 - 4:10 (after break)
  if (totalMinutes >= 930 && totalMinutes < 970) return 4;
  // Period 5: 4:10 - 4:50
  if (totalMinutes >= 970 && totalMinutes < 1010) return 5;
  // Period 6: 4:50 - 5:30
  if (totalMinutes >= 1010 && totalMinutes < 1050) return 6;
  
  return 1; // Default to period 1
};

// Utility function to format date in Afghanistan format (Persian calendar)
const formatAfghanDate = (date: Date): string => {
  try {
    // Use Persian calendar locale for Afghanistan
    return date.toLocaleDateString('fa-AF', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'persian'
    });
  } catch {
    // Fallback to standard format if Persian calendar not supported
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }
};
import { Button } from '@/components/ui/button'
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
  major?: string // Added major field
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
  const [scheduleEntries, setScheduleEntries] = React.useState<ClassScheduleEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [classData, setClassData] = React.useState<{
    name: string;
    session: string;
    major: string;
  } | null>(null)

  // Fetch class data and schedule data from database
  React.useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[Schedule Dashboard] Fetching data for class:', classId);
        
        // Fetch class data
        const classResponse = await fetch(`/api/classes/${classId}`);
        if (classResponse.ok) {
          const classResult = await classResponse.json();
          console.log('[Schedule Dashboard] Received class data:', classResult);
          setClassData({
            name: classResult.name,
            session: classResult.session,
            major: classResult.major || '',
          });
        }
        
        // Fetch schedule data
        const response = await fetch(`/api/schedule/class?classId=${classId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch schedule data');
        }

        const result = await response.json();
        console.log('[Schedule Dashboard] Received schedule data:', result);
        console.log('[Schedule Dashboard] Raw entries:', result.data);

        if (result.success && result.data) {
          // Map database entries to component format
          const mappedEntries: ClassScheduleEntry[] = result.data.map((entry: {
            id: string;
            dayOfWeek: string;
            startTime: string;
            endTime: string;
            subject: string;
            teacherName: string;
            teacherId: string | null;
          }) => {
            // Map day_of_week string to number (0 = Sunday, 1 = Monday, etc.)
            const dayMap: Record<string, number> = {
              'sunday': 0,
              'monday': 1,
              'tuesday': 2,
              'wednesday': 3,
              'thursday': 4,
              'friday': 5,
              'saturday': 6,
            };

            const dayOfWeek = dayMap[entry.dayOfWeek.toLowerCase()] ?? 0;
            const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
            
            console.log(`[Mapping] ${entry.subject}: "${entry.dayOfWeek}" -> ${dayOfWeek} (${dayName})`);

            // Calculate duration in minutes
            const [startHour, startMin] = entry.startTime.split(':').map(Number);
            const [endHour, endMin] = entry.endTime.split(':').map(Number);
            const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

            // Determine type based on subject name or default to lecture
            let type: 'lecture' | 'lab' | 'tutorial' | 'exam' = 'lecture';
            const subjectLower = entry.subject.toLowerCase();
            if (subjectLower.includes('lab')) type = 'lab';
            else if (subjectLower.includes('tutorial')) type = 'tutorial';
            else if (subjectLower.includes('exam')) type = 'exam';

            // Assign color based on type
            const colorMap = {
              'lecture': 'bg-blue-500',
              'lab': 'bg-green-500',
              'tutorial': 'bg-purple-500',
              'exam': 'bg-red-500',
            };

            return {
              id: entry.id,
              dayOfWeek,
              dayName,
              startTime: entry.startTime,
              endTime: entry.endTime,
              duration,
              room: '',
              building: '',
              subject: entry.subject,
              teacherName: entry.teacherName,
              teacherId: entry.teacherId || '',
              major: classData?.major || '',
              type,
              status: 'scheduled',
              totalStudents: 0,
              isRecurring: true,
              recurringPattern: 'weekly',
              color: colorMap[type],
            };
          });

          console.log('[Schedule Dashboard] Mapped', mappedEntries.length, 'schedule entries');
          console.log('[Schedule Dashboard] Summary by day:');
          const byDay = mappedEntries.reduce((acc, e) => {
            if (!acc[e.dayName]) acc[e.dayName] = [];
            acc[e.dayName].push(`${e.subject} at ${e.startTime}`);
            return acc;
          }, {} as Record<string, string[]>);
          console.table(byDay);
          setScheduleEntries(mappedEntries);
        } else {
          console.log('[Schedule Dashboard] No schedule data found');
          setScheduleEntries([]);
        }
      } catch (err) {
        console.error('[Schedule Dashboard] Error fetching schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
        setScheduleEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId, classData?.major])

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:15', '13:30', '13:55', '14:00', '14:30', '14:35', '15:00', '15:15', '15:30',
    '16:00', '16:10', '16:30', '16:50', '17:00', '17:30', '18:00'
  ]

  // Show all schedule entries (filter removed since type badges are removed)
  const filteredEntries = React.useMemo(() => {
    return scheduleEntries
  }, [scheduleEntries])

  const getAttendanceRate = (attendanceCount: number, totalStudents: number) => {
    return ((attendanceCount / totalStudents) * 100).toFixed(1)
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

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading schedule...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load schedule</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                    {classData ? (
                      <>
                        Manage class timetable and sessions for <span className="font-semibold text-slate-900">{classData.name}</span>
                        <span className="mx-2">•</span>
                        <span className="text-orange-600 font-semibold">{classData.session === 'MORNING' ? 'Morning Session' : 'Afternoon Session'}</span>
                      </>
                    ) : (
                      'Loading class information...'
                    )}
                  </p>
                </div>
              </motion.div>
            </div>
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
          </div>

          <div className="flex items-center gap-4">
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
            <span className="text-sm font-medium text-slate-700 px-6">
              {formatAfghanDate(weekDates[0])}
            </span>
            <span className="text-slate-400">—</span>
            <span className="text-sm font-medium text-slate-700 px-6">
              {formatAfghanDate(weekDates[6])}
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
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-0 min-w-[800px]">
          {/* Time column header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Time</span>
          </div>
          
          {/* Day headers */}
          {daysOfWeek.map((day, index) => (
            <div key={day} className="p-4 bg-slate-50 border-b border-slate-200 text-center">
              <div className="text-sm font-semibold text-slate-700">{day}</div>
              <div className="text-xs text-slate-500 mt-1">
                {weekDates[index].toLocaleDateString('fa-AF', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}

          {/* Time slots and schedule entries */}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              {/* Time label */}
              <div className="p-2 text-xs text-slate-600 border-b border-slate-100 bg-slate-25">
                {formatTime12Hour(time)}
              </div>
              
              {/* Day columns */}
              {daysOfWeek.map((day, dayIndex) => {
                const dayEntries = filteredEntries.filter(entry => entry.dayOfWeek === dayIndex)
                // Match time by comparing first 5 characters (HH:MM) to handle both "08:00" and "08:00:00" formats
                const timeEntry = dayEntries.find(entry => entry.startTime.substring(0, 5) === time)
                
                // Debug logging for first time slot only
                if (time === '08:00' && dayEntries.length > 0) {
                  console.log(`[Grid] Day ${day} (${dayIndex}):`, dayEntries.map(e => ({
                    subject: e.subject,
                    startTime: e.startTime
                  })));
                }
                
                return (
                  <div key={`${day}-${time}`} className="p-1 border-b border-slate-100 min-h-[60px] relative">
                    {timeEntry && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-1 rounded-lg p-2 bg-gradient-to-br from-blue-500 to-blue-600 shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="font-semibold text-xs text-white truncate">
                            {timeEntry.subject}
                          </div>
                          <div className="text-[10px] text-white/90 truncate">
                            {formatTime12Hour(timeEntry.startTime)} - {formatTime12Hour(timeEntry.endTime)}
                          </div>
                          <div className="text-[10px] text-white/80 truncate">
                            Period {getPeriodNumber(timeEntry.startTime)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
          </div>
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
                <div className="space-y-2">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {entry.subject}
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    {entry.dayName} • {formatTime12Hour(entry.startTime)} - {formatTime12Hour(entry.endTime)}
                  </p>
                  {classData && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-700">{classData.name}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-orange-600 font-medium">
                        {classData.session === 'MORNING' ? 'Morning' : 'Afternoon'}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Period Number - Show period based on time */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Period {getPeriodNumber(entry.startTime)}</span>
                  </div>

                  {/* Major */}
                  {entry.major && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{entry.major}</span>
                    </div>
                  )}

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
            This class doesn&apos;t have any scheduled sessions yet. Please contact the office to add schedule entries.
          </p>
        </motion.div>
      )}
    </div>
  )
}