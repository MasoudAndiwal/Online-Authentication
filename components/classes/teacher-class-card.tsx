"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock,MapPin,TrendingUp,CheckCircle,Eye,MoreVertical,Settings,Calendar,FileText,UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Class } from "@/lib/stores/teacher-dashboard-store";
import { useResponsive } from "@/lib/hooks/use-responsive";
import { useHapticFeedback } from "@/lib/hooks/use-touch-gestures";

interface TeacherClassCardProps {
  classData: Class;
  onMarkAttendance?: (classId: string) => void;
  onViewDetails?: (classId: string) => void;
  onViewStudents?: (classId: string) => void;
  onViewReports?: (classId: string) => void;
  onViewSchedule?: (classId: string) => void;
  onManageClass?: (classId: string) => void;
  className?: string;
  isFocused?: boolean;
  tabIndex?: number;
}

export const TeacherClassCard = React.forwardRef<HTMLDivElement, TeacherClassCardProps>(({ 
  classData, 
  onMarkAttendance,
  onViewDetails,
  onViewStudents,
  onViewReports,
  onViewSchedule,
  onManageClass,
  className,
  isFocused = false,
  tabIndex = 0
}, ref) => {
  // Responsive and touch support
  const { isMobile, isTouch } = useResponsive();
  const { lightTap } = useHapticFeedback();
  
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
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={!isMobile ? { 
        scale: 1.02,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      className={cn("group", className)}
      tabIndex={tabIndex}
      role="article"
      aria-label={`${classData.name} class card. ${classData.studentCount} students enrolled. Attendance rate: ${formatAttendanceRate(classData.attendanceRate)}. Next session: ${getNextSession()}`}
      aria-current={isFocused ? 'true' : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (isTouch) lightTap();
          onViewDetails?.(classData.id);
        }
      }}
    >
      <Card className="rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 overflow-hidden relative touch-manipulation">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-8 w-16 h-16 bg-orange-400/20 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-8 w-12 h-12 bg-orange-500/20 rounded-full blur-lg" />
        </div>

        <CardContent className="p-4 sm:p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <motion.div
                className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl shadow-orange-500/25 flex-shrink-0"
                whileHover={!isMobile ? { scale: 1.05, rotate: 5 } : {}}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-1 truncate">
                  {classData.name}
                </h3>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Room: {getRoom()}</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Dropdown Menu with Smooth Animations - Always visible on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "transition-all duration-300 flex-shrink-0",
                    isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTouch) lightTap();
                    }}
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-orange-100 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-orange-500/20 touch-manipulation"
                    aria-label="Class options menu"
                  >
                    <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4 text-slate-600" />
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
                      onClick={() => {
                        onViewStudents(classData.id);
                        toast.success('Loading student list...', {
                          description: `Viewing enrolled students in ${classData.name}`,
                          duration: 2500,
                        });
                      }}
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
                      onClick={() => {
                        onViewReports(classData.id);
                        toast.success('Opening class analytics...', {
                          description: `Loading attendance reports for ${classData.name}`,
                          duration: 2500,
                        });
                      }}
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
                      onClick={() => {
                        onViewSchedule(classData.id);
                        toast.success('Loading class schedule...', {
                          description: `Viewing timetable for ${classData.name}`,
                          duration: 2500,
                        });
                      }}
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
                      onClick={() => {
                        onManageClass(classData.id);
                        toast.success('Opening class management...', {
                          description: `Managing settings for ${classData.name}`,
                          duration: 2500,
                        });
                      }}
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

          {/* Enhanced Stats Grid with Hover Effects and Navigation Feedback - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border-0 cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md touch-manipulation min-h-[72px] sm:min-h-[80px]"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isTouch) lightTap();
                if (onViewStudents) {
                  onViewStudents(classData.id);
                  toast.success('Loading student list...', {
                    description: `${classData.studentCount} students enrolled in ${classData.name}`,
                    duration: 2500,
                  });
                }
              }}
            >
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <motion.div
                  whileHover={!isMobile ? { rotate: 5 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Students</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{classData.studentCount}</p>
            </motion.div>
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border-0 cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md touch-manipulation min-h-[72px] sm:min-h-[80px]"
              whileHover={!isMobile ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isTouch) lightTap();
                if (onViewReports) {
                  onViewReports(classData.id);
                  toast.success('Loading attendance analytics...', {
                    description: `Current rate: ${formatAttendanceRate(classData.attendanceRate)} for ${classData.name}`,
                    duration: 2500,
                  });
                }
              }}
            >
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <motion.div
                  whileHover={!isMobile ? { rotate: 5 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Attendance</span>
              </div>
              <p className={cn("text-xl sm:text-2xl font-bold", getAttendanceRateColor(classData.attendanceRate))}>
                {formatAttendanceRate(classData.attendanceRate)}
              </p>
            </motion.div>
          </div>

          {/* Enhanced Next Session with Click Action and Navigation Feedback - Mobile Optimized */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 p-2.5 sm:p-3 bg-white/40 backdrop-blur-sm rounded-lg sm:rounded-xl border-0 cursor-pointer transition-all duration-200 hover:bg-white/60 hover:shadow-md touch-manipulation min-h-[56px]"
            whileHover={!isMobile ? { scale: 1.01 } : {}}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (isTouch) lightTap();
              if (onViewSchedule) {
                onViewSchedule(classData.id);
                toast.success('Opening class schedule...', {
                  description: `Next session: ${getNextSession()} for ${classData.name}`,
                  duration: 2500,
                });
              }
            }}
          >
            <motion.div 
              className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0"
              whileHover={!isMobile ? { rotate: 10 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5 sm:mb-1">Next Session</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{getNextSession()}</p>
            </div>
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <Calendar className="h-4 w-4 text-slate-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Enhanced Quick Access Toolbar - Slides in on Hover with Improved Animation - Hidden on mobile */}
          {!isMobile && (
          <div className="absolute top-4 left-4 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto transform translate-y-[-10px] scale-90 group-hover:translate-y-0 group-hover:scale-100">
            {onMarkAttendance && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75"
              >
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance(classData.id);
                    toast.success('Navigating to attendance marking...', {
                      description: `Opening attendance interface for ${classData.name}`,
                      duration: 2000,
                    });
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"
              >
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReports(classData.id);
                    toast.success('Opening class reports...', {
                      description: `Loading analytics for ${classData.name}`,
                      duration: 2000,
                    });
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
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-125"
              >
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(classData.id);
                    toast.success('Opening class details...', {
                      description: `Loading detailed view for ${classData.name}`,
                      duration: 2000,
                    });
                  }}
                  className="h-8 px-3 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-lg hover:shadow-xl border-0 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-orange-500/20"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </motion.div>
            )}
          </div>
          )}

          {/* Enhanced Main Action Buttons with Navigation Feedback - Mobile Optimized */}
          <div className="flex gap-2 sm:gap-3">
            {onMarkAttendance && (
              <motion.div
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => {
                    if (isTouch) lightTap();
                    onMarkAttendance(classData.id);
                    toast.success('Opening attendance interface...', {
                      description: `Ready to mark attendance for ${classData.name}`,
                      duration: 3000,
                    });
                  }}
                  className="w-full min-h-[44px] sm:h-11 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 relative overflow-hidden group touch-manipulation"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-center">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Mark Attendance</span>
                    <span className="xs:hidden">Mark</span>
                  </div>
                </Button>
              </motion.div>
            )}
            
            {onViewDetails && (
              <motion.div
                whileHover={!isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => {
                    if (isTouch) lightTap();
                    onViewDetails(classData.id);
                    toast.success('Loading class details...', {
                      description: `Opening comprehensive view for ${classData.name}`,
                      duration: 3000,
                    });
                  }}
                  className="w-full min-h-[44px] sm:h-11 bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm border-0 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 relative overflow-hidden group touch-manipulation"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">View Class</span>
                    <span className="xs:hidden">View</span>
                  </div>
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

TeacherClassCard.displayName = 'TeacherClassCard';