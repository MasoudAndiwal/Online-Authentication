"use client";

import * as React from "react";
import {
  ModernDashboardLayout,
  PageContainer,
  PageHeader,
  GridLayout,
} from "@/components/layout/modern-dashboard-layout";
import {
  ModernCard,
  ModernCardHeader,
  ModernCardTitle,
  ModernCardContent,
  ModernMetricCard,
  ModernAlertCard,
} from "@/components/ui/modern-card";
import { Modern3DIcons } from "@/components/ui/modern-3d-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Settings,
  Plus,
  Download,
  Clock,
  BarChart3,
  Sparkles,
  Zap,
  Star,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

// Sample user data
const sampleUser = {
  name: "Dr. Sarah Ahmed",
  email: "sarah.ahmed@university.edu",
  role: "OFFICE" as const,
  avatar: undefined,
};

export default function OfficeDashboardPage() {
  const [currentPath, setCurrentPath] = React.useState("/dashboard");

  const handleNavigation = (href: string) => {
    setCurrentPath(href);
    console.log("Navigate to:", href);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  return (
    <ModernDashboardLayout
      user={sampleUser}
      title="Office Dashboard"
      subtitle="University Attendance Management System"
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
    >
      <PageContainer>
        {/* Ultra Modern Welcome Section - NO BORDERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-12 overflow-hidden rounded-3xl"
        >
          {/* Beautiful Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10" />

          {/* Floating Animated Elements */}
          <div className="absolute top-4 right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-4 left-8 w-16 h-16 bg-purple-400/20 rounded-full blur-lg animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-emerald-400/15 rounded-full blur-md animate-pulse delay-500" />

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <motion.div
                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl shadow-blue-500/25"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
                      Welcome back, Dr. Sarah! 👋
                    </h1>
                    <p className="text-xl text-slate-600 font-medium mt-2">
                      Here's what's happening at your university today
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/25 rounded-2xl px-10 py-5 text-lg font-semibold transition-all duration-300 border-0"
                  >
                    <Plus className="h-6 w-6 mr-3" />
                    Quick Add User
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 shadow-lg hover:shadow-xl rounded-2xl px-10 py-5 text-lg font-semibold transition-all duration-300"
                  >
                    <Download className="h-6 w-6 mr-3" />
                    Export Data
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Ultra Modern Metrics Cards - NO BORDERS */}
        <GridLayout cols={4} gap="xl">
          <ModernMetricCard
            title="Total Users"
            value="1,247"
            icon={<Modern3DIcons.Users3D size="lg" variant="primary" />}
            trend="+12%"
            trendLabel="vs last month"
            color="blue"
            className="border-0 shadow-2xl shadow-blue-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Active Classes"
            value="45"
            icon={<Modern3DIcons.Calendar3D size="lg" variant="success" />}
            trend="+3"
            trendLabel="new this term"
            color="emerald"
            className="border-0 shadow-2xl shadow-emerald-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Attendance Rate"
            value="94.2%"
            icon={<Modern3DIcons.Chart3D size="lg" variant="primary" />}
            trend="+2.1%"
            trendLabel="vs last week"
            color="purple"
            className="border-0 shadow-2xl shadow-purple-500/10 bg-white/70 backdrop-blur-xl"
          />
          <ModernMetricCard
            title="Pending Reviews"
            value="23"
            icon={<Modern3DIcons.Clipboard3D size="lg" variant="warning" />}
            trend="+5"
            trendLabel="need attention"
            color="amber"
            className="border-0 shadow-2xl shadow-amber-500/10 bg-white/70 backdrop-blur-xl"
          />
        </GridLayout>

        {/* Ultra Modern Charts and Actions - NO BORDERS */}
        <GridLayout cols={3} gap="xl">
          {/* Beautiful Chart Card */}
          <div className="lg:col-span-2">
            <ModernCard
              variant="glass"
              className="border-0 shadow-2xl shadow-slate-200/20 h-full bg-white/70 backdrop-blur-xl"
            >
              <ModernCardHeader>
                <ModernCardTitle
                  icon={
                    <Modern3DIcons.Chart3D
                      size="lg"
                      variant="primary"
                      animated={true}
                    />
                  }
                  className="text-3xl font-bold"
                >
                  Weekly Attendance Trends
                </ModernCardTitle>
              </ModernCardHeader>
              <ModernCardContent>
                <div className="h-96 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
                  {/* Ultra Beautiful Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 3px 3px, rgb(59 130 246) 2px, transparent 0)`,
                        backgroundSize: "40px 40px",
                      }}
                    />
                  </div>

                  {/* Multiple Floating Orbs */}
                  <div className="absolute top-8 right-12 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-12 left-8 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500" />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="text-center space-y-8">
                      <motion.div
                        animate={{
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Modern3DIcons.Chart3D
                          size="xl"
                          className="mx-auto drop-shadow-2xl"
                        />
                      </motion.div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-slate-800">
                          Interactive Analytics
                        </h3>
                        <p className="text-lg text-slate-600 font-medium">
                          Beautiful charts coming soon
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                          <motion.div
                            className="w-3 h-3 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0,
                            }}
                          />
                          <motion.div
                            className="w-3 h-3 bg-purple-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-3 h-3 bg-emerald-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </div>

          {/* Ultra Modern Quick Actions */}
          <ModernCard
            variant="glass"
            className="border-0 shadow-2xl shadow-slate-200/20 bg-white/70 backdrop-blur-xl"
          >
            <ModernCardHeader>
              <ModernCardTitle
                icon={<Zap className="h-7 w-7 text-amber-500" />}
                className="text-2xl font-bold"
              >
                Quick Actions
              </ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: <Modern3DIcons.Users3D size="md" variant="primary" />,
                    label: "Add New User",
                    desc: "Create student or teacher account",
                    color: "blue",
                  },
                  {
                    icon: (
                      <Modern3DIcons.Clipboard3D size="md" variant="success" />
                    ),
                    label: "Mark Attendance",
                    desc: "Quick attendance entry",
                    color: "emerald",
                  },
                  {
                    icon: <Modern3DIcons.Chart3D size="md" variant="primary" />,
                    label: "View Reports",
                    desc: "Analytics and insights",
                    color: "purple",
                  },
                  {
                    icon: (
                      <Modern3DIcons.Settings3D size="md" variant="secondary" />
                    ),
                    label: "System Settings",
                    desc: "Configure preferences",
                    color: "slate",
                  },
                ].map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.4 }}
                    whileHover={{ scale: 1.03, x: 8 }}
                    whileTap={{ scale: 0.97 }}
                    className="group"
                  >
                    <Button
                      variant="ghost"
                      className="w-full h-auto p-5 justify-start rounded-2xl hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-blue-50/60 transition-all duration-300 border-0 shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="group-hover:scale-110 transition-transform duration-300">
                          {action.icon}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-base">
                            {action.label}
                          </p>
                          <p className="text-sm text-slate-500 group-hover:text-blue-600 transition-colors">
                            {action.desc}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ModernCardContent>
          </ModernCard>
        </GridLayout>

        {/* Ultra Modern Alerts - NO BORDERS */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-xl shadow-amber-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-900">
              Critical Alerts
            </h2>
          </motion.div>

          <div className="grid gap-6">
            {[
              {
                title: "3 students approaching محروم threshold",
                message:
                  "Computer Science - Fall 2024 requires immediate attention for academic standing",
                type: "error" as const,
                action: "Review Students",
              },
              {
                title: "5 medical certificates pending review",
                message:
                  "New submissions from the last 24 hours awaiting administrative approval",
                type: "info" as const,
                action: "Review Certificates",
              },
              {
                title: "2 teachers haven't submitted attendance this week",
                message:
                  "Mathematics and Physics departments need follow-up for weekly reporting",
                type: "warning" as const,
                action: "Send Reminder",
              },
            ].map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <ModernAlertCard
                  title={alert.title}
                  message={alert.message}
                  type={alert.type}
                  className="border-0 shadow-xl backdrop-blur-xl"
                  action={
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-2xl border-0 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      >
                        {alert.action}
                      </Button>
                    </motion.div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ultra Modern Activity Feed - NO BORDERS */}
        <ModernCard
          variant="glass"
          className="border-0 shadow-2xl shadow-slate-200/20 bg-white/70 backdrop-blur-xl"
        >
          <ModernCardHeader>
            <ModernCardTitle
              icon={<Activity className="h-7 w-7 text-emerald-500" />}
              className="text-3xl font-bold"
            >
              Recent Activity
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="space-y-6">
              {[
                {
                  action: "New user created",
                  details: "Ahmad Hassan (Student) - CS-2024-156",
                  time: "5 minutes ago",
                  type: "success",
                  icon: <Users className="h-5 w-5" />,
                },
                {
                  action: "Attendance marked",
                  details: "Computer Science - Fall 2024 (28/30 present)",
                  time: "15 minutes ago",
                  type: "info",
                  icon: <CheckCircle className="h-5 w-5" />,
                },
                {
                  action: "Medical certificate approved",
                  details: "Sara Khan - 3 days sick leave approved",
                  time: "1 hour ago",
                  type: "success",
                  icon: <FileText className="h-5 w-5" />,
                },
                {
                  action: "Schedule updated",
                  details: "Mathematics - Spring 2024 timetable modified",
                  time: "2 hours ago",
                  type: "info",
                  icon: <Calendar className="h-5 w-5" />,
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 12 }}
                  className="group flex items-center gap-6 p-6 rounded-3xl hover:bg-gradient-to-r hover:from-slate-50/60 hover:to-blue-50/40 transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-lg"
                >
                  <motion.div
                    className={`p-4 rounded-3xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                      activity.type === "success"
                        ? "bg-emerald-100 text-emerald-600 group-hover:shadow-emerald-500/20"
                        : "bg-blue-100 text-blue-600 group-hover:shadow-blue-500/20"
                    }`}
                    whileHover={{ rotate: 5 }}
                  >
                    {activity.icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                      {activity.action}
                    </p>
                    <p className="text-base text-slate-600 group-hover:text-slate-700 transition-colors truncate">
                      {activity.details}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-sm bg-white/90 border-0 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all duration-300 rounded-2xl px-4 py-2 font-semibold"
                  >
                    {activity.time}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
