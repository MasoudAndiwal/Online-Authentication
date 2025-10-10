'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AppLayout, PageContainer, PageHeader } from '@/components/layout/app-layout'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card'
import { Modern3DIcons } from '@/components/ui/modern-3d-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown,
  GraduationCap,
  Users,
  ArrowLeft,
  Save,
  X,
  Mail,
  User,
  Building,
  Calendar,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

// Sample user for layout
const sampleUser = {
  name: 'Dr. Sarah Ahmed',
  email: 'sarah.ahmed@university.edu',
  role: 'OFFICE' as const,
  avatar: undefined
}

type UserType = 'student' | 'teacher' | null

export default function AddUserPage() {
  const searchParams = useSearchParams()
  const userTypeFromUrl = searchParams.get('type') as UserType
  const [selectedUserType, setSelectedUserType] = React.useState<UserType>(userTypeFromUrl)
  const [showPassword, setShowPassword] = React.useState(false)
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    studentId: '',
    password: '',
    confirmPassword: '',
    joinDate: new Date().toISOString().split('T')[0]
  })

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  const handleSearch = (query: string) => {
    console.log('Search:', query)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', { ...formData, userType: selectedUserType })
  }

  const userTypeOptions = [
    {
      type: 'student' as const,
      title: 'Add Student',
      description: 'Create a new student account',
      icon: <Modern3DIcons.Users3D size="lg" variant="success" />,
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      type: 'teacher' as const,
      title: 'Add Teacher',
      description: 'Create a new teacher account',
      icon: <Modern3DIcons.Users3D size="lg" variant="primary" />,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <AppLayout
      user={sampleUser}
      title="Add User"
      subtitle="User Management System"
      currentPath="/dashboard/user-management/add-user"
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Page Header */}
        <PageHeader
          title="Add New User"
          subtitle="Create a new user account in the system"
          actions={
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={() => handleNavigation('/dashboard/user-management/all-users')}
                className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Users
              </Button>
            </motion.div>
          }
        />

        {!selectedUserType ? (
          /* User Type Selection */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <ModernCard variant="glass" className="border-0 shadow-2xl backdrop-blur-xl bg-white/70">
              <ModernCardHeader className="text-center pb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <Modern3DIcons.Users3D size="xl" className="mx-auto" />
                </motion.div>
                <ModernCardTitle className="text-3xl font-bold mb-4">
                  Select User Type
                </ModernCardTitle>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Choose the type of user account you want to create. Each type has different permissions and access levels.
                </p>
              </ModernCardHeader>

              <ModernCardContent className="px-8 pb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {userTypeOptions.map((option, index) => (
                    <motion.div
                      key={option.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUserType(option.type)}
                      className="group cursor-pointer"
                    >
                      <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${option.gradient} shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
                            backgroundSize: '40px 40px'
                          }} />
                        </div>

                        {/* Floating Orbs */}
                        <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/15 rounded-full blur-lg animate-pulse delay-1000" />

                        <div className="relative z-10 text-white text-center">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="mb-6"
                          >
                            {option.type === 'student' ? (
                              <GraduationCap className="h-16 w-16 mx-auto" />
                            ) : (
                              <Users className="h-16 w-16 mx-auto" />
                            )}
                          </motion.div>

                          <h3 className="text-2xl font-bold mb-3">{option.title}</h3>
                          <p className="text-white/90 text-lg leading-relaxed">
                            {option.description}
                          </p>

                          <motion.div
                            className="mt-6 inline-flex items-center text-white/80 group-hover:text-white transition-colors"
                            whileHover={{ x: 5 }}
                          >
                            <span className="font-semibold">Get Started</span>
                            <ChevronDown className="h-5 w-5 ml-2 rotate-[-90deg]" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Office Role Notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Lock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">Office Role Restriction</h4>
                      <p className="text-purple-700 text-sm">
                        Office role users can only be created by developers through the system backend for security purposes.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        ) : (
          /* User Form */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <ModernCard variant="glass" className="border-0 shadow-2xl backdrop-blur-xl bg-white/70">
              <ModernCardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedUserType(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </motion.button>
                  <div>
                    <ModernCardTitle className="text-2xl font-bold">
                      {selectedUserType === 'student' ? 'Add New Student' : 'Add New Teacher'}
                    </ModernCardTitle>
                    <p className="text-gray-600 mt-1">
                      Fill in the information below to create a new {selectedUserType} account
                    </p>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                  {selectedUserType === 'student' ? (
                    <GraduationCap className="h-8 w-8 text-emerald-600" />
                  ) : (
                    <Users className="h-8 w-8 text-orange-600" />
                  )}
                </motion.div>
              </ModernCardHeader>

              <ModernCardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic/Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      {selectedUserType === 'student' ? 'Academic' : 'Professional'} Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        >
                          <option value="">Select Department</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="English">English</option>
                          <option value="History">History</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {selectedUserType === 'student' ? 'Student ID' : 'Employee ID'} *
                        </label>
                        <Input
                          value={selectedUserType === 'student' ? formData.studentId : formData.employeeId}
                          onChange={(e) => handleInputChange(
                            selectedUserType === 'student' ? 'studentId' : 'employeeId', 
                            e.target.value
                          )}
                          placeholder={`Enter ${selectedUserType === 'student' ? 'student' : 'employee'} ID`}
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-blue-600" />
                      Security Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Enter password"
                            className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300 pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password *
                        </label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder="Confirm password"
                          className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Join Date
                    </h3>
                    <div className="max-w-md">
                      <Input
                        type="date"
                        value={formData.joinDate}
                        onChange={(e) => handleInputChange('joinDate', e.target.value)}
                        className="rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedUserType(null)}
                        className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        className={`rounded-2xl shadow-lg ${
                          selectedUserType === 'student' 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800' 
                            : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                        }`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Create {selectedUserType === 'student' ? 'Student' : 'Teacher'}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        )}
      </PageContainer>
    </AppLayout>
  )
}