'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AppLayout, PageContainer, PageHeader } from '@/components/layout/app-layout'
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from '@/components/ui/modern-card'
import { Modern3DIcons } from '@/components/ui/modern-3d-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Users,
  Settings,
  Eye,
  Edit,
  Plus,
  X,
  Lock,
  Crown,
  GraduationCap,
  BookOpen,
  BarChart3,
  FileText,
  UserCheck
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Sample user for layout
const sampleUser = {
  name: 'Dr. Sarah Ahmed',
  email: 'sarah.ahmed@university.edu',
  role: 'OFFICE' as const,
  avatar: undefined
}

// Role definitions with permissions
const roleDefinitions = [
  {
    id: 'office',
    name: 'Office Administrator',
    description: 'Full system access with administrative privileges',
    color: 'purple',
    icon: <Crown className="h-6 w-6" />,
    userCount: 3,
    permissions: {
      userManagement: { read: true, write: true, delete: true },
      classManagement: { read: true, write: true, delete: true },
      attendanceManagement: { read: true, write: true, delete: true },
      reportGeneration: { read: true, write: true, delete: true },
      systemSettings: { read: true, write: true, delete: true },
      dataExport: { read: true, write: true, delete: false }
    }
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Access to class and attendance management',
    color: 'orange',
    icon: <Users className="h-6 w-6" />,
    userCount: 45,
    permissions: {
      userManagement: { read: false, write: false, delete: false },
      classManagement: { read: true, write: true, delete: false },
      attendanceManagement: { read: true, write: true, delete: false },
      reportGeneration: { read: true, write: false, delete: false },
      systemSettings: { read: false, write: false, delete: false },
      dataExport: { read: true, write: false, delete: false }
    }
  },
  {
    id: 'student',
    name: 'Student',
    description: 'View-only access to personal attendance and progress',
    color: 'emerald',
    icon: <GraduationCap className="h-6 w-6" />,
    userCount: 1247,
    permissions: {
      userManagement: { read: false, write: false, delete: false },
      classManagement: { read: true, write: false, delete: false },
      attendanceManagement: { read: true, write: false, delete: false },
      reportGeneration: { read: true, write: false, delete: false },
      systemSettings: { read: false, write: false, delete: false },
      dataExport: { read: false, write: false, delete: false }
    }
  }
]

const permissionCategories = [
  {
    id: 'userManagement',
    name: 'User Management',
    description: 'Create, edit, and delete user accounts',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'classManagement',
    name: 'Class Management',
    description: 'Manage classes, schedules, and assignments',
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: 'attendanceManagement',
    name: 'Attendance Management',
    description: 'Mark and manage student attendance',
    icon: <UserCheck className="h-5 w-5" />
  },
  {
    id: 'reportGeneration',
    name: 'Report Generation',
    description: 'Generate and view system reports',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'systemSettings',
    name: 'System Settings',
    description: 'Configure system-wide settings',
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 'dataExport',
    name: 'Data Export',
    description: 'Export data and generate backups',
    icon: <FileText className="h-5 w-5" />
  }
]

const roleColors = {
  purple: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    light: 'bg-purple-50',
    border: 'border-purple-200'
  },
  orange: {
    bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    light: 'bg-orange-50',
    border: 'border-orange-200'
  },
  emerald: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    light: 'bg-emerald-50',
    border: 'border-emerald-200'
  }
}

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null)
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    console.log('Logout clicked')
  }

  const handleSearch = (query: string) => {
    console.log('Search:', query)
  }

  const getPermissionIcon = (permission: { read: boolean; write: boolean; delete: boolean }) => {
    if (permission.read && permission.write && permission.delete) {
      return <Shield className="h-4 w-4 text-green-600" />
    } else if (permission.read && permission.write) {
      return <Edit className="h-4 w-4 text-blue-600" />
    } else if (permission.read) {
      return <Eye className="h-4 w-4 text-gray-600" />
    } else {
      return <X className="h-4 w-4 text-red-600" />
    }
  }

  const getPermissionText = (permission: { read: boolean; write: boolean; delete: boolean }) => {
    if (permission.read && permission.write && permission.delete) {
      return 'Full Access'
    } else if (permission.read && permission.write) {
      return 'Read & Write'
    } else if (permission.read) {
      return 'Read Only'
    } else {
      return 'No Access'
    }
  }

  return (
    <AppLayout
      user={sampleUser}
      title="Roles & Permissions"
      subtitle="User Management System"
      currentPath="/user-management/roles"
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Page Header */}
        <PageHeader
          title="Roles & Permissions"
          subtitle="Manage user roles and their system permissions"
          actions={
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-2xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </motion.div>
            </div>
          }
        />

        {/* Roles Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {roleDefinitions.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <RoleCard 
                role={role} 
                onSelect={() => setSelectedRole(role.id)}
                isSelected={selectedRole === role.id}
              />
            </motion.div>
          ))}
        </div>

        {/* Permissions Matrix */}
        <ModernCard variant="glass" className="border-0 shadow-2xl backdrop-blur-xl bg-white/70">
          <ModernCardHeader>
            <ModernCardTitle className="text-2xl font-bold flex items-center">
              <Modern3DIcons.Settings3D size="lg" className="mr-3" />
              Permissions Matrix
            </ModernCardTitle>
            <p className="text-gray-600 mt-2">
              Detailed view of permissions for each role in the system
            </p>
          </ModernCardHeader>

          <ModernCardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-6 font-semibold text-gray-900">Permission</th>
                    {roleDefinitions.map((role) => (
                      <th key={role.id} className="text-center p-6 font-semibold text-gray-900 min-w-[150px]">
                        <div className="flex flex-col items-center space-y-2">
                          <div className={`p-2 rounded-xl ${roleColors[role.color as keyof typeof roleColors].light}`}>
                            {role.icon}
                          </div>
                          <span>{role.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionCategories.map((category, index) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                      </td>
                      {roleDefinitions.map((role) => (
                        <td key={role.id} className="p-6 text-center">
                          <div className="flex flex-col items-center space-y-2">
                            {getPermissionIcon(role.permissions[category.id as keyof typeof role.permissions])}
                            <span className="text-xs font-medium text-gray-600">
                              {getPermissionText(role.permissions[category.id as keyof typeof role.permissions])}
                            </span>
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-100 rounded-2xl">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Security Notice</h3>
              <div className="space-y-2 text-red-800">
                <p>• Office Administrator role can only be assigned by system developers</p>
                <p>• Role changes require administrative approval and system restart</p>
                <p>• All permission changes are logged and audited for security purposes</p>
                <p>• Users will be notified of any changes to their role permissions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </AppLayout>
  )
}

// Role Card Component
function RoleCard({ 
  role, 
  onSelect, 
  isSelected 
}: { 
  role: typeof roleDefinitions[0]
  onSelect: () => void
  isSelected: boolean
}) {
  const colors = roleColors[role.color as keyof typeof roleColors]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`cursor-pointer transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      <ModernCard 
        variant="glass" 
        className={`border-0 shadow-xl backdrop-blur-xl bg-white/70 hover:shadow-2xl transition-all duration-300 ${
          isSelected ? 'bg-blue-50/70' : ''
        }`}
      >
        <ModernCardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-3 rounded-2xl ${colors.bg} shadow-lg`}
              >
                <div className="text-white">
                  {role.icon}
                </div>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            </div>
            {role.id === 'office' && (
              <div className="p-1 bg-yellow-100 rounded-lg">
                <Lock className="h-4 w-4 text-yellow-600" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Active Users</span>
              <Badge variant="outline" className={`${colors.badge} font-semibold`}>
                {role.userCount.toLocaleString()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Permission Level</span>
                <div className="flex items-center space-x-1">
                  {role.id === 'office' && (
                    <>
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Full Access</span>
                    </>
                  )}
                  {role.id === 'teacher' && (
                    <>
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Limited Access</span>
                    </>
                  )}
                  {role.id === 'student' && (
                    <>
                      <Eye className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600 font-medium">View Only</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {role.id !== 'office' && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl border-0 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl border-0 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            )}

            {role.id === 'office' && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                  <Lock className="h-3 w-3" />
                  <span>Developer access only</span>
                </div>
              </div>
            )}
          </div>
        </ModernCardContent>
      </ModernCard>
    </motion.div>
  )
}