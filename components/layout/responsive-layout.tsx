'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  className
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
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
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed left-0 top-0 z-50 h-full w-64 bg-card border-r border-border',
              'md:relative md:z-auto md:translate-x-0'
            )}
          >
            {/* Mobile close button */}
            {isMobile && (
              <div className="flex justify-end p-4 md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            {sidebar}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={cn('flex flex-col', sidebar && 'md:ml-64')}>
        {/* Header */}
        {header && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Mobile menu button */}
              {sidebar && isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              {header}
            </div>
          </motion.header>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

interface NavigationItem {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
  badge?: string | number
}

interface SidebarNavigationProps {
  items: NavigationItem[]
  title?: string
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
  onLogout?: () => void
}

export function SidebarNavigation({
  items,
  title,
  user,
  onLogout
}: SidebarNavigationProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo/Title */}
      {title && (
        <div className="p-6 border-b border-border">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-foreground"
          >
            {title}
          </motion.h1>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item, index) => (
          <motion.a
            key={item.href}
            href={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              item.active && 'bg-primary text-primary-foreground'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full"
              >
                {item.badge}
              </motion.span>
            )}
          </motion.a>
        ))}
      </nav>

      {/* User section */}
      {user && (
        <div className="p-4 border-t border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-3"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatar ? (
                <div 
                  className="h-10 w-10 rounded-full object-cover bg-cover bg-center"
                  style={{ backgroundImage: `url(${user.avatar})` }}
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.role}
              </p>
            </div>
          </motion.div>
          
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  title?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
  notifications?: number
}

export function Header({
  title,
  actions,
  breadcrumbs,
  notifications = 0
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-4">
        {breadcrumbs && (
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {title && !breadcrumbs && (
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center"
            >
              {notifications > 9 ? '9+' : notifications}
            </motion.span>
          )}
        </Button>

        {actions}
      </div>
    </div>
  )
}

// Grid system components
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Grid({ children, cols = 1, gap = 'md', className }: GridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-12'
  }

  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div className={cn('grid', colsClass[cols], gapClass[gap], className)}>
      {children}
    </div>
  )
}