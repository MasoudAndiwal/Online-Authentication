'use client'

import * as React from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Home,
  Users,
  Calendar,
  BarChart3,
  Settings,
  BookOpen,
  ClipboardList,
  FileText,
  X,
  ChevronRight,
  Search,
  User,
  LogOut
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

interface UserProfile {
  name: string
  email: string
  role: 'OFFICE' | 'TEACHER' | 'STUDENT'
  avatar?: string
}

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  user?: UserProfile
  currentPath?: string
  onNavigate?: (href: string) => void
  onLogout?: () => void
  className?: string
}

// Role-based navigation (same as AnimatedSidebar)
const getNavigationItems = (role: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    }
  ]

  if (role === 'OFFICE') {
    return [
      ...baseItems,
      {
        label: 'User Management',
        href: '/user-management',
        icon: Users,
        children: [
          { label: 'All Users', href: '/user-management/all-users', icon: Users },
          { label: 'Add User', href: '/user-management/add-user', icon: Users },
          { label: 'Roles & Permissions', href: '/user-management/roles', icon: Settings }
        ]
      },
      {
        label: 'Classes & Schedule',
        href: '/classes',
        icon: Calendar,
        children: [
          { label: 'All Classes', href: '/dashboard/all-classes', icon: BookOpen },
          { label: 'Schedule Builder', href: '/dashboard/schedule', icon: Calendar },
          { label: 'Class Management', href: '/classes/management', icon: Settings }
        ]
      },
      {
        label: 'Attendance',
        href: '/attendance',
        icon: ClipboardList,
        children: [
          { label: 'Overview', href: '/attendance/overview', icon: BarChart3 },
          { label: 'Mark Attendance', href: '/dashboard/mark-attendance', icon: ClipboardList },
          { label: 'Attendance History', href: '/attendance/history', icon: FileText }
        ]
      },
      {
        label: 'Reports & Analytics',
        href: '/reports',
        icon: BarChart3,
        children: [
          { label: 'Weekly Reports', href: '/reports/weekly', icon: FileText },
          { label: 'Student Status', href: '/reports/student-status', icon: Users },
          { label: 'Export Data', href: '/reports/export', icon: BarChart3 }
        ]
      },
      {
        label: 'System Settings',
        href: '/settings',
        icon: Settings,
        children: [
          { label: 'General Settings', href: '/settings/general', icon: Settings },
          { label: 'Academic Calendar', href: '/settings/calendar', icon: Calendar },
          { label: 'Attendance Rules', href: '/settings/attendance-rules', icon: ClipboardList }
        ]
      }
    ]
  }

  if (role === 'TEACHER') {
    return [
      ...baseItems,
      {
        label: 'My Classes',
        href: '/classes',
        icon: BookOpen
      },
      {
        label: 'Attendance',
        href: '/attendance',
        icon: ClipboardList,
        children: [
          { label: 'Mark Attendance', href: '/dashboard/mark-attendance', icon: ClipboardList },
          { label: 'Attendance History', href: '/attendance/history', icon: FileText }
        ]
      },
      {
        label: 'Reports',
        href: '/reports',
        icon: FileText
      }
    ]
  }

  // Student navigation
  return [
    ...baseItems,
    {
      label: 'My Attendance',
      href: '/attendance',
      icon: ClipboardList
    },
    {
      label: 'My Progress',
      href: '/progress',
      icon: BarChart3
    }
  ]
}

const roleColors = {
  OFFICE: {
    bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
    badge: 'bg-purple-100 text-purple-700 border-purple-200'
  },
  TEACHER: {
    bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
    badge: 'bg-orange-100 text-orange-700 border-orange-200'
  },
  STUDENT: {
    bg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
}

export function MobileNavigation({
  isOpen,
  onClose,
  user,
  currentPath = '/dashboard',
  onNavigate,
  onLogout,
  className
}: MobileNavigationProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])
  const navigationItems = user ? getNavigationItems(user.role) : []

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + '/')
  }

  const isExpanded = (href: string) => {
    return expandedItems.includes(href)
  }

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href)
    } else {
      window.location.href = href
    }
    onClose()
  }

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (info.offset.x < -100) {
      onClose()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Search:', searchQuery)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Mobile Navigation Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed left-0 top-0 z-50 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl lg:hidden',
              'border-r border-white/20 overflow-hidden',
              className
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="h-10 w-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <BookOpen className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900">University</h1>
                    <p className="text-sm text-blue-600 font-semibold">AttendanceHub</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-3 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <X className="h-6 w-6 text-slate-600" />
                </motion.button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-slate-200/50">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full bg-slate-50 border-slate-200 focus:bg-white transition-all duration-300"
                  />
                </form>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <MobileNavigationItem
                      item={item}
                      isActive={isActive(item.href)}
                      isExpanded={isExpanded(item.href)}
                      onToggle={() => toggleExpanded(item.href)}
                      onNavigate={handleNavigation}
                      level={0}
                    />
                  </motion.div>
                ))}
              </nav>

              {/* Modern User Profile */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="p-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-blue-50/30 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="relative"
                    >
                      <div className={cn(
                        'h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl relative overflow-hidden',
                        roleColors[user.role].bg
                      )}>
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full hover:translate-x-[-200%] transition-transform duration-1000" />
                        
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="h-12 w-12 rounded-2xl object-cover relative z-10"
                          />
                        ) : (
                          <span className="relative z-10 text-base">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-600 truncate mb-1">
                        {user.email}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs font-semibold border-0 px-2 py-1 rounded-lg',
                          roleColors[user.role].badge
                        )}
                      >
                        {user.role.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/60 text-slate-700 hover:text-slate-900"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/60 text-slate-700 hover:text-slate-900"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </motion.button>
                    
                    {onLogout && (
                      <motion.button
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onLogout()
                          onClose()
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-50/80 text-red-600 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface MobileNavigationItemProps {
  item: NavigationItem
  isActive: boolean
  isExpanded: boolean
  onToggle: () => void
  onNavigate: (href: string) => void
  level: number
}

function MobileNavigationItem({
  item,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
  level
}: MobileNavigationItemProps) {
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (hasChildren) {
            onToggle()
          } else {
            onNavigate(item.href)
          }
        }}
        className={cn(
          'w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
          'hover:bg-white/80 hover:shadow-md active:scale-95',
          isActive && 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
          !isActive && 'text-slate-700',
          level > 0 && 'ml-4 text-xs py-2'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', level > 0 && 'h-4 w-4')} />
        <span className="flex-1 text-left">{item.label}</span>
        
        {item.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'px-2 py-1 text-xs rounded-full font-semibold',
              isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-blue-100 text-blue-700'
            )}
          >
            {item.badge}
          </motion.span>
        )}
        
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 space-y-1"
          >
            {item.children?.map((child, index) => (
              <motion.div
                key={child.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <MobileNavigationItem
                  item={child}
                  isActive={child.href === window.location.pathname}
                  isExpanded={false}
                  onToggle={() => {}}
                  onNavigate={onNavigate}
                  level={level + 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}