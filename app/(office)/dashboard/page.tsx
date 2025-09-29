'use client'
import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  UserPlus,
  FileBarChart,
  Settings,
  Award,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { AnimatedStatusBadge } from '@/components/ui/animated-status-badge'
import { ProgressIndicator } from '@/components/ui/progress-indicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import OfficeDashboardLayout from '@/components/layout/office-dashboard-layout'

// Mock data for demonstration
const mockUser = {
  name: 'Ahmad Hassan',
  email: 'ahmad.hassan@university.edu',
  role: 'OFFICE' as const,
  avatar: undefined
}

const mockMetrics = {
  totalUsers: 1247,
  activeClasses: 45,
  attendanceRate: 94.2,
  disqualifiedStudents: 8,
  certificationRequired: 15
}

const mockAlerts = [
  {
    id: '1',
    message: '3 students approaching محروم threshold',
    action: 'Review Students',
    severity: 'warning' as const,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    message: '5 medical certificates pending review',
    action: 'Review Certificates',
    severity: 'info' as const,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    message: '2 teachers haven\'t submitted attendance this week',
    action: 'Send Reminder',
    severity: 'warning' as const,
    timestamp: '1 day ago'
  }
]

const mockRecentActivity = [
  {
    id: '1',
    type: 'user_created',
    message: 'New teacher account created for Sara Ahmed',
    timestamp: '10 minutes ago',
    icon: UserPlus
  },
  {
    id: '2',
    type: 'attendance_submitted',
    message: 'Class 10-A attendance submitted by Omar Khan',
    timestamp: '25 minutes ago',
    icon: CheckCircle
  },
  {
    id: '3',
    type: 'certificate_uploaded',
    message: 'Medical certificate uploaded by student Ali Hassan',
    timestamp: '1 hour ago',
    icon: FileText
  },
  {
    id: '4',
    type: 'report_generated',
    message: 'Weekly attendance report generated',
    timestamp: '2 hours ago',
    icon: FileBarChart
  }
]

function AlertItem({ 
  message, 
  action, 
  severity, 
  timestamp 
}: { 
  message: string
  action: string
  severity: 'warning' | 'info' | 'error'
  timestamp: string
}) {
  const severityConfig = {
    warning: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    info: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    error: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
  }

  const config = severityConfig[severity]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-3 rounded-lg border ${config.bg} ${config.border}`}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{message}</p>
        <p className="text-xs text-slate-500 mt-1">{timestamp}</p>
      </div>
      <Button size="sm" variant="outline" className={`${config.color} hover:${config.bg}`}>
        {action}
      </Button>
    </motion.div>
  )
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        className="h-20 flex-col space-y-2 bg-white/60 hover:bg-white hover:shadow-md transition-all duration-200"
        onClick={onClick}
      >
        <Icon className="h-6 w-6 text-blue-600" />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </motion.div>
  )
}

function ActivityItem({ 
  type, 
  message, 
  timestamp, 
  icon: Icon 
}: {
  type: string
  message: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors duration-200"
    >
      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Icon className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{message}</p>
        <p className="text-xs text-slate-500">{timestamp}</p>
      </div>
    </motion.div>
  )
}

export default function OfficeDashboardPage() {
  return (
    <OfficeDashboardLayout user={mockUser} currentPage="/office/dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {mockUser.name}! 👋
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your university attendance system today.
          </p>
        </motion.div>

        {/* Metrics Cards Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <MetricCard
            title="Total Users"
            value={mockMetrics.totalUsers.toLocaleString()}
            icon={Users}
            trend="+12%"
            trendDirection="up"
            color="blue"
          />
          <MetricCard
            title="Active Classes"
            value={mockMetrics.activeClasses}
            icon={BookOpen}
            trend="+3"
            trendDirection="up"
            color="emerald"
          />
          <MetricCard
            title="Attendance Rate"
            value={`${mockMetrics.attendanceRate}%`}
            icon={CheckCircle}
            trend="+2.1%"
            trendDirection="up"
            color="green"
          />
          <MetricCard
            title="محروم Students"
            value={mockMetrics.disqualifiedStudents}
            icon={AlertTriangle}
            trend="-2"
            trendDirection="down"
            color="red"
          />
          <MetricCard
            title="تصدیق طلب"
            value={mockMetrics.certificationRequired}
            icon={FileText}
            trend="+5"
            trendDirection="up"
            color="orange"
          />
        </motion.div>

        {/* Charts and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Trends */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Weekly Attendance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Present</span>
                    <span className="text-sm font-bold text-green-600">85%</span>
                  </div>
                  <ProgressIndicator percentage={85} color="green" animated />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Absent</span>
                    <span className="text-sm font-bold text-red-600">8%</span>
                  </div>
                  <ProgressIndicator percentage={8} color="red" animated />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Sick</span>
                    <span className="text-sm font-bold text-yellow-600">4%</span>
                  </div>
                  <ProgressIndicator percentage={4} color="yellow" animated />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Leave</span>
                    <span className="text-sm font-bold text-blue-600">3%</span>
                  </div>
                  <ProgressIndicator percentage={3} color="blue" animated />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickActionButton 
                    icon={UserPlus} 
                    label="Add User" 
                    onClick={() => window.location.href = '/office/users/add'}
                  />
                  <QuickActionButton 
                    icon={FileBarChart} 
                    label="Generate Report" 
                    onClick={() => window.location.href = '/office/reports'}
                  />
                  <QuickActionButton 
                    icon={Settings} 
                    label="System Settings" 
                    onClick={() => window.location.href = '/office/settings'}
                  />
                  <QuickActionButton 
                    icon={Award} 
                    label="Review Certs" 
                    onClick={() => window.location.href = '/office/certifications'}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Critical Alerts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-800">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Critical Alerts
                  <AnimatedStatusBadge 
                    status="تصدیق_طلب" 
                    size="sm" 
                    className="ml-2"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <AlertItem {...alert} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockRecentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <ActivityItem {...activity} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Today's Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AnimatedStatusBadge status="present" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">1,156</p>
                  <p className="text-sm text-slate-600">Present Today</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AnimatedStatusBadge status="absent" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">91</p>
                  <p className="text-sm text-slate-600">Absent Today</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AnimatedStatusBadge status="محروم" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">8</p>
                  <p className="text-sm text-slate-600">محروم Status</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AnimatedStatusBadge status="تصدیق_طلب" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">15</p>
                  <p className="text-sm text-slate-600">Need Certification</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </OfficeDashboardLayout>
  )
}