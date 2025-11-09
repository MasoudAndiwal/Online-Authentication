'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Edit,
  Save,
  X,
  Users,
  Calendar,
  MapPin,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Archive,
  Copy,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// Class management data interfaces
export interface ClassInfo {
  id: string
  name: string
  code: string
  description: string
  semester: number
  academicYear: string
  session: 'MORNING' | 'AFTERNOON'
  major: string
  department: string
  credits: number
  capacity: number
  currentEnrollment: number
  status: 'Active' | 'Inactive' | 'Archived'
  startDate: Date
  endDate: Date
  room: string
  building: string
  teacherId: string
  teacherName: string
  assistantTeachers: string[]
  prerequisites: string[]
  syllabus?: string
  materials: string[]
  gradingPolicy: string
  attendancePolicy: string
  isPublished: boolean
  allowSelfEnrollment: boolean
  requireApproval: boolean
  maxAbsences: number
  passingGrade: number
  createdAt: Date
  updatedAt: Date
}

interface ClassManageDashboardProps {
  classId: string
  className?: string
}

export function ClassManageDashboard({ classId, className }: ClassManageDashboardProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'basic' | 'settings' | 'policies' | 'advanced'>('basic')

  // Mock class data - will be replaced with actual API calls
  const [classInfo, setClassInfo] = React.useState<ClassInfo>({
    id: classId,
    name: 'Computer Science Fundamentals',
    code: 'CS101',
    description: 'Introduction to fundamental concepts in computer science including programming, algorithms, and data structures.',
    semester: 1,
    academicYear: '2024-2025',
    session: 'MORNING',
    major: 'Computer Science',
    department: 'Engineering',
    credits: 3,
    capacity: 30,
    currentEnrollment: 28,
    status: 'Active',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    room: 'A-204',
    building: 'Engineering Building',
    teacherId: 'T001',
    teacherName: 'Dr. Ahmed Hassan',
    assistantTeachers: ['TA001', 'TA002'],
    prerequisites: ['Math 101', 'Physics 101'],
    materials: ['Textbook: Introduction to Computer Science', 'Lab Manual', 'Online Resources'],
    gradingPolicy: 'Midterm: 30%, Final: 40%, Assignments: 20%, Participation: 10%',
    attendancePolicy: 'Minimum 75% attendance required. More than 25% absences may result in course failure.',
    isPublished: true,
    allowSelfEnrollment: false,
    requireApproval: true,
    maxAbsences: 6,
    passingGrade: 60,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date()
  })

  const [editedInfo, setEditedInfo] = React.useState<ClassInfo>(classInfo)

  const handleEdit = () => {
    setIsEditing(true)
    setEditedInfo({ ...classInfo })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedInfo(classInfo)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setClassInfo(editedInfo)
    setIsEditing(false)
    setIsSaving(false)
  }

  const handleInputChange = (field: keyof ClassInfo, value: any) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeleteClass = async () => {
    console.log('Deleting class:', classId)
    // Implement delete functionality
  }

  const handleArchiveClass = async () => {
    console.log('Archiving class:', classId)
    // Implement archive functionality
  }

  const handleDuplicateClass = async () => {
    console.log('Duplicating class:', classId)
    // Implement duplicate functionality
  }

  const handleExportData = () => {
    console.log('Exporting class data:', classId)
    // Implement export functionality
  }

  const handleImportData = () => {
    console.log('Importing class data:', classId)
    // Implement import functionality
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'Archived':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getEnrollmentStatus = () => {
    const percentage = (classInfo.currentEnrollment / classInfo.capacity) * 100
    if (percentage >= 90) return { color: 'text-red-600', status: 'Nearly Full' }
    if (percentage >= 75) return { color: 'text-orange-600', status: 'High Enrollment' }
    if (percentage >= 50) return { color: 'text-green-600', status: 'Good Enrollment' }
    return { color: 'text-slate-600', status: 'Low Enrollment' }
  }

  const enrollmentStatus = getEnrollmentStatus()

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'policies', label: 'Policies', icon: BookOpen },
    { id: 'advanced', label: 'Advanced', icon: AlertTriangle }
  ]

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
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                    Manage Class
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    Configure and manage settings for {classInfo.name}
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
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleEdit}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-xl shadow-orange-500/25 rounded-2xl px-6 py-3 text-base font-semibold border-0"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Class
                  </Button>
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-2xl px-6 py-3 text-base font-semibold"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Data
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl shadow-green-500/25 rounded-2xl px-6 py-3 text-base font-semibold border-0"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-2xl px-6 py-3 text-base font-semibold"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Class Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/25">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Enrollment
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {classInfo.currentEnrollment}/{classInfo.capacity}
                </p>
                <p className={cn('text-xs font-medium', enrollmentStatus.color)}>
                  {enrollmentStatus.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Semester
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {classInfo.semester}
                </p>
                <p className="text-xs text-slate-600">
                  {classInfo.academicYear}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-500/25">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Credits
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {classInfo.credits}
                </p>
                <p className="text-xs text-slate-600">
                  Credit Hours
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  Status
                </p>
                <Badge className={cn('border-2 mt-1', getStatusBadgeColor(classInfo.status))}>
                  {classInfo.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg border-0"
      >
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.div
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 border-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'basic' && (
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Class Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedInfo.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Class Code</Label>
                    {isEditing ? (
                      <Input
                        value={editedInfo.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.code}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Major</Label>
                    {isEditing ? (
                      <Input
                        value={editedInfo.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.major}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Department</Label>
                    {isEditing ? (
                      <Input
                        value={editedInfo.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.department}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Session</Label>
                    {isEditing ? (
                      <Select
                        value={editedInfo.session}
                        onValueChange={(value) => handleInputChange('session', value)}
                      >
                        <SelectTrigger className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MORNING">Morning</SelectItem>
                          <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.session}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Credits</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedInfo.credits}
                        onChange={(e) => handleInputChange('credits', parseInt(e.target.value))}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.credits}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Capacity</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedInfo.capacity}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.capacity}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Room</Label>
                    {isEditing ? (
                      <Input
                        value={editedInfo.room}
                        onChange={(e) => handleInputChange('room', e.target.value)}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.room}, {classInfo.building}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-semibold text-slate-700">Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editedInfo.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                    rows={4}
                  />
                ) : (
                  <p className="mt-1 text-slate-700">{classInfo.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Class Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Published</Label>
                    <p className="text-xs text-slate-600 mt-1">Make this class visible to students</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedInfo.isPublished : classInfo.isPublished}
                    onCheckedChange={(checked) => isEditing && handleInputChange('isPublished', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Allow Self Enrollment</Label>
                    <p className="text-xs text-slate-600 mt-1">Students can enroll themselves</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedInfo.allowSelfEnrollment : classInfo.allowSelfEnrollment}
                    onCheckedChange={(checked) => isEditing && handleInputChange('allowSelfEnrollment', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Require Approval</Label>
                    <p className="text-xs text-slate-600 mt-1">Enrollment requires teacher approval</p>
                  </div>
                  <Switch
                    checked={isEditing ? editedInfo.requireApproval : classInfo.requireApproval}
                    onCheckedChange={(checked) => isEditing && handleInputChange('requireApproval', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Maximum Absences</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedInfo.maxAbsences}
                        onChange={(e) => handleInputChange('maxAbsences', parseInt(e.target.value))}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.maxAbsences}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700">Passing Grade</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedInfo.passingGrade}
                        onChange={(e) => handleInputChange('passingGrade', parseInt(e.target.value))}
                        className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      />
                    ) : (
                      <p className="mt-1 text-slate-900 font-medium">{classInfo.passingGrade}%</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'policies' && (
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Policies & Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-slate-700">Grading Policy</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedInfo.gradingPolicy}
                      onChange={(e) => handleInputChange('gradingPolicy', e.target.value)}
                      className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-slate-700">{classInfo.gradingPolicy}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Attendance Policy</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedInfo.attendancePolicy}
                      onChange={(e) => handleInputChange('attendancePolicy', e.target.value)}
                      className="mt-1 border-0 bg-slate-50 focus:bg-white rounded-xl"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-slate-700">{classInfo.attendancePolicy}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Prerequisites</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {classInfo.prerequisites.map((prereq, index) => (
                      <Badge key={index} className="bg-orange-100 text-orange-700 border-orange-200">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700">Course Materials</Label>
                  <div className="mt-2 space-y-2">
                    {classInfo.materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-700">
                        <BookOpen className="h-4 w-4 text-orange-600" />
                        {material}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'advanced' && (
          <Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-xl">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Advanced Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleDuplicateClass}
                    variant="outline"
                    className="h-16 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl text-left justify-start"
                  >
                    <Copy className="h-5 w-5 mr-3 text-blue-600" />
                    <div>
                      <p className="font-semibold">Duplicate Class</p>
                      <p className="text-xs text-slate-600">Create a copy of this class</p>
                    </div>
                  </Button>

                  <Button
                    onClick={handleImportData}
                    variant="outline"
                    className="h-16 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl text-left justify-start"
                  >
                    <Upload className="h-5 w-5 mr-3 text-green-600" />
                    <div>
                      <p className="font-semibold">Import Data</p>
                      <p className="text-xs text-slate-600">Import students or schedule</p>
                    </div>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-16 border-0 bg-slate-50 hover:bg-slate-100 rounded-xl text-left justify-start"
                      >
                        <Archive className="h-5 w-5 mr-3 text-orange-600" />
                        <div>
                          <p className="font-semibold">Archive Class</p>
                          <p className="text-xs text-slate-600">Archive this class</p>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive Class</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to archive this class? Archived classes are read-only and cannot be modified.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveClass}>
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-16 border-0 bg-red-50 hover:bg-red-100 rounded-xl text-left justify-start"
                      >
                        <Trash2 className="h-5 w-5 mr-3 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-700">Delete Class</p>
                          <p className="text-xs text-red-600">Permanently delete this class</p>
                        </div>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Class</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this class? This action cannot be undone and will permanently remove all class data, including student records and attendance history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteClass}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-800">Important Notice</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Advanced actions may have permanent effects on your class data. Please ensure you have proper backups before proceeding with destructive operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}