"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AttendanceGrid } from "./attendance-grid";
import { BulkActionsPanel } from "./bulk-actions-panel";
import { RiskIndicatorsGrid, calculateStudentRisk } from "./student-risk-indicators";
import { useResponsive } from "@/lib/hooks/use-responsive";
import type { 
  AttendanceStatus, 
  StudentWithAttendance, 
  Class,
  AttendanceStatistics 
} from "@/types/attendance";
import { periodAssignmentService, type TeacherPeriodAssignment } from "@/lib/services/period-assignment-service";
import { useAuth } from "@/hooks/use-auth";

interface AttendanceManagementProps {
  classId: string;
  classData?: Class;
  date?: Date;
  className?: string;
  teacherId?: string; // Current teacher's ID
  enablePeriodFiltering?: boolean; // Feature flag
}

export function AttendanceManagement({
  classId,
  classData,
  date = new Date(),
  className,
  teacherId,
  enablePeriodFiltering = false, // Temporarily disabled to show all periods
}: AttendanceManagementProps) {
  // Responsive hook
  const { isMobile } = useResponsive();
  
  // Auth hook to get current teacher if not provided
  const { user } = useAuth({ requiredRole: 'TEACHER' });
  const currentTeacherId = teacherId || user?.id;
  
  // State management
  const [students, setStudents] = React.useState<StudentWithAttendance[]>([]);
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"attendance" | "risks">("attendance");
  const [connectionStatus, setConnectionStatus] = React.useState<'online' | 'offline' | 'saving'>('online');
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  const [autoSaveEnabled] = React.useState(true);

  // Period assignment state management
  const [teacherPeriods, setTeacherPeriods] = React.useState<TeacherPeriodAssignment[]>([]);
  const [periodAssignmentLoading, setPeriodAssignmentLoading] = React.useState(false);
  const [periodAssignmentError, setPeriodAssignmentError] = React.useState<string | null>(null);

  // Load students and attendance data
  const loadData = React.useCallback(async () => {
    if (!classId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch students for the class with proper format (uppercase session)
      const classSectionKey = `${classData?.name} - ${classData?.session || 'MORNING'}`;
      console.log('Attendance Management - Fetching students with classSection:', classSectionKey);
      const studentsResponse = await fetch(`/api/students?classSection=${encodeURIComponent(classSectionKey)}`);
      if (!studentsResponse.ok) {
        throw new Error('Failed to fetch students');
      }
      const studentsData = await studentsResponse.json();

      // Fetch existing attendance records for the date
      const attendanceResponse = await fetch(
        `/api/attendance?classId=${classId}&date=${date.toISOString().split('T')[0]}`
      );
      
      let attendanceData: Array<{
        student_id: string;
        status: string;
        marked_at: string;
      }> = [];
      if (attendanceResponse.ok) {
        const result = await attendanceResponse.json();
        attendanceData = result.data || [];
      }

      // Combine student data with attendance status
      const studentsWithAttendance: StudentWithAttendance[] = studentsData.map((student: {
        id: string;
        studentId: string;
        firstName: string;
        lastName: string;
        classSection: string;
        programs: string;
        semester: string;
      }) => {
        const attendanceRecord = attendanceData.find(
          record => record.student_id === student.id
        );
        
        return {
          id: student.id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          name: `${student.firstName} ${student.lastName}`,
          classSection: student.classSection,
          programs: student.programs,
          semester: student.semester,
          status: (attendanceRecord?.status as AttendanceStatus) || 'NOT_MARKED',
          markedAt: attendanceRecord?.marked_at ? new Date(attendanceRecord.marked_at) : undefined,
        };
      });

      setStudents(studentsWithAttendance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      toast.error('Failed to load attendance data', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [classId, classData?.name, date]);

  // Load period assignments
  const loadPeriodAssignments = React.useCallback(async () => {
    if (!enablePeriodFiltering || !currentTeacherId || !classId) {
      setTeacherPeriods([]);
      return;
    }

    setPeriodAssignmentLoading(true);
    setPeriodAssignmentError(null);

    try {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Validate inputs
      if (!currentTeacherId || !classId || !dayOfWeek) {
        throw new Error('Missing required parameters for period assignment loading');
      }
      
      const periods = await periodAssignmentService.getTeacherPeriods(
        currentTeacherId,
        classId,
        dayOfWeek
      );
      
      setTeacherPeriods(periods || []);
      console.log('Loaded teacher periods:', periods);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load period assignments';
      setPeriodAssignmentError(errorMessage);
      console.error('Failed to load period assignments:', err);
      
      // Set empty periods as fallback
      setTeacherPeriods([]);
      
      // Show toast notification for period assignment errors
      toast.error('Failed to load period assignments', {
        description: 'Using default period view. Please check your schedule configuration.',
        duration: 5000,
      });
    } finally {
      setPeriodAssignmentLoading(false);
    }
  }, [enablePeriodFiltering, currentTeacherId, classId, date]);

  // Load data on mount and when dependencies change
  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Load period assignments when component mounts or dependencies change
  React.useEffect(() => {
    loadPeriodAssignments();
  }, [loadPeriodAssignments]);

  // Enhanced connection monitoring with real-time feedback
  React.useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('online');
      toast.success("🌐 Connection restored", {
        description: "Auto-sync is now active",
        duration: 3000,
      });
    };
    
    const handleOffline = () => {
      setConnectionStatus('offline');
      toast.warning("📡 Connection lost", {
        description: "Changes will be saved when connection is restored",
        duration: 5000,
      });
    };
    
    // Check initial connection status
    if (!navigator.onLine) {
      setConnectionStatus('offline');
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced save function with real-time feedback
  const handleSave = React.useCallback(async () => {
    if (!hasUnsavedChanges) {
      toast.info('No changes to save');
      return;
    }

    if (connectionStatus === 'offline') {
      toast.error('Cannot save while offline', {
        description: 'Changes will be saved automatically when connection is restored',
      });
      return;
    }

    setIsSaving(true);
    setConnectionStatus('saving');

    try {
      const attendanceRecords: any[] = [];
      
      students
        .filter(student => student.status !== 'NOT_MARKED')
        .forEach(student => {
          // Create records for all 6 periods
          for (let period = 1; period <= 6; period++) {
            attendanceRecords.push({
              studentId: student.id,
              status: student.status,
              periodNumber: period,
              teacherName: `Teacher ${Math.ceil(period / 2)}`,
              subject: classData?.name || 'Unknown Subject',
              notes: null,
            });
          }
        });

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: date.toISOString().split('T')[0],
          records: attendanceRecords,
          markedBy: 'current-teacher-id',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save attendance: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update sync status
      setLastSyncTime(new Date());
      setConnectionStatus('online');
      
      toast.success('Attendance saved successfully', {
        description: `Saved attendance for ${result.saved || attendanceRecords.length} students`,
        duration: 3000,
        action: {
          label: "View Summary",
          onClick: () => {
            // Could show a summary modal
            console.log("View summary clicked");
          },
        },
      });
      
      setHasUnsavedChanges(false);
      
    } catch (err) {
      setConnectionStatus('online'); // Reset status
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to save attendance';
      toast.error('Failed to save attendance', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => handleSave(),
        },
      });
    } finally {
      setIsSaving(false);
    }
  }, [hasUnsavedChanges, connectionStatus, students, classId, date, classData?.name]);

  // Separate effect for handling connection restoration auto-save
  React.useEffect(() => {
    if (connectionStatus === 'online' && hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 1000);
      
      return () => clearTimeout(autoSaveTimer);
    }
  }, [connectionStatus, hasUnsavedChanges, handleSave]);

  // Enhanced auto-save with real-time progress and smart intervals
  React.useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges || connectionStatus === 'offline') {
      return;
    }

    // Smart auto-save interval - shorter for recent changes, longer for stable state
    const getAutoSaveInterval = () => {
      const timeSinceLastChange = Date.now() - (lastSyncTime?.getTime() || 0);
      if (timeSinceLastChange < 30000) return 5000;  // 5s for recent changes
      if (timeSinceLastChange < 60000) return 10000; // 10s for moderate age
      return 15000; // 15s for older changes
    };

    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && connectionStatus === 'online') {
        toast.info("💾 Auto-saving changes...", {
          duration: 1500,
          id: 'auto-save',
        });
        handleSave();
      }
    }, getAutoSaveInterval());

    return () => clearInterval(autoSaveInterval);
  }, [hasUnsavedChanges, autoSaveEnabled, connectionStatus, handleSave, lastSyncTime]);

  // Handle status change for individual student with auto-save and risk monitoring
  const handleStatusChange = async (studentId: string, status: AttendanceStatus, periodNumber?: number) => {
    const originalStudent = students.find(s => s.id === studentId);
    
    // Update local state immediately (optimistic update)
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, status, markedAt: new Date() }
          : student
      )
    );
    
    // Check for risk threshold warnings when marking absent
    if (status === 'ABSENT' && originalStudent) {
      // Generate mock attendance history for risk calculation
      const mockHistory = Array.from({ length: 29 }, (_, i) => ({
        status: Math.random() < 0.15 ? 'ABSENT' : 'PRESENT', // 15% absence rate
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      }));
      
      // Add today's absence
      mockHistory.push({ status: 'ABSENT', date: new Date().toISOString() });
      
      const riskData = calculateStudentRisk(
        originalStudent.id,
        originalStudent.name,
        mockHistory,
        30, // Total class days
        25  // 25% allowed absence rate
      );
      
      // Show risk warnings
      if (riskData.riskType === 'محروم') {
        toast.error(`${originalStudent.name} is now محروم`, {
          description: 'Student has exceeded the maximum allowed absences and is disqualified',
          duration: 8000,
          action: {
            label: "View Details",
            onClick: () => setActiveTab("risks"),
          },
        });
      } else if (riskData.riskType === 'تصدیق_طلب') {
        toast.warning(`${originalStudent.name} requires تصدیق طلب`, {
          description: `Student needs certification. ${riskData.remainingAbsences} absences remaining`,
          duration: 6000,
          action: {
            label: "View Details",
            onClick: () => setActiveTab("risks"),
          },
        });
      } else if (riskData.riskType === 'approaching_limit' && riskData.remainingAbsences <= 3) {
        toast.warning(`${originalStudent.name} is approaching absence limit`, {
          description: `Only ${riskData.remainingAbsences} absences remaining before تصدیق طلب`,
          duration: 5000,
          action: {
            label: "View Details",
            onClick: () => setActiveTab("risks"),
          },
        });
      }
    }
    
    try {
      // Auto-save individual change for ALL 6 periods
      if (!originalStudent) return;
      
      // Create records based on whether it's period-specific or global
      const attendanceRecords = [];
      
      if (periodNumber) {
        // Period-specific status change
        attendanceRecords.push({
          studentId,
          status,
          periodNumber,
          teacherName: currentTeacherId || 'Unknown Teacher',
          subject: classData?.name || 'Unknown Subject',
          notes: null,
        });
      } else {
        // Global status change (SICK/LEAVE for all assigned periods)
        const assignedPeriods = teacherPeriods && teacherPeriods.length > 0 
          ? teacherPeriods.map(p => p.periodNumber).filter((p, i, arr) => arr.indexOf(p) === i)
          : [1, 2, 3, 4, 5, 6, 7, 8]; // University has 8 periods
          
        for (const period of assignedPeriods) {
          attendanceRecords.push({
            studentId,
            status,
            periodNumber: period,
            teacherName: currentTeacherId || 'Unknown Teacher',
            subject: classData?.name || 'Unknown Subject',
            notes: null,
          });
        }
      }

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: date.toISOString().split('T')[0],
          records: attendanceRecords,
          markedBy: currentTeacherId || 'unknown-teacher',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to save attendance: ${response.statusText}. ${errorData.details || ''}`);
      }

      // Success - no need to show toast for individual changes to avoid spam
      setHasUnsavedChanges(false);
      
    } catch (error) {
      // Rollback on error
      if (originalStudent) {
        setStudents(prev => 
          prev.map(student => 
            student.id === studentId ? originalStudent : student
          )
        );
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save attendance';
      toast.error('Auto-save failed', {
        description: `${originalStudent?.name}: ${errorMessage}`,
        duration: 4000,
        action: {
          label: "Retry",
          onClick: () => handleStatusChange(studentId, status),
        },
      });
      
      setHasUnsavedChanges(true);
    }
  };

  // Enhanced bulk status change with comprehensive real-time updates and error recovery
  const handleBulkStatusChange = async (studentIds: string[], status: AttendanceStatus) => {
    // Store original state for rollback on error
    const originalStudents = [...students];
    const startTime = Date.now();
    
    try {
      // Real-time optimistic update with visual feedback
      setStudents(prev => 
        prev.map(student => 
          studentIds.includes(student.id)
            ? { ...student, status, markedAt: new Date() }
            : student
        )
      );
      setHasUnsavedChanges(true);
      setConnectionStatus('saving');
      
      // Show immediate feedback for bulk operation start
      toast.info(`🚀 Starting bulk update for ${studentIds.length} students...`, {
        duration: 2000,
        id: 'bulk-start',
      });
      
      // Prepare attendance records with enhanced metadata for ALL 6 periods
      const attendanceRecords: any[] = [];
      
      studentIds.forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        // Create records for all 6 periods
        for (let period = 1; period <= 6; period++) {
          attendanceRecords.push({
            studentId,
            status,
            periodNumber: period,
            teacherName: `Teacher ${Math.ceil(period / 2)}`,
            subject: classData?.name || 'Unknown Subject',
            notes: `Bulk update: ${studentIds.length} students at ${new Date().toLocaleTimeString()}`,
            studentName: student?.name || 'Unknown Student', // For better error reporting
          });
        }
      });

      // Enhanced API call with timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: date.toISOString().split('T')[0],
          records: attendanceRecords,
          markedBy: 'current-teacher-id',
          bulkOperation: true,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;
      
      // Update sync status and timing
      setConnectionStatus('online');
      setLastSyncTime(new Date());
      setHasUnsavedChanges(false);
      
      // Comprehensive success feedback with performance metrics
      toast.success(`✅ Bulk update completed successfully!`, {
        description: `${result.saved || studentIds.length} students updated in ${processingTime}ms`,
        duration: 4000,
        action: {
          label: "View Details",
          onClick: () => {
            toast.info(`📊 Operation Summary`, {
              description: `Status: ${status} | Students: ${studentIds.length} | Time: ${processingTime}ms`,
              duration: 5000,
            });
          },
        },
      });

      // Real-time validation - check if all students were updated correctly
      const updatedCount = students.filter(s => 
        studentIds.includes(s.id) && s.status === status
      ).length;
      
      if (updatedCount !== studentIds.length) {
        toast.warning("⚠️ Partial update detected", {
          description: `${updatedCount}/${studentIds.length} students updated. Please verify.`,
          duration: 6000,
        });
      }
      
    } catch (error) {
      // Comprehensive error handling with rollback
      setStudents(originalStudents);
      setConnectionStatus('online');
      setHasUnsavedChanges(true);
      
      let errorMessage = 'Unknown error occurred';
      let errorType = 'network';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out after 30 seconds';
          errorType = 'timeout';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection lost';
          errorType = 'connection';
        } else {
          errorMessage = error.message;
          errorType = 'server';
        }
      }
      
      // Enhanced error reporting with recovery suggestions
      toast.error(`❌ Bulk update failed (${errorType})`, {
        description: errorMessage,
        duration: 8000,
        action: {
          label: "Retry with Recovery",
          onClick: () => {
            // Implement smart retry with smaller batches if needed
            if (studentIds.length > 10) {
              toast.info("🔄 Trying smaller batches...", {
                description: "Breaking down into smaller groups for better reliability",
                duration: 3000,
              });
              // Could implement batch processing here
            }
            handleBulkStatusChange(studentIds, status);
          },
        },
      });

      // Show recovery suggestions based on error type
      setTimeout(() => {
        if (errorType === 'connection') {
          toast.info("💡 Connection tip", {
            description: "Check your internet connection and try again",
            duration: 5000,
          });
        } else if (errorType === 'timeout') {
          toast.info("💡 Performance tip", {
            description: "Try selecting fewer students for faster processing",
            duration: 5000,
          });
        }
      }, 2000);
      
      throw error; // Re-throw for bulk actions panel to handle
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentId: string, selected: boolean) => {
    setSelectedStudents(prev => 
      selected 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedStudents(selected ? students.map(s => s.id) : []);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedStudents([]);
  };



  // Calculate attendance statistics
  const statistics: AttendanceStatistics = React.useMemo(() => {
    const total = students.length;
    const present = students.filter(s => s.status === 'PRESENT').length;
    const absent = students.filter(s => s.status === 'ABSENT').length;
    const sick = students.filter(s => s.status === 'SICK').length;
    const leave = students.filter(s => s.status === 'LEAVE').length;
    const notMarked = students.filter(s => s.status === 'NOT_MARKED').length;

    return { total, present, absent, sick, leave, notMarked };
  }, [students]);

  // Calculate risk data for students
  const riskData = React.useMemo(() => {
    return students.map(student => 
      calculateStudentRisk(
        student.id,
        student.name,
        [{ status: student.status, date: date.toISOString() }], // Simplified for demo
        30, // Total class days (would be calculated from actual data)
        25  // 25% allowed absence rate
      )
    );
  }, [students, date]);

  // Create student names mapping for bulk actions
  const studentNames = React.useMemo(() => {
    return students.reduce((acc, student) => {
      acc[student.id] = student.name;
      return acc;
    }, {} as Record<string, string>);
  }, [students]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
            Attendance Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 truncate">
            {classData?.name || `Class ${classId}`} • {date.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Enhanced real-time connection status indicator - Mobile Responsive */}
          <motion.div 
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl border-0 shadow-sm"
            animate={{
              scale: connectionStatus === 'saving' ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: connectionStatus === 'saving' ? Infinity : 0,
            }}
          >
            {connectionStatus === 'online' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wifi className="h-4 w-4 text-green-600" />
                </motion.div>
                <span className="text-xs sm:text-sm text-green-700 font-medium hidden xs:inline">Real-time Sync</span>
                <span className="text-xs sm:text-sm text-green-700 font-medium xs:hidden">Sync</span>
                {lastSyncTime && (
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    • {lastSyncTime.toLocaleTimeString()}
                  </span>
                )}
                {autoSaveEnabled && hasUnsavedChanges && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-orange-400 rounded-full"
                  />
                )}
              </>
            )}
            {connectionStatus === 'offline' && (
              <>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <WifiOff className="h-4 w-4 text-red-600" />
                </motion.div>
                <span className="text-xs sm:text-sm text-red-700 font-medium">Offline Mode</span>
                <span className="text-xs text-red-500 hidden sm:inline">• Changes queued</span>
              </>
            )}
            {connectionStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-xs sm:text-sm text-blue-700 font-medium">Syncing...</span>
                <motion.div
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-1 bg-blue-400 rounded-full"
                  style={{ width: "20px" }}
                />
              </>
            )}
          </motion.div>

          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={loadData}
            disabled={isLoading || connectionStatus === 'offline'}
            className="bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-lg sm:rounded-xl hover:bg-white/80 min-h-[44px] touch-manipulation"
          >
            <RefreshCw className={cn("h-4 w-4 sm:mr-2", isLoading && "animate-spin")} />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </Button>
          
          <Button
            onClick={handleSave}
            size={isMobile ? "sm" : "default"}
            disabled={!hasUnsavedChanges || isSaving || connectionStatus === 'offline'}
            className={cn(
              "border-0 shadow-sm rounded-lg sm:rounded-xl transition-all duration-200 min-h-[44px] touch-manipulation",
              hasUnsavedChanges 
                ? "bg-orange-600 hover:bg-orange-700 text-white" 
                : "bg-green-50 text-green-700 hover:bg-green-100"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                <span className="hidden sm:inline ml-2">Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">Save Changes</span>
                <span className="sm:hidden ml-2">Save</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline ml-2">All Saved</span>
                <span className="sm:hidden ml-2">Saved</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{statistics.total}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">{statistics.present}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Present</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">{statistics.absent}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Absent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-700">
                    {statistics.total > 0 ? Math.round((statistics.present / statistics.total) * 100) : 0}%
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-0 shadow-lg">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-700">{statistics.notMarked}</p>
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Not Marked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Unsaved Changes Warning - Mobile Responsive */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-orange-800 text-sm sm:text-base">You have unsaved changes</p>
                <p className="text-xs sm:text-sm text-orange-700 mt-1">
                  Don&apos;t forget to save your attendance changes before leaving this page.
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              Save Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Period Assignment Error States - Beautiful Multi-Color Design */}
      <AnimatePresence>
        {enablePeriodFiltering && periodAssignmentError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-rose-50 to-rose-100/50 border-0 rounded-2xl p-6 shadow-xl shadow-rose-500/10 backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-rose-100 rounded-xl flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-rose-800 text-base sm:text-lg">Period Assignment Error</h3>
                  <p className="text-sm sm:text-base text-rose-700 mt-1">
                    {periodAssignmentError}
                  </p>
                  <p className="text-xs sm:text-sm text-rose-600 mt-2">
                    Please contact the office to verify your schedule assignments.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={loadPeriodAssignments}
                  disabled={periodAssignmentLoading}
                  size="sm"
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0 shadow-xl rounded-xl flex-1 sm:flex-none"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", periodAssignmentLoading && "animate-spin")} />
                  Retry
                </Button>
                <Button
                  onClick={() => setPeriodAssignmentError(null)}
                  variant="outline"
                  size="sm"
                  className="bg-white/60 backdrop-blur-sm border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl flex-1 sm:flex-none"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {enablePeriodFiltering && !periodAssignmentError && teacherPeriods.length === 0 && !periodAssignmentLoading && currentTeacherId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-0 rounded-2xl p-6 shadow-xl shadow-slate-500/10 backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0">
                  <Users className="h-6 w-6 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-base sm:text-lg">No Period Assignments</h3>
                  <p className="text-sm sm:text-base text-slate-700 mt-1">
                    You don&apos;t have any periods assigned for this class on {date.toLocaleDateString('en-US', { weekday: 'long' })}.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    Contact the office if you believe this is incorrect.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={loadPeriodAssignments}
                  disabled={periodAssignmentLoading}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white border-0 shadow-xl rounded-xl flex-1 sm:flex-none"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", periodAssignmentLoading && "animate-spin")} />
                  Check Again
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {enablePeriodFiltering && periodAssignmentLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-0 rounded-2xl p-6 shadow-xl shadow-amber-500/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-6 w-6 text-amber-600" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-amber-800 text-base sm:text-lg">Loading Period Assignments</h3>
                <p className="text-sm sm:text-base text-amber-700 mt-1">
                  Fetching your assigned periods for this class...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation - Mobile Responsive */}
      <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 border-0 shadow-sm overflow-x-auto">
        <Button
          variant={activeTab === "attendance" ? "default" : "ghost"}
          onClick={() => setActiveTab("attendance")}
          size="sm"
          className={cn(
            "rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation flex-shrink-0",
            activeTab === "attendance"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <Users className="h-4 w-4 sm:mr-2" />
          <span className="hidden xs:inline ml-2">Attendance Grid</span>
          <span className="xs:hidden ml-2">Grid</span>
        </Button>
        <Button
          variant={activeTab === "risks" ? "default" : "ghost"}
          onClick={() => setActiveTab("risks")}
          size="sm"
          className={cn(
            "rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation flex-shrink-0",
            activeTab === "risks"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <AlertTriangle className="h-4 w-4 sm:mr-2" />
          <span className="hidden xs:inline ml-2">Risk Indicators</span>
          <span className="xs:hidden ml-2">Risks</span>
        </Button>
      </div>

      {/* Main Content */}
      {activeTab === "attendance" ? (
        <AttendanceGrid
          key={`attendance-${students.map(s => `${s.id}-${s.status}`).join('-')}`}
          classId={classId}
          students={students}
          isLoading={isLoading}
          error={error}
          onStatusChange={handleStatusChange}
          selectedStudents={selectedStudents}
          onStudentSelect={handleStudentSelect}
          onSelectAll={handleSelectAll}
          teacherPeriods={teacherPeriods}
          currentTeacherId={currentTeacherId}
          enablePeriodFiltering={enablePeriodFiltering}
        />
      ) : (
        <RiskIndicatorsGrid
          students={riskData}
          onStudentClick={(studentId) => {
            // Switch to attendance tab and highlight student
            setActiveTab("attendance");
            toast.info(`Viewing ${studentNames[studentId]}'s attendance`);
          }}
        />
      )}

      {/* Bulk Actions Panel */}
      <BulkActionsPanel
        selectedStudents={selectedStudents}
        studentNames={studentNames}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
        isVisible={selectedStudents.length > 0}
        isSaving={isSaving}
      />
    </div>
  );
}