'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  MoreVertical,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

// Student data interface
export interface ClassStudent {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  attendanceRate: number
  totalClasses: number
  presentCount: number
  absentCount: number
  sickCount: number
  leaveCount: number
  status: 'Active' | 'Inactive' | 'Transferred'
  riskLevel: 'low' | 'medium' | 'high'
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
  const [riskFilter, setRiskFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('name')
  const [isLoading, setIsLoading] = React.useState(true)
  const [students, setStudents] = React.useState<ClassStudent[]>([])
  const [error, setError] = React.useState<string | null>(null)

  // Fetch class data and students
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch class data first
        const classResponse = await fetch(`/api/classes/${classId}`)
        if (!classResponse.ok) throw new Error('Failed to fetch class data')
        const classInfo = await classResponse.json()
        
        console.log('Class data:', classInfo)
        
        // Construct class section key with uppercase session (matches database)
        const classSectionKey = `${classInfo.name} - ${classInfo.session || 'MORNING'}`
        
        console.log('Fetching students with classSection:', classSectionKey)
        
        // Fetch students for this class
        const studentsResponse = await fetch(`/api/students?classSection=${encodeURIComponent(classSectionKey)}`)
        if (!studentsResponse.ok) throw new Error('Failed to fetch students')
        const studentsData = await studentsResponse.json()
        
        console.log('Fetched students:', studentsData)
        
        // Transform students to match ClassStudent interface
        const transformedStudents: ClassStudent[] = studentsData.map((student: {
          id: string;
          studentId: string;
          firstName: string;
          lastName: string;
          username: string;
          phone: string;
          status?: string;
          createdAt?: string;
          fatherPhone?: string;
        }) => ({
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.username, // Using username as email
          phone: student.phone,
          attendanceRate: 0, // TODO: Calculate from attendance records
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
          sickCount: 0,
          leaveCount: 0,
          status: student.status || 'Active',
          riskLevel: 'low',
          lastAttendance: new Date(),
          enrollmentDate: new Date(student.createdAt || Date.now()),
          parentContact: student.fatherPhone || '',
          notes: ''
        }))
        
        setStudents(transformedStudents)
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
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
      const matchesRisk = riskFilter === 'all' || student.riskLevel === riskFilter
      
      return matchesSearch && matchesStatus && matchesRisk
    })

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'attendance':
          return b.attendanceRate - a.attendanceRate
        case 'risk':
          const riskOrder = { high: 3, medium: 2, low: 1 }
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
        case 'studentId':
          return a.studentId.localeCompare(b.studentId)
        default:
          return 0
      }
    })

    return filtered
  }, [students, searchQuery, statusFilter, riskFilter, sortBy])

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
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

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Transferred':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (rate >= 75) return <Clock className="h-4 w-4 text-orange-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const handleExportStudents = () => {
    // Mock export functionality
    console.log('Exporting students for class:', classId)
  }

  const handleAddStudent = () => {
    // Mock add student functionality
    console.log('Adding new student to class:', classId)
  }

  const handleEditStudent = (studentId: string) => {
    console.log('Editing student:', studentId)
  }

  const handleRemoveStudent = (studentId: string) => {
    console.log('Removing student:', studentId)
  }

  const handleContactParent = (student: ClassStudent) => {
    console.log('Contacting parent for student:', student.firstName, student.lastName)
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
                    Manage and monitor students in Class {classId}
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
                onClick={handleAddStudent}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-xl shadow-orange-500/25 rounded-2xl px-6 py-3 text-base font-semibold border-0"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Student
              </Button>
              <Button
                onClick={handleExportStudents}
                variant="outline"
                className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-2xl px-6 py-3 text-base font-semibold"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
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
              <SelectItem value="transferred">Transferred</SelectItem>
            </SelectContent>
          </Select>

          {/* Risk Filter */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="border-0 bg-slate-50 focus:bg-white rounded-xl">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="border-0 bg-slate-50 focus:bg-white rounded-xl">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="attendance">Attendance Rate</SelectItem>
              <SelectItem value="risk">Risk Level</SelectItem>
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
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold">
                        {student.firstName[0]}{student.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-slate-600">
                        ID: {student.studentId}
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
                      <DropdownMenuItem onClick={() => handleEditStudent(student.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Student
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleContactParent(student)}>
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Parent
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Student
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {/* Status and Risk Badges */}
                  <div className="flex gap-2">
                    <Badge className={cn('border-2', getStatusBadgeColor(student.status))}>
                      {student.status}
                    </Badge>
                    <Badge className={cn('border-2', getRiskBadgeColor(student.riskLevel))}>
                      {student.riskLevel} risk
                    </Badge>
                    {student.riskType && (
                      <Badge className="bg-red-100 text-red-700 border-2 border-red-200">
                        {student.riskType}
                      </Badge>
                    )}
                  </div>

                  {/* Attendance Rate */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAttendanceIcon(student.attendanceRate)}
                      <span className="text-sm font-medium text-slate-700">
                        Attendance Rate
                      </span>
                    </div>
                    <span className={cn(
                      'text-lg font-bold',
                      student.attendanceRate >= 90 ? 'text-green-600' :
                      student.attendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'
                    )}>
                      {student.attendanceRate.toFixed(1)}%
                    </span>
                  </div>

                  {/* Attendance Breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-slate-600">Present: {student.presentCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-slate-600">Absent: {student.absentCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-slate-600">Sick: {student.sickCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-slate-600">Leave: {student.leaveCount}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {student.notes && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-orange-800">
                        <strong>Note:</strong> {student.notes}
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
            {searchQuery || statusFilter !== 'all' || riskFilter !== 'all'
              ? 'Try adjusting your filters to see more students.'
              : 'This class doesn\'t have any students yet.'}
          </p>
          {(!searchQuery && statusFilter === 'all' && riskFilter === 'all') && (
            <Button
              onClick={handleAddStudent}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/25 rounded-xl px-6 py-3 font-semibold border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}