"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, TrendingUp, CheckCircle, Eye, MoreVertical, Settings, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
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
    <div
      ref={ref}
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
      <Card className="rounded-xl sm:rounded-2xl shadow-md border border-slate-200/60 overflow-hidden relative touch-manipulation" style={{ backgroundColor: '#FEF7ED' }}>
        <CardContent className="p-4 sm:p-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-1 truncate">
                  {classData.name}
                </h3>
                {classData.major && (
                  <p className="text-xs sm:text-sm text-slate-600 truncate">
                    {classData.major}
                  </p>
                )}
              </div>
            </div>
            
            {/* Enhanced Dropdown Menu - Always visible on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTouch) lightTap();
                    }}
                    className="h-9 w-9 sm:h-8 sm:w-8 p-0 hover:bg-orange-100 rounded-xl touch-manipulation"
                    aria-label="Class options menu"
                  >
                    <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4 text-slate-600" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl"
                sideOffset={12}
              >
                {onViewStudents && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onViewStudents(classData.id);
                      toast.success('Loading student list...');
                    }}
                    className="rounded-xl hover:bg-orange-50 cursor-pointer py-3 px-4 mx-1 my-1"
                  >
                    <Users className="h-4 w-4 mr-3 text-orange-600" />
                    <span className="font-medium text-slate-700">View Students</span>
                  </DropdownMenuItem>
                )}
                {onViewReports && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onViewReports(classData.id);
                      toast.success('Opening class analytics...');
                    }}
                    className="rounded-xl hover:bg-orange-50 cursor-pointer py-3 px-4 mx-1 my-1"
                  >
                    <TrendingUp className="h-4 w-4 mr-3 text-orange-600" />
                    <span className="font-medium text-slate-700">View Reports</span>
                  </DropdownMenuItem>
                )}
                {onViewSchedule && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onViewSchedule(classData.id);
                      toast.success('Loading class schedule...');
                    }}
                    className="rounded-xl hover:bg-orange-50 cursor-pointer py-3 px-4 mx-1 my-1"
                  >
                    <Calendar className="h-4 w-4 mr-3 text-orange-600" />
                    <span className="font-medium text-slate-700">View Schedule</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200/60 to-transparent my-2" />
                {onManageClass && (
                  <DropdownMenuItem 
                    onClick={() => {
                      onManageClass(classData.id);
                      toast.success('Opening class management...');
                    }}
                    className="rounded-xl hover:bg-orange-50 cursor-pointer py-3 px-4 mx-1 my-1"
                  >
                    <Settings className="h-4 w-4 mr-3 text-orange-600" />
                    <span className="font-medium text-slate-700">Manage Class</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div 
              className="cursor-pointer touch-manipulation"
              onClick={() => {
                if (isTouch) lightTap();
                if (onViewStudents) {
                  onViewStudents(classData.id);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Students</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{classData.studentCount}</p>
            </div>
            <div 
              className="cursor-pointer touch-manipulation"
              onClick={() => {
                if (isTouch) lightTap();
                if (onViewReports) {
                  onViewReports(classData.id);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Attendance</span>
              </div>
              <p className={cn("text-2xl font-bold", getAttendanceRateColor(classData.attendanceRate))}>
                {formatAttendanceRate(classData.attendanceRate)}
              </p>
            </div>
          </div>

          {/* Next Session */}
          <div 
            className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 cursor-pointer touch-manipulation"
            onClick={() => {
              if (isTouch) lightTap();
              if (onViewSchedule) {
                onViewSchedule(classData.id);
              }
            }}
          >
            <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5 sm:mb-1">Next Session</p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{getNextSession()}</p>
            </div>
            {!isMobile && (
              <div className="flex-shrink-0">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            {onMarkAttendance && (
              <div className="flex-1">
                <Button
                  onClick={() => {
                    if (isTouch) lightTap();
                    onMarkAttendance(classData.id);
                    toast.success('Opening attendance interface...');
                  }}
                  className="w-full min-h-[44px] sm:h-11 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm border-0 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold touch-manipulation"
                >
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Mark Attendance</span>
                    <span className="xs:hidden">Mark</span>
                  </div>
                </Button>
              </div>
            )}
            
            {onViewDetails && (
              <div className="flex-1">
                <Button
                  onClick={() => {
                    if (isTouch) lightTap();
                    onViewDetails(classData.id);
                    toast.success('Loading class details...');
                  }}
                  className="w-full min-h-[44px] sm:h-11 bg-orange-100 text-orange-700 hover:bg-orange-200 shadow-sm border-0 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold touch-manipulation"
                >
                  <div className="flex items-center justify-center">
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">View Class</span>
                    <span className="xs:hidden">View</span>
                  </div>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TeacherClassCard.displayName = 'TeacherClassCard';
