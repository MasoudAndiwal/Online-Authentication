'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function DashboardLayout({
  children,
  sidebar,
  header,
  className
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/20',
      className
    )}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebar && (
          <motion.aside
            initial={isMobile ? { x: '-100%' } : { x: 0 }}
            animate={{
              x: isMobile ? (sidebarOpen ? 0 : '-100%') : 0
            }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              stiffness: 300, 
              damping: 30,
              duration: 0.3
            }}
            className={cn(
              'fixed left-0 top-0 z-50 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-xl',
              !isMobile && 'lg:fixed lg:z-50'
            )}
          >
            {sidebar}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn(
        'flex flex-col min-h-screen transition-all duration-300',
        sidebar && !isMobile && 'ml-64'
      )}>
        {/* Header */}
        {header && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
          >
            {React.cloneElement(header as React.ReactElement, {
              onMenuClick: () => setSidebarOpen(true),
              isMobile
            })}
          </motion.header>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}