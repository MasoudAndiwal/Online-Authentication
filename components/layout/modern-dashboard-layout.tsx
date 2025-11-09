'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from './dashboard-layout'
import { AnimatedSidebar } from './animated-sidebar'
import { DashboardHeader } from './dashboard-header'
import { MobileNavigation } from './mobile-navigation'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  timestamp: Date
  read: boolean
}

interface UserProfile {
  name: string
  email: string
  role: 'OFFICE' | 'TEACHER' | 'STUDENT'
  avatar?: string
}

interface ModernDashboardLayoutProps {
  children: React.ReactNode
  user?: UserProfile
  title?: string
  subtitle?: string
  notifications?: Notification[]
  currentPath?: string
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSearch?: (query: string) => void
  className?: string
  hideHeader?: boolean
  hideSearch?: boolean
  notificationTrigger?: React.ReactNode
}

export function ModernDashboardLayout({
  children,
  user,
  title,
  subtitle,
  notifications = [],
  currentPath,
  onNavigate,
  onLogout,
  onSearch,
  className,
  hideHeader = false,
  hideSearch = false,
  notificationTrigger
}: ModernDashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const handleMenuClick = () => {
    setMobileNavOpen(true)
  }

  const handleMobileNavClose = () => {
    setMobileNavOpen(false)
  }

  const sidebar = (
    <AnimatedSidebar
      user={user}
      currentPath={currentPath}
      onNavigate={onNavigate}
      onLogout={onLogout}
    />
  )

  const header = !hideHeader ? (
    <DashboardHeader
      title={title}
      subtitle={subtitle}
      user={user}
      notifications={notifications}
      onMenuClick={handleMenuClick}
      onLogout={onLogout}
      onSearch={onSearch}
      hideSearch={hideSearch}
      notificationTrigger={notificationTrigger}
    />
  ) : null

  return (
    <>
      <DashboardLayout
        sidebar={sidebar}
        header={header}
        className={className}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </DashboardLayout>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={handleMobileNavClose}
        user={user}
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </>
  )
}

// Export individual components for flexibility
export { DashboardLayout } from './dashboard-layout'
export { AnimatedSidebar } from './animated-sidebar'
export { DashboardHeader } from './dashboard-header'
export { MobileNavigation } from './mobile-navigation'

// Utility components for common layout patterns
interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {children}
    </motion.div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}
    >
      <div>
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-lg text-slate-600 mt-1">{subtitle}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center space-x-3">
          {actions}
        </div>
      )}
    </motion.div>
  )
}

interface GridLayoutProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function GridLayout({ 
  children, 
  cols = 1, 
  gap = 'md', 
  className 
}: GridLayoutProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  const gapClass = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, staggerChildren: 0.1 }}
      className={cn('grid', colsClass[cols], gapClass[gap], className)}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Sample notifications for testing
export const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Attendance Deadline',
    message: '3 teachers haven\'t submitted attendance for today',
    type: 'warning',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false
  },
  {
    id: '2',
    title: 'Medical Certificate',
    message: 'New medical certificate submitted by Ahmad Hassan',
    type: 'info',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false
  },
  {
    id: '3',
    title: 'System Update',
    message: 'Weekly reports have been generated successfully',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true
  },
  {
    id: '4',
    title: 'Student Alert',
    message: '2 students are approaching disqualification threshold',
    type: 'error',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: false
  },
  {
    id: '5',
    title: 'Class Schedule',
    message: 'Schedule updated for Computer Science - Fall 2024',
    type: 'info',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  }
]

// Sample user profiles for testing
export const sampleUsers = {
  office: {
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@university.edu',
    role: 'OFFICE' as const,
    avatar: undefined
  },
  teacher: {
    name: 'Prof. Mohammad Ali',
    email: 'mohammad.ali@university.edu',
    role: 'TEACHER' as const,
    avatar: undefined
  },
  student: {
    name: 'Ahmad Hassan',
    email: 'ahmad.hassan@student.university.edu',
    role: 'STUDENT' as const,
    avatar: undefined
  }
}