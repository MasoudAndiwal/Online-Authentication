"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  Clock,
  MapPin,
  TrendingUp,
  CheckCircle,
  Eye,
  MoreVertical,
  Settings,
  Calendar,
  FileText,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Class } from "@/lib/stores/teacher-dashboard-store";

interface TeacherClassCardProps {
  classData: Class;
  onMarkAttendance?: (classId: string) => void;
  onViewDetails?: (classId: string) => void;
  onViewStudents?: (classId: string) => void;
  onViewReports?: (classId: string) => void;
  onViewSchedule?: (classId: string) => void;
  onManageClass?: (classId: string) => void;
  className?: string;
}

export function TeacherClassCard({ 
  classData, 
  onMarkAttendance,
  onViewDetails,
  onViewStudents,
  onViewReports,
  onViewSchedule,
  onManageClass,
  className 
}: TeacherClassCardProps) {
  // Get next session info
  const getNextSession = () => {
    if (classData.nextSession) {
      const now = new Date();
      const nextSession = new Date(classData.nextSession);
      const isToday = nextSession.toDateString() === now.toDateString();
      const isTomorrow = nextSession.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
      
      let dayText = '';
      if (isToday) dayText = 'Today';
      else if (isTomorrow) dayText = 'Tomorrow';
      else dayText = nextSession.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const timeText = nextSession.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      return `${dayText} ${timeText}`;
    }
    return 'No upcoming session';
  };

  // Get room from schedule
  const getRoom = () => {
    if (classData.schedule && classData.schedule.length > 0) {
      return classData.schedule[0].room;
    }
    return 'TBA';
  };

  // Format attendance rate
  const formatAttendanceRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  // Get attendance rate color
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      }}
      className={cn("group", className)}
    >
      <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 overflow-hidden relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 w-16 h-16 bg-orange-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-8 w-12 h-12 bg-orange-500/20 rounded-full blur-lg" />
        </div>

        <CardContent className="p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <motion.div
                className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl shadow-orange-500/25"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <BookOpen className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {classData.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>Room: {getRoom()}</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Dropdown Menu with Smooth Animations */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-orange-100 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-orange-500/20"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 fade-in-0 zoom-in-95 duration-300"
                sideOffset={12}
              >
                {onViewStudents && (
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => onViewStudents(classData.id)}
                      className="rounded-xl hover:bg-orange-50 cursor-pointer transition-all duration-200 py-3 px-4 mx-1 my-1 group/item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Users className="h-4 w-4 mr-3 text-orange-600 group-hover/item:text-orange-700" />
                      </motion.div>
                      <span className="font-medium text-slate-700 group-hover/item:text-slate-900">View Students</span>
                    </DropdownMenuItem>
                  </motion.div>
                )}
                {onViewReports && (
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => onViewReports(classData.id)}
                      className="rounded-xl hover:bg-orange-50 cursor-pointer transition-all duration-200 py-3 px-4 mx-1 my-1 group/item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <TrendingUp className="h-4 w-4 mr-3 text-orange-600 group-hover/item:text-orange-700" />
                      </motion.div>
                      <span className="font-medium text-slate-700 group-hover/item:text-slate-900">View Reports</span>
                    </DropdownMenuItem>
                  </motion.div>
                )}
                {onViewSchedule && (
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => onViewSchedule(classData.id)}
                      className="rounded-xl hover:bg-orange-50 cursor-pointer transition-all duration-200 py-3 px-4 mx-1 my-1 group/item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Calendar className="h-4 w-4 mr-3 text-orange-600 group-hover/item:text-orange-700" />
                      </motion.div>
                      <span className="font-medium text-slate-700 group-hover/item:text-slate-900">View Schedule</span>
                    </DropdownMenuItem>
                  </motion.div>
                )}
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200/60 to-transparent my-2" />
                {onManageClass && (
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <DropdownMenuItem 
                      onClick={() => onManageClass(classData.id)}
                      className="rounded-xl hover:bg-orange-50 cursor-pointer transition-all duration-200 py-3 px-4 mx-1 my-1 group/item"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <Settings className="h-4 w-4 mr-3 text-orange-600 group-hover/item:text-orange-700" />
                      </motion.div>
                      <span className="font-medium text-slate-700 group-hover/item:text-slate-900">Manage Class</span>
                    </DropdownMenuItem>
                  </motion.div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Enhanced Stats Grid with Hover Effects */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-0 cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewStudents?.(classData.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Users className="h-4 w-4 text-orange-600" />
                </motion.div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Students</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{classData.studentCount}</p>
            </motion.div>
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-0 cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewReports?.(classData.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </motion.div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Attendance</span>
              </div>
              <p className={cn("text-2xl font-bold", getAttendanceRateColor(classData.attendanceRate))}>
                {formatAttendanceRate(classData.attendanceRate)}
              </p>
            </motion.div>
          </div>

          {/* Enhanced Next Session with Click Action */}
          <motion.div 
            className="flex items-center gap-3 mb-6 p-3 bg-white/40 backdrop-blur-sm rounded-xl border-0 cursor-pointer transition-all duration-200 hover:bg-white/60 hover:shadow-md"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onViewSchedule?.(classData.id)}
          >
            <motion.div 
              className="p-2 bg-orange-100 rounded-lg"
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Clock className="h-4 w-4 text-orange-600" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Next Session</p>
              <p className="text-sm font-bold text-slate-900">{getNextSession()}</p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar className="h-4 w-4 text-slate-400" />
            </motion.div>
          </motion.div>

          {/* Enhanced Quick Access Toolbar - Slides in on Hover */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ 
              opacity: 0, 
              y: -10, 
              scale: 0.9,
              transition: { duration: 0.2 }
            }}
            className="absolute top-4 left-4 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
            style={{
              transform: 'translateY(-10px) scale(0.9)',
            }}
          >
            <style jsx>{`
              .group:hover .quick-toolbar {
                opacity: 1 !important;
                transform: translateY(0) scale(1) !important;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
              }
            `}</style>
            <div className="quick-toolbar flex gap-2 transition-all duration-300">
              {onMarkAttendance && (
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAttendance(classData.id);
                    }}
                    className="h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 shadow-lg hover:shadow-xl border-0 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-green-500/20"
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Mark
                  </Button>
                </motion.div>
              )}
              {onViewReports && (
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewReports(classData.id);
                    }}
                    className="h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-lg hover:shadow-xl border-0 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-blue-500/20"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Reports
                  </Button>
                </motion.div>
              )}
              {onViewDetails && (
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(classData.id);
                    }}
                    className="h-8 px-3 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-lg hover:shadow-xl border-0 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-orange-500/20"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Main Action Buttons */}
          <div className="flex gap-3">
            {onMarkAttendance && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => onMarkAttendance(classData.id)}
                  className="w-full h-11 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </div>
                </Button>
              </motion.div>
            )}
            
            {onViewDetails && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => onViewDetails(classData.id)}
                  className="w-full h-11 bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm border-0 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Class
                  </div>
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}