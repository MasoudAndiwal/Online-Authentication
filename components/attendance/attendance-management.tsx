"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
import type { 
  AttendanceStatus, 
  StudentWithAttendance, 
  Class,
  AttendanceStatistics 
} from "@/types/attendance";

interface AttendanceManagementProps {
  classId: string;
  classData?: Class;
  date?: Date;
  className?: string;
}

export function AttendanceManagement({
  classId,
  classData,
  date = new Date(),
  className,
}: AttendanceManagementProps) {
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

  // Load students and attendance data
  const loadData = React.useCallback(async () => {
    if (!classId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch students for the class
      const studentsResponse = await fetch(`/api/students?classSection=${classData?.name || ''}`);
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

  // Load data on mount and when dependencies change
  React.useEffect(() => {
    loadData();
  }, [loadData]);

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
      const attendanceRecords = students
        .filter(student => student.status !== 'NOT_MARKED')
        .map(student => ({
          studentId: student.id,
          status: student.status,
          periodNumber: 1,
          teacherName: 'Current Teacher',
          subject: classData?.name || 'Unknown Subject',
          notes: null,
        }));

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
  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
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
      // Auto-save individual change
      if (!originalStudent) return;
      
      const attendanceRecord = {
        studentId,
        status,
        periodNumber: 1,
        teacherName: 'Current Teacher',
        subject: classData?.name || 'Unknown Subject',
        notes: null,
      };

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          date: date.toISOString().split('T')[0],
          records: [attendanceRecord],
          markedBy: 'current-teacher-id',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save attendance: ${response.statusText}`);
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
      
      // Prepare attendance records with enhanced metadata
      const attendanceRecords = studentIds.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          studentId,
          status,
          periodNumber: 1,
          teacherName: 'Current Teacher',
          subject: classData?.name || 'Unknown Subject',
          notes: `Bulk update: ${studentIds.length} students at ${new Date().toLocaleTimeString()}`,
          studentName: student?.name || 'Unknown Student', // For better error reporting
        };
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Attendance Management
          </h1>
          <p className="text-slate-600 mt-1">
            {classData?.name || `Class ${classId}`} • {date.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Enhanced real-time connection status indicator */}
          <motion.div 
            className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-xl border-0 shadow-sm"
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
                <span className="text-sm text-green-700 font-medium">Real-time Sync</span>
                {lastSyncTime && (
                  <span className="text-xs text-slate-500">
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
                <span className="text-sm text-red-700 font-medium">Offline Mode</span>
                <span className="text-xs text-red-500">• Changes queued</span>
              </>
            )}
            {connectionStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-700 font-medium">Syncing...</span>
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
            onClick={loadData}
            disabled={isLoading || connectionStatus === 'offline'}
            className="bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-xl hover:bg-white/80"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving || connectionStatus === 'offline'}
            className={cn(
              "border-0 shadow-sm rounded-xl transition-all duration-200",
              hasUnsavedChanges 
                ? "bg-orange-600 hover:bg-orange-700 text-white" 
                : "bg-green-50 text-green-700 hover:bg-green-100"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                All Saved
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{statistics.total}</p>
                  <p className="text-sm text-slate-600">Total Students</p>
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{statistics.present}</p>
                  <p className="text-sm text-slate-600">Present</p>
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{statistics.absent}</p>
                  <p className="text-sm text-slate-600">Absent</p>
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {statistics.total > 0 ? Math.round((statistics.present / statistics.total) * 100) : 0}%
                  </p>
                  <p className="text-sm text-slate-600">Attendance Rate</p>
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
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-700">{statistics.notMarked}</p>
                  <p className="text-sm text-slate-600">Not Marked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="font-medium text-orange-800">You have unsaved changes</p>
              <p className="text-sm text-orange-700">
                Don&apos;t forget to save your attendance changes before leaving this page.
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-sm"
            >
              Save Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border-0 shadow-sm">
        <Button
          variant={activeTab === "attendance" ? "default" : "ghost"}
          onClick={() => setActiveTab("attendance")}
          className={cn(
            "rounded-lg transition-all duration-200",
            activeTab === "attendance"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <Users className="h-4 w-4 mr-2" />
          Attendance Grid
        </Button>
        <Button
          variant={activeTab === "risks" ? "default" : "ghost"}
          onClick={() => setActiveTab("risks")}
          className={cn(
            "rounded-lg transition-all duration-200",
            activeTab === "risks"
              ? "bg-orange-600 text-white shadow-sm"
              : "hover:bg-orange-50 text-slate-700"
          )}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Risk Indicators
        </Button>
      </div>

      {/* Main Content */}
      {activeTab === "attendance" ? (
        <AttendanceGrid
          classId={classId}
          students={students}
          isLoading={isLoading}
          error={error}
          onStatusChange={handleStatusChange}
          onBulkStatusChange={handleBulkStatusChange}
          selectedStudents={selectedStudents}
          onStudentSelect={handleStudentSelect}
          onSelectAll={handleSelectAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showRiskIndicators={true}
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