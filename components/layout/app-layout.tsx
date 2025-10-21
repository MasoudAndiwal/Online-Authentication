'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from './dashboard-header'

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

interface AppLayoutProps {
  children: React.ReactNode
  user?: UserProfile
  title?: string
  subtitle?: string
  notifications?: Notification[]
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onSearch?: (query: string) => void
  className?: string
}

export function AppLayout({
  children,
  user,
  title,
  subtitle,
  notifications = [],
  onNavigate,
  onLogout,
  onSearch,
  className
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <SidebarInset>
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          user={user}
          notifications={notifications}
          onLogout={onLogout}
          onSearch={onSearch}
        />
        <main className={cn('flex-1 overflow-auto', className)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Re-export utility components from modern-dashboard-layout for backward compatibility
export { PageContainer, PageHeader, GridLayout } from './modern-dashboard-layout'

// Re-export sample data for testing
export { sampleNotifications, sampleUsers } from './modern-dashboard-layout'