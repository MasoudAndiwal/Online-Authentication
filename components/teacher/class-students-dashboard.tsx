'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Phone, Clock, UserCheck, UserX, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

// Student data interface
export interface ClassStudent {
  id: string
  studentId: string
  firstName: string
  lastName: string
  fatherName?: string
  email: string
  phone: string
  fatherPhone?: string
  avatar?: string
  attendanceRate: number
  totalClasses: number
  presentCount: number
  absentCount: number
  sickCount: number
  leaveCount: number
  status: 'Active' | 'Inactive'
  riskType?: 'محروم' | 'تصدیق طلب'
  lastAttendance: Date
  enrollmentDate: Date
  parentContact?: string
  notes?: string
}

interface ClassStudentsDashboardProps {
  classId: string
  className?: string
}

export function ClassStudentsDashboard({ classId, className }: ClassStudentsDashboardProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('name')
  const [isLoading, setIsLoading] = React.useState(true)
  const [students, setStudents] = React.useState<ClassStudent[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [classData, setClassData] = React.useState<{
    name: string;
    session: string;
  } | null>(null)

  // Fetch class data and students
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch class data first
        const classResponse = await fetch(`/api/classes/${classId}`)
        if (!classResponse.ok) throw new Error('Failed to fetch class data')
        const classInfo = await classResponse.json()
        
        // Store class data
        setClassData({
          name: classInfo.name,
          session: classInfo.session || 'MORNING'
        })
        
        // Construct class section key with uppercase session (matches database)
        const classSectionKey = `${classInfo.name} - ${classInfo.session || 'MORNING'}`
        
        // Fetch students for this class
        const studentsResponse = await fetch(`/api/students?classSection=${encodeURIComponent(classSectionKey)}`)
        if (!studentsResponse.ok) throw new Error('Failed to fetch students')
        const studentsData = await studentsResponse.json()
        
        // Transform students to match ClassStudent interface
        const transformedStudents: ClassStudent[] = studentsData.map((student: {
          id: string;
          studentId: string;
          firstName: string;
          lastName: string;
          fatherName?: string;
          username: string;
          phone: string;
          fatherPhone?: string;
          status?: string;
          createdAt?: string;
        }) => {
          // Generate sample attendance data (will be replaced with real data later)
          const presentCount = Math.floor(Math.random() * 15) + 15; // 15-30
          const absentCount = Math.floor(Math.random() * 4) + 2;    // 2-6
          const sickCount = Math.floor(Math.random() * 2) + 1;      // 1-3
          const leaveCount = Math.floor(Math.random() * 2) + 1;     // 1-3
          const totalClasses = presentCount + absentCount + sickCount + leaveCount;
          const attendanceRate = (presentCount / totalClasses) * 100;
          
          return {
            id: student.id,
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            fatherName: student.fatherName,
            email: student.username, // Using username as email
            phone: student.phone,
            fatherPhone: student.fatherPhone,
            attendanceRate,
            totalClasses,
            presentCount,
            absentCount,
            sickCount,
            leaveCount,
            status: student.status || 'Active',
            riskLevel: attendanceRate >= 90 ? 'low' : attendanceRate >= 75 ? 'medium' : 'high',
            lastAttendance: new Date(),
            enrollmentDate: new Date(student.createdAt || Date.now()),
            parentContact: student.fatherPhone || '',
            notes: ''
          };
        })
        
        setStudents(transformedStudents)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (classId) {
      fetchData()
    }
  }, [classId])

  // Filter and sort students - MUST be before any conditional returns
  const filteredStudents = React.useMemo(() => {
    const filtered = students.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'studentId':
          return a.studentId.localeCompare(b.studentId)
        default:
          return 0
      }
    })

    return filtered
  }, [students, searchQuery, statusFilter, sortBy])

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <h3 className="text-lg font-semibold">Error loading students</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const handleExportStudents = () => {
    // Export functionality - to be implemented
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
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                    Class Students
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    {classData ? (
                      <>
                        Manage and monitor students in <span className="font-semibold text-slate-900">{classData.name}</span>
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

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={handleExportStudents}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-xl shadow-orange-500/25 rounded-2xl px-6 py-3 text-base font-semibold border-0"
              >
                <Download className="h-5 w-5 mr-2" />
                Export List
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-0"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 bg-slate-50 focus:bg-white rounded-xl"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="border-0 bg-slate-50 focus:bg-white rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-0 bg-slate-50 focus:bg-white rounded-xl">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="studentId">Student ID</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold">
                      {student.firstName[0]}{student.fatherName ? student.fatherName[0] : student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {student.firstName} {student.fatherName || student.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      ID: {student.studentId}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Attendance Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">Present:</span>
                      </div>
                      <span className="font-semibold text-slate-900">{student.presentCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-red-600" />
                        <span className="text-slate-600">Absent:</span>
                      </div>
                      <span className="font-semibold text-slate-900">{student.absentCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-slate-600">Sick:</span>
                      </div>
                      <span className="font-semibold text-slate-900">{student.sickCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="text-slate-600">Leave:</span>
                      </div>
                      <span className="font-semibold text-slate-900">{student.leaveCount}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                    {student.fatherName && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Father: {student.fatherName}</span>
                      </div>
                    )}
                    {student.fatherPhone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{student.fatherPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No students found
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more students.'
              : 'This class doesn\'t have any students yet.'}
          </p>

        </motion.div>
      )}
    </div>
  )
}