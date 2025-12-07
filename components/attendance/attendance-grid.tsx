"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Heart,
  FileText,
  AlertTriangle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { AttendanceStatus, StudentWithAttendance } from "@/types/attendance";
import type { TeacherPeriodAssignment } from "@/lib/services/period-assignment-service";

interface AttendanceGridProps {
  classId: string;
  className?: string;
  students: StudentWithAttendance[];
  isLoading?: boolean;
  error?: string | null;
  onStatusChange: (studentId: string, status: AttendanceStatus, periodNumber?: number) => void;
  selectedStudents?: string[];
  onStudentSelect?: (studentId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  // Period filtering props
  teacherPeriods?: TeacherPeriodAssignment[];
  currentTeacherId?: string;
  enablePeriodFiltering?: boolean;
}

export function AttendanceGrid({
  classId,
  className,
  students = [],
  isLoading = false,
  error = null,
  onStatusChange,
  selectedStudents = [],
  onStudentSelect,
  onSelectAll,
  teacherPeriods = [],
  currentTeacherId,
  enablePeriodFiltering = false,
}: AttendanceGridProps) {
  // Track period-specific attendance for each student
  const [studentPeriodAttendance, setStudentPeriodAttendance] = React.useState<
    Record<string, Record<number, AttendanceStatus>>
  >({});

  // Track the last update timestamp to prevent sync loops
  const lastUpdateRef = React.useRef<Record<string, number>>({});

  // Get assigned periods for current teacher
  const getAssignedPeriods = React.useMemo(() => {
    if (!enablePeriodFiltering || !teacherPeriods || teacherPeriods.length === 0) {
      return [1, 2, 3, 4, 5, 6]; // Show all 6 periods per day
    }
    
    return teacherPeriods
      .map(assignment => assignment.periodNumber)
      .filter((period, index, arr) => arr.indexOf(period) === index) // Remove duplicates
      .sort((a, b) => a - b);
  }, [enablePeriodFiltering, teacherPeriods]);

  // Get teacher info for a specific period
  const getTeacherForPeriod = React.useCallback((periodNumber: number) => {
    if (!teacherPeriods || teacherPeriods.length === 0) {
      return null;
    }
    
    return teacherPeriods.find(assignment => assignment.periodNumber === periodNumber) || null;
  }, [teacherPeriods]);

  // Check if teacher is assigned to a period
  const isTeacherAssignedToPeriod = React.useCallback((periodNumber: number) => {
    if (!enablePeriodFiltering) {
      return true; // Allow all periods if filtering is disabled
    }
    
    return getAssignedPeriods.includes(periodNumber);
  }, [enablePeriodFiltering, getAssignedPeriods]);

  // Initialize period attendance from students data only once
  React.useEffect(() => {
    // Only initialize if we don't have period data yet
    const updatedPeriodAttendance: Record<string, Record<number, AttendanceStatus>> = {};
    let hasUpdates = false;
    
    students.forEach(student => {
      // Only initialize if this student doesn't have period data yet
      if (!studentPeriodAttendance[student.id]) {
        updatedPeriodAttendance[student.id] = {};
        hasUpdates = true;
        
        // Initialize all periods as NOT_MARKED
        getAssignedPeriods.forEach(period => {
          updatedPeriodAttendance[student.id][period] = 'NOT_MARKED';
        });
      }
    });
    
    // Only update if there are new students
    if (hasUpdates) {
      setStudentPeriodAttendance(prev => ({
        ...prev,
        ...updatedPeriodAttendance
      }));
    }
  }, [getAssignedPeriods, studentPeriodAttendance, students, students.length]); // Only depend on students.length to avoid re-running on status changes

  // Sync with bulk changes from parent component - FIXED FOR ALL PERIODS
  React.useEffect(() => {
    const updatedPeriodAttendance: Record<string, Record<number, AttendanceStatus>> = {};
    let hasUpdates = false;
    
    students.forEach(student => {
      // Only sync if student has a status from parent
      if (student.status !== 'NOT_MARKED') {
        const assignedPeriods = getAssignedPeriods.filter(p => isTeacherAssignedToPeriod(p));
        
        // Initialize period data if it doesn't exist
        if (!studentPeriodAttendance[student.id]) {
          updatedPeriodAttendance[student.id] = {};
          assignedPeriods.forEach(period => {
            updatedPeriodAttendance[student.id][period] = student.status;
          });
          hasUpdates = true;
          return;
        }
        
        // Check if this is a recent update from our own handleStatusChange
        const lastUpdate = lastUpdateRef.current[student.id] || 0;
        const timeSinceUpdate = Date.now() - lastUpdate;
        
        // For individual period clicks (recent update), skip sync
        if (timeSinceUpdate < 300) {
          return;
        }
        
        // Check if ALL periods currently have the same status OR if no periods are set yet
        const currentPeriodStatuses = assignedPeriods.map(p => studentPeriodAttendance[student.id]?.[p] || 'NOT_MARKED');
        const allPeriodsHaveSameStatus = currentPeriodStatuses.every(s => s === currentPeriodStatuses[0]);
        const allPeriodsNotMarked = currentPeriodStatuses.every(s => s === 'NOT_MARKED');
        
        // Sync to all periods if:
        // 1. SICK/LEAVE (always applies to all periods)
        // 2. PRESENT/ABSENT AND (all periods have same status OR all not marked) - indicates bulk action
        const isSickOrLeave = (student.status === 'SICK' || student.status === 'LEAVE');
        const isPresentOrAbsent = (student.status === 'PRESENT' || student.status === 'ABSENT');
        const shouldSyncToAllPeriods = isSickOrLeave || (isPresentOrAbsent && (allPeriodsHaveSameStatus || allPeriodsNotMarked));
        
        if (shouldSyncToAllPeriods) {
          const needsSync = assignedPeriods.some(period => {
            const currentPeriodStatus = studentPeriodAttendance[student.id]?.[period] || 'NOT_MARKED';
            return currentPeriodStatus !== student.status;
          });
          
          if (needsSync) {
            if (!updatedPeriodAttendance[student.id]) {
              updatedPeriodAttendance[student.id] = { ...studentPeriodAttendance[student.id] };
            }
            
            // Apply the parent's status to ALL assigned periods
            assignedPeriods.forEach(period => {
              updatedPeriodAttendance[student.id][period] = student.status;
            });
            
            hasUpdates = true;
          }
        }
      }
    });
    
    // Update period attendance if there are changes from bulk actions
    if (hasUpdates) {
      setStudentPeriodAttendance(prev => ({
        ...prev,
        ...updatedPeriodAttendance
      }));
    }
  }, [getAssignedPeriods, isTeacherAssignedToPeriod, studentPeriodAttendance, students]); // ✅ Only depend on students prop to prevent infinite loops

  // Get current status for student and period
  const getCurrentStatus = (studentId: string, periodNumber?: number): AttendanceStatus => {
    if (periodNumber) {
      // Return the specific period status
      return studentPeriodAttendance[studentId]?.[periodNumber] || 'NOT_MARKED';
    }
    
    // For global status (SICK/LEAVE), check if all assigned periods have the same status
    const assignedPeriods = getAssignedPeriods.filter(p => isTeacherAssignedToPeriod(p));
    const studentAttendance = studentPeriodAttendance[studentId];
    
    if (!studentAttendance || assignedPeriods.length === 0) return 'NOT_MARKED';
    
    // Check if all assigned periods have SICK status
    if (assignedPeriods.every(p => studentAttendance[p] === 'SICK')) return 'SICK';
    // Check if all assigned periods have LEAVE status  
    if (assignedPeriods.every(p => studentAttendance[p] === 'LEAVE')) return 'LEAVE';
    
    return 'NOT_MARKED';
  };

  // Handle status change
  const handleStatusChange = (studentId: string, status: AttendanceStatus, periodNumber?: number) => {
    // Mark this as a recent internal update to prevent sync from overriding it
    lastUpdateRef.current[studentId] = Date.now();
    
    if (periodNumber) {
      // Period-specific status change - ONLY affects this specific period
      if (enablePeriodFiltering && !isTeacherAssignedToPeriod(periodNumber)) {
        const teacherInfo = getTeacherForPeriod(periodNumber);
        const assignedTeacher = teacherInfo ? teacherInfo.teacherName : 'another teacher';
        
        toast.error(
          `You cannot mark attendance for Period ${periodNumber}. This period is assigned to ${assignedTeacher}.`,
          { duration: 4000 }
        );
        return;
      }

      // Update ONLY the specific period attendance IMMEDIATELY
      setStudentPeriodAttendance(prev => {
        const currentStudentData = prev[studentId] || {};
        const updated = {
          ...prev,
          [studentId]: {
            ...currentStudentData,
            [periodNumber]: status // Only update this specific period
          }
        };
        return updated;
      });

      // Call parent handler with period number
      onStatusChange(studentId, status, periodNumber);

      const student = students.find(s => s.id === studentId);
      if (student) {
        toast.success(`${student.name} marked as ${status} for Period ${periodNumber}`, {
          duration: 2000,
        });
      }
    } else {
      // Global status change (SICK/LEAVE for ALL assigned periods)
      const assignedPeriods = getAssignedPeriods.filter(p => isTeacherAssignedToPeriod(p));
      
      setStudentPeriodAttendance(prev => {
        const currentStudentData = prev[studentId] || {};
        const periodAttendance = { ...currentStudentData };
        
        // Apply status to all assigned periods
        assignedPeriods.forEach(period => {
          periodAttendance[period] = status;
        });

        const updated = {
          ...prev,
          [studentId]: periodAttendance
        };
        return updated;
      });

      // Call parent handler without period number (global change)
      onStatusChange(studentId, status);

      const student = students.find(s => s.id === studentId);
      if (student) {
        toast.success(
          `${student.name} marked as ${status} for all assigned periods (${assignedPeriods.join(', ')})`,
          { duration: 3000 }
        );
      }
    }
  };

  // Handle individual student selection
  const handleStudentSelect = (studentId: string, checked: boolean) => {
    onStudentSelect?.(studentId, checked);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    onSelectAll?.(checked);
  };

  // Check if all students are selected
  const allSelected = students.length > 0 && 
    students.every(student => selectedStudents.includes(student.id));

  // Check if some students are selected
  const someSelected = selectedStudents.length > 0 && !allSelected;

  // Get student initials for avatar fallback
  const getStudentInitials = (student: StudentWithAttendance) => {
    const names = student.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Failed to load students</h3>
            <p className="text-slate-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Attendance Grid Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Student Attendance</h3>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    ref={(el) => {
                      if (el) {
                        const inputEl = el.querySelector('input');
                        if (inputEl) {
                          inputEl.indeterminate = someSelected;
                        }
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold text-slate-700 min-w-[200px]">Student</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">ID</TableHead>
                
                {/* Global Status Column */}
                <TableHead className="font-semibold text-slate-700 text-center min-w-[120px]">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">Global</div>
                    <div className="text-xs text-slate-500">All Periods</div>
                    <div className="text-xs text-slate-500">Sick / Leave</div>
                  </div>
                </TableHead>
                
                {/* Period Columns */}
                {getAssignedPeriods.map((periodNumber) => {
                  const teacherInfo = getTeacherForPeriod(periodNumber);
                  const isAssigned = isTeacherAssignedToPeriod(periodNumber);
                  
                  return (
                    <TableHead 
                      key={`period-${periodNumber}`}
                      className="font-semibold text-slate-700 text-center min-w-[120px]"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-blue-600">
                          Period {periodNumber}
                        </div>
                        {isAssigned && (
                          <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Assigned
                          </div>
                        )}
                        {teacherInfo && (
                          <div className="text-xs text-slate-500">
                            {teacherInfo.startTime} - {teacherInfo.endTime}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-b border-slate-100">
                      <TableCell className="pl-6">
                        <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mx-auto" />
                      </TableCell>
                      
                      {/* Global status skeleton */}
                      <TableCell className="text-center p-2">
                        <div className="space-y-2">
                          <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
                          <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
                        </div>
                      </TableCell>
                      
                      {/* Period skeleton columns */}
                      {getAssignedPeriods.map((periodNumber) => (
                        <TableCell key={`skeleton-period-${periodNumber}`} className="text-center p-2">
                          <div className="space-y-2">
                            <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
                            <div className="h-8 w-full bg-slate-200 rounded animate-pulse" />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : students.length === 0 ? (
                  <TableRow className="border-b border-slate-100">
                    <TableCell colSpan={4 + getAssignedPeriods.length} className="text-center py-12">
                      <div className="space-y-4">
                        <Users className="h-12 w-12 text-slate-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">No students found</h3>
                          <p className="text-slate-600 mt-1">No students are enrolled in this class</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => {
                    const isSelected = selectedStudents.includes(student.id);
                    
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border-b border-slate-100 transition-colors duration-200 hover:bg-slate-50",
                          isSelected && "bg-blue-50"
                        )}
                      >
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleStudentSelect(student.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={undefined} alt={student.name} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                                {getStudentInitials(student)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">{student.name}</p>
                              <p className="text-sm text-slate-600">{student.programs}</p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="font-mono text-sm text-slate-700">
                            {student.studentId}
                          </span>
                        </TableCell>
                        
                        {/* Global Status Column */}
                        <TableCell className="text-center p-2">
                          <div className="space-y-2">
                            {/* Sick Button */}
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStatusChange(student.id, 'SICK');
                              }}
                              className={cn(
                                "w-full h-8 text-xs font-medium rounded-lg transition-all duration-200 border-0",
                                getCurrentStatus(student.id) === 'SICK'
                                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                              )}
                            >
                              <Heart className="h-3 w-3 mr-1" />
                              Sick
                            </Button>
                            
                            {/* Leave Button */}
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStatusChange(student.id, 'LEAVE');
                              }}
                              className={cn(
                                "w-full h-8 text-xs font-medium rounded-lg transition-all duration-200 border-0",
                                getCurrentStatus(student.id) === 'LEAVE'
                                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                              )}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Leave
                            </Button>
                          </div>
                        </TableCell>

                        {/* Period Status Columns */}
                        {getAssignedPeriods.map((periodNumber) => {
                          const isAssigned = isTeacherAssignedToPeriod(periodNumber);
                          const periodStatus = getCurrentStatus(student.id, periodNumber);
                          
                          return (
                            <TableCell 
                              key={`${student.id}-period-${periodNumber}`}
                              className="text-center p-2"
                            >
                              {isAssigned ? (
                                <div className="space-y-2">
                                  {/* Present Button */}
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStatusChange(student.id, 'PRESENT', periodNumber);
                                    }}
                                    className={cn(
                                      "w-full h-8 text-xs font-medium rounded-lg transition-all duration-200 border-0",
                                      periodStatus === 'PRESENT'
                                        ? "bg-green-500 hover:bg-green-600 text-white shadow-md"
                                        : "bg-green-50 text-green-700 hover:bg-green-100"
                                    )}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Present
                                  </Button>
                                  
                                  {/* Absent Button */}
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStatusChange(student.id, 'ABSENT', periodNumber);
                                    }}
                                    className={cn(
                                      "w-full h-8 text-xs font-medium rounded-lg transition-all duration-200 border-0",
                                      periodStatus === 'ABSENT'
                                        ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                                        : "bg-red-50 text-red-700 hover:bg-red-100"
                                    )}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Absent
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-slate-400">
                                  <XCircle className="h-6 w-6 mx-auto mb-1" />
                                  <div className="text-xs">Not Assigned</div>
                                </div>
                              )}
                            </TableCell>
                          );
                        })}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}