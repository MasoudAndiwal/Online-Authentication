'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AppLayout, PageContainer, PageHeader } from '@/components/layout/app-layout'
import { ModernCard, ModernCardContent } from '@/components/ui/modern-card'
import { Modern3DIcons } from '@/components/ui/modern-3d-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Filter, 
  Download, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Sample user data
const sampleUsers = [
  {
    id: '1',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@university.edu',
    role: 'OFFICE',
    department: 'Administration',
    joinDate: '2023-01-15',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 123-4567',
    lastLogin: '2024-01-15 09:30 AM'
  },
  {
    id: '2',
    name: 'Prof. Mohammad Ali',
    email: 'mohammad.ali@university.edu',
    role: 'TEACHER',
    department: 'Computer Science',
    joinDate: '2023-03-20',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 234-5678',
    lastLogin: '2024-01-15 08:45 AM'
  },
  {
    id: '3',
    name: 'Ahmad Hassan',
    email: 'ahmad.hassan@student.university.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    joinDate: '2023-09-01',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 345-6789',
    lastLogin: '2024-01-15 10:15 AM'
  },
  {
    id: '4',
    name: 'Fatima Khan',
    email: 'fatima.khan@student.university.edu',
    role: 'STUDENT',
    department: 'Mathematics',
    joinDate: '2023-09-01',
    status: 'inactive',
    avatar: null,
    phone: '+1 (555) 456-7890',
    lastLogin: '2024-01-10 02:20 PM'
  },
  {
    id: '5',
    name: 'Dr. Omar Rashid',
    email: 'omar.rashid@university.edu',
    role: 'TEACHER',
    department: 'Physics',
    joinDate: '2022-08-15',
    status: 'active',
    avatar: null,
    phone: '+1 (555) 567-8901',
    lastLogin: '2024-01-15 07:30 AM'
  }
]

const roleColors: Record<string, { bg: string; badge: string; text: string }> = {
  OFFICE: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    text: 'text-purple-600'
  },
  TEACHER: {
    bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    text: 'text-orange-600'
  },
  STUDENT: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    text: 'text-emerald-600'
  }
}

// Sample user for layout
const sampleUser = {
  name: 'Dr. Sarah Ahmed',
  email: 'sarah.ahmed@university.edu',
  role: 'OFFICE' as const,
  avatar: undefined
}

export default function AllUsersPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedRole, setSelectedRole] = React.useState('all')
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const router = useRouter()

  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesRole && matchesStatus
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

  return (
    <AppLayout
      user={sampleUser}
      title="All Users"
      subtitle="User Management System"
      currentPath="/user-management/all-users"
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Page Header */}
        <PageHeader
          title="All Users"
          subtitle="Manage and view all system users"
          actions={
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => handleNavigation('/user-management/add-user')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-2xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </motion.div>
            </div>
          }
        />

        {/* Filters and Search */}
        <ModernCard variant="glass" className="border-0 shadow-xl backdrop-blur-xl bg-white/70">
          <ModernCardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300"
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300 min-w-[140px]"
              >
                <option value="all">All Roles</option>
                <option value="OFFICE">Office</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-2xl border-0 bg-white/80 focus:bg-white shadow-lg focus:shadow-xl transition-all duration-300 min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button variant="outline" className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <UserCard user={user} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Modern3DIcons.Users3D size="xl" className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <Button 
              onClick={() => handleNavigation('/user-management/add-user')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </motion.div>
        )}
      </PageContainer>
    </AppLayout>
  )
}

// User Card Component
function UserCard({ user }: { user: typeof sampleUsers[0] }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <ModernCard 
      variant="glass" 
      className="border-0 shadow-xl backdrop-blur-xl bg-white/70 hover:shadow-2xl transition-all duration-300 group hover:scale-[1.02]"
    >
      <ModernCardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${roleColors[user.role].bg}`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-2xl object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </motion.button>

            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-10"
              >
                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <Edit className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Edit User</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delete User</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${roleColors[user.role].badge} font-semibold`}>
              {user.role.toLowerCase()}
            </Badge>
            <Badge 
              variant="outline" 
              className={user.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}
            >
              {user.status}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{user.department}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last login: {user.lastLogin}
            </p>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  )
}