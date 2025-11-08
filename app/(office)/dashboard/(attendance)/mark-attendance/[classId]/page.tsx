/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ModernDashboardLayout,
  PageContainer,
} from "@/components/layout/modern-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CustomSelect } from "@/components/ui/custom-select";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  GraduationCap,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  Heart,
  Zap,
  RotateCcw,
  User,
  Search,
  Plus,
  Save,
} from "lucide-react";
import { addDays, subDays, getDay } from "date-fns";
import { formatSolarDate, isSolarToday } from "@/lib/utils/solar-calendar";
import type { AttendanceStatus, Student, AttendanceRecord, ScheduleEntry } from "@/types/attendance";

type ClassItem = {
  id: string;
  name: string;
  session: "MORNING" | "AFTERNOON";
  studentCount: number;
  major: string;
  semester: number;
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

interface StudentAttendanceRowProps {
  student: Student;
  standardPeriods: {
    periodNumber: number;
    startTime: string;
    endTime: string;
    teacherName: string;
    subject: string;
  }[];
  attendanceRecords: Map<string, AttendanceRecord>;
  onStatusChange: (studentId: string, periodNumber: number, status: AttendanceStatus) => void;
  index: number;
}

function StudentAttendanceRow({ student, standardPeriods, attendanceRecords, onStatusChange, index }: StudentAttendanceRowProps) {
  const fullName = `${student.firstName} ${student.lastName}`;

  const getRecordForPeriod = React.useCallback((periodNumber: number): AttendanceRecord | undefined => {
    const key = `${student.id}-${periodNumber}`;
    return attendanceRecords.get(key);
  }, [attendanceRecords, student.id]);

  // Check if ALL periods are marked as SICK or LEAVE (for day status display and period button disabling)
  const isDaySickOrLeave = React.useMemo(() => {
    const firstPeriodRecord = getRecordForPeriod(1);
    if (!firstPeriodRecord || (firstPeriodRecord.status !== "SICK" && firstPeriodRecord.status !== "LEAVE")) {
      return false;
    }
    
    // Check if all 6 periods have the same SICK or LEAVE status
    const allSameStatus = standardPeriods.every(period => {
      const record = getRecordForPeriod(period.periodNumber);
      return record && record.status === firstPeriodRecord.status;
    });
    
    return allSameStatus;
  }, [getRecordForPeriod, standardPeriods]);

  const daySickLeaveStatus = isDaySickOrLeave ? getRecordForPeriod(1)?.status : null;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={cn(
        "hover:bg-slate-50/50 transition-colors duration-200",
        isDaySickOrLeave && "bg-amber-50/40",
        index % 2 === 0 && "bg-slate-50/30"
      )}
    >
      <td className="px-3 py-4 text-center sticky left-0 bg-white shadow-sm">
        <div className="h-8 w-8 mx-auto rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-700">{index + 1}</span>
        </div>
      </td>

      <td className="px-4 py-4 sticky left-8 md:left-12 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-slate-900 truncate">{fullName}</p>
            <p className="text-xs text-slate-600 truncate">{student.fatherName}</p>
            <p className="text-xs text-slate-500 font-mono">{student.studentId}</p>
          </div>
        </div>
      </td>

      <td className="px-3 py-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col gap-2 min-w-[100px]">
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.1 }}>
            <Button
              size="sm"
              onClick={() => onStatusChange(student.id, -1, "SICK")}
              className={cn(
                "h-9 px-3 rounded-lg transition-all duration-300 w-full text-xs font-semibold shadow-sm",
                daySickLeaveStatus === "SICK"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-amber-200"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-amber-200"
              )}
              title="Mark as Sick for entire day"
            >
              <Heart className="h-4 w-4 mr-1.5" />
              Sick
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.1 }}>
            <Button
              size="sm"
              onClick={() => onStatusChange(student.id, -1, "LEAVE")}
              className={cn(
                "h-9 px-3 rounded-lg transition-all duration-300 w-full text-xs font-semibold shadow-sm",
                daySickLeaveStatus === "LEAVE"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 shadow-cyan-200"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-cyan-200"
              )}
              title="Mark as Leave for entire day"
            >
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              Leave
            </Button>
          </motion.div>
        </div>
      </td>

      {standardPeriods.map((period) => {
        const record = getRecordForPeriod(period.periodNumber);
        const status = record?.status || "NOT_MARKED";

        return (
          <td key={period.periodNumber} className="px-2 py-3 text-center bg-white">
            <div className="flex flex-col gap-2 min-w-[90px]">
              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.1 }}>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(student.id, period.periodNumber, "PRESENT")}
                  disabled={isDaySickOrLeave}
                  className={cn(
                    "h-9 w-full px-2 rounded-lg transition-all duration-300 text-xs font-semibold",
                    isDaySickOrLeave && daySickLeaveStatus === "SICK"
                      ? "bg-amber-600 text-white cursor-not-allowed"
                      : isDaySickOrLeave && daySickLeaveStatus === "LEAVE"
                        ? "bg-cyan-600 text-white cursor-not-allowed"
                        : status === "PRESENT"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                  )}
                  title={isDaySickOrLeave ? `Marked as ${daySickLeaveStatus} for entire day` : "Mark as Present"}
                >
                  {isDaySickOrLeave && daySickLeaveStatus === "SICK" ? (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Sick
                    </>
                  ) : isDaySickOrLeave && daySickLeaveStatus === "LEAVE" ? (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Leave
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Present
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.1 }}>
                <Button
                  size="sm"
                  onClick={() => onStatusChange(student.id, period.periodNumber, "ABSENT")}
                  disabled={isDaySickOrLeave}
                  className={cn(
                    "h-9 w-full px-2 rounded-lg transition-all duration-300 text-xs font-semibold",
                    isDaySickOrLeave && daySickLeaveStatus === "SICK"
                      ? "bg-amber-600 text-white cursor-not-allowed"
                      : isDaySickOrLeave && daySickLeaveStatus === "LEAVE"
                        ? "bg-cyan-600 text-white cursor-not-allowed"
                        : status === "ABSENT"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                  )}
                  title={isDaySickOrLeave ? `Marked as ${daySickLeaveStatus} for entire day` : "Mark as Absent"}
                >
                  {isDaySickOrLeave && daySickLeaveStatus === "SICK" ? (
                    <>
                      <Heart className="h-4 w-4 mr-1" />
                      Sick
                    </>
                  ) : isDaySickOrLeave && daySickLeaveStatus === "LEAVE" ? (
                    <>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Leave
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Absent
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </td>
        );
      })}
    </motion.tr>
  );
}

export default function MarkAttendanceClassPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const { user, isLoading: authLoading } = useAuth({ requiredRole: "OFFICE" });
  const [currentPath] = React.useState("/dashboard/mark-attendance");
  const [classData, setClassData] = React.useState<ClassItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = React.useState<Map<string, AttendanceRecord>>(new Map());
  const [showMarkAllDialog, setShowMarkAllDialog] = React.useState(false);
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showAuthDialog, setShowAuthDialog] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authPassword, setAuthPassword] = React.useState("");

  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = React.useState(true);
  const [studentsError, setStudentsError] = React.useState<string | null>(null);

  const [schedule, setSchedule] = React.useState<ScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = React.useState(true);
  const [totalPeriods, setTotalPeriods] = React.useState(0);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | AttendanceStatus>("ALL");

  // Generate 6 standard periods for display (always show 6 columns)
  const standardPeriods = React.useMemo(() => {
    const periods = [];
    const morningTimes = [
      { start: '08:30', end: '09:10' }, // Period 1
      { start: '09:10', end: '09:50' }, // Period 2
      { start: '09:50', end: '10:30' }, // Period 3
      { start: '10:45', end: '11:25' }, // Period 4
      { start: '11:25', end: '12:05' }, // Period 5
      { start: '12:05', end: '12:45' }, // Period 6
    ];

    // Debug: Log the schedule data
    console.log('[StandardPeriods] Schedule data:', schedule);
    console.log('[StandardPeriods] Schedule length:', schedule.length);

    for (let i = 1; i <= 6; i++) {
      // Find the actual schedule entry for this period
      const scheduleEntry = schedule.find(s => s.periodNumber === i);
      
      console.log(`[StandardPeriods] Period ${i}:`, scheduleEntry);
      
      periods.push({
        periodNumber: i,
        startTime: scheduleEntry?.startTime || morningTimes[i - 1].start,
        endTime: scheduleEntry?.endTime || morningTimes[i - 1].end,
        teacherName: scheduleEntry?.teacherName || `Teacher ${Math.ceil(i / 2)}`, // Default teacher names
        subject: scheduleEntry?.subject || `Subject ${i}`,
      });
    }
    
    console.log('[StandardPeriods] Final periods:', periods);
    return periods;
  }, [schedule]);

  const loadClassData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      const foundClass = data.find((c: ClassItem) => c.id === classId);
      if (!foundClass) throw new Error("Class not found");
      setClassData(foundClass);
    } catch (error) {
      console.error("Error fetching class:", error);
      setError("Failed to load class details");
      toast.error("Failed to load class details", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const loadSchedule = React.useCallback(async () => {
    if (!classData) return;
    try {
      setScheduleLoading(true);
      const dayIndex = getDay(selectedDate);
      const dayOfWeek = DAY_NAMES[dayIndex];
      const params = new URLSearchParams({
        classId: classData.id,
        className: classData.name,
        session: classData.session,
        dayOfWeek: dayOfWeek
      });
      
      console.log('[LoadSchedule] Fetching schedule with params:', {
        classId: classData.id,
        className: classData.name,
        session: classData.session,
        dayOfWeek: dayOfWeek
      });
      
      const response = await fetch(`/api/schedule?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch schedule");
      const result = await response.json();
      
      console.log('[LoadSchedule] API Response:', result);
      console.log('[LoadSchedule] Schedule data:', result.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log('[LoadSchedule] Teacher names:', result.data?.map((s: any) => s.teacherName));
      
      setSchedule(result.data);
      setTotalPeriods(result.totalPeriods);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule([]);
      setTotalPeriods(0);
    } finally {
      setScheduleLoading(false);
    }
  }, [classData, selectedDate]);

  const loadStudents = React.useCallback(async () => {
    if (!classData) return;
    try {
      setStudentsLoading(true);
      setStudentsError(null);
      const classSectionKey = `${classData.name} - ${classData.session}`;
      const response = await fetch(`/api/students?classSection=${encodeURIComponent(classSectionKey)}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data: Student[] = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentsError("Failed to load students");
      toast.error("Failed to load students", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
    } finally {
      setStudentsLoading(false);
    }
  }, [classData]);

  React.useEffect(() => {
    if (user) loadClassData();
  }, [user, loadClassData]);

  React.useEffect(() => {
    if (classData) {
      loadStudents();
      loadSchedule();
    }
  }, [classData, loadStudents, loadSchedule]);

  React.useEffect(() => {
    if (classData) {
      loadSchedule();
      setAttendanceRecords(new Map());
    }
  }, [selectedDate, classData, loadSchedule]);

  const handleNavigation = (path: string) => router.push(path);
  const handleLogout = async () => {
    const { handleLogout: performLogout } = await import("@/lib/auth/logout");
    await performLogout();
    router.push("/login");
  };
  const handleSearch = () => { };
  const handlePreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => {
    if (!isSolarToday(selectedDate)) setSelectedDate((prev) => addDays(prev, 1));
  };
  const isToday = isSolarToday(selectedDate);

  const totalStudents = students.length;
  const getUniqueStudentsByStatus = React.useCallback((status: AttendanceStatus) => {
    const uniqueStudents = new Set<string>();
    attendanceRecords.forEach((record) => {
      if (record.status === status) uniqueStudents.add(record.studentId);
    });
    return uniqueStudents.size;
  }, [attendanceRecords]);

  const presentCount = React.useMemo(() => getUniqueStudentsByStatus("PRESENT"), [getUniqueStudentsByStatus]);
  const absentCount = React.useMemo(() => getUniqueStudentsByStatus("ABSENT"), [getUniqueStudentsByStatus]);
  const sickCount = React.useMemo(() => getUniqueStudentsByStatus("SICK"), [getUniqueStudentsByStatus]);
  const leaveCount = React.useMemo(() => getUniqueStudentsByStatus("LEAVE"), [getUniqueStudentsByStatus]);
  const notMarkedCount = React.useMemo(() => {
    const markedStudents = new Set<string>();
    attendanceRecords.forEach((record) => markedStudents.add(record.studentId));
    return totalStudents - markedStudents.size;
  }, [totalStudents, attendanceRecords]);

  const handleStatusChange = React.useCallback((studentId: string, periodNumber: number, status: AttendanceStatus) => {
    // periodNumber = -1 means "all periods" (used for Sick/Leave from Day Status)
    if (periodNumber === -1 && (status === "SICK" || status === "LEAVE")) {
      // Mark all 6 periods as SICK or LEAVE
      setAttendanceRecords(prev => {
        const newRecords = new Map(prev);
        standardPeriods.forEach(standardPeriod => {
          const key = `${studentId}-${standardPeriod.periodNumber}`;
          newRecords.set(key, {
            studentId,
            status,
            periodNumber: standardPeriod.periodNumber,
            markedAt: new Date(),
            teacherName: standardPeriod.teacherName,
            subject: standardPeriod.subject,
          });
        });
        return newRecords;
      });
      toast.success(`Student marked as ${status} for entire day`, {
        description: `All 6 periods marked as ${status}`,
        className: "bg-green-50 border-green-200 text-green-900",
        position: "top-center",
      });
    } else {
      // Mark individual period
      const period = standardPeriods.find(s => s.periodNumber === periodNumber);
      setAttendanceRecords(prev => {
        const newRecords = new Map(prev);
        const key = `${studentId}-${periodNumber}`;
        newRecords.set(key, {
          studentId,
          status,
          periodNumber,
          markedAt: new Date(),
          teacherName: period?.teacherName,
          subject: period?.subject,
        });
        return newRecords;
      });
      toast.success("Attendance marked", {
        description: `Period ${periodNumber} marked as ${status}`,
        className: "bg-green-50 border-green-200 text-green-900",
        position: "top-center",
      });
    }
  }, [standardPeriods]);

  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === "ALL") {
        return matchesSearch;
      }
      
      // Check if student has any period with the filtered status
      const hasStatus = standardPeriods.some(period => {
        const key = `${student.id}-${period.periodNumber}`;
        const record = attendanceRecords.get(key);
        return record?.status === statusFilter;
      });
      
      // For NOT_MARKED, check if student has no records at all
      if (statusFilter === "NOT_MARKED") {
        const hasAnyRecord = standardPeriods.some(period => {
          const key = `${student.id}-${period.periodNumber}`;
          return attendanceRecords.has(key);
        });
        return matchesSearch && !hasAnyRecord;
      }
      
      return matchesSearch && hasStatus;
    });
  }, [students, searchQuery, statusFilter, attendanceRecords, standardPeriods]);

  const handleMarkAllPresent = React.useCallback(() => {
    const newRecords = new Map<string, AttendanceRecord>();
    students.forEach(student => {
      standardPeriods.forEach(standardPeriod => {
        const key = `${student.id}-${standardPeriod.periodNumber}`;
        newRecords.set(key, {
          studentId: student.id,
          status: "PRESENT",
          periodNumber: standardPeriod.periodNumber,
          markedAt: new Date(),
          teacherName: standardPeriod.teacherName,
          subject: standardPeriod.subject,
        });
      });
    });
    setAttendanceRecords(newRecords);
    setShowMarkAllDialog(false);
    toast.success("All students marked present", {
      description: `${students.length} students × 6 periods marked as present`,
      className: "bg-green-50 border-green-200 text-green-900",
      position: "top-center",
    });
  }, [students, standardPeriods]);

  const handleResetAll = React.useCallback(() => {
    setAttendanceRecords(new Map());
    setShowResetDialog(false);
    toast.info("Attendance reset", {
      description: "All attendance records cleared",
      position: "top-center",
    });
  }, []);

  const handleAuthenticate = React.useCallback(async () => {
    if (!authPassword.trim()) {
      toast.error("Please enter password", {
        description: "Password is required",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
      return;
    }

    if (!user?.email) {
      toast.error("Authentication error", {
        description: "User email not found",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
      return;
    }

    try {
      // Call the verify-password API endpoint
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: authPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Password verified successfully
        setIsAuthenticated(true);
        setShowAuthDialog(false);
        setAuthPassword("");
        toast.success("Authentication successful", {
          description: "You can now submit attendance",
          className: "bg-green-50 border-green-200 text-green-900",
          position: "top-center",
        });
      } else {
        // Authentication failed
        console.error('Authentication failed:', data);
        
        // Show debug info in development
        if (process.env.NODE_ENV === 'development' && data.debug) {
          console.error('Debug info:', data.debug);
        }
        
        toast.error("Authentication failed", {
          description: data.message || "Invalid password. Please try again.",
          className: "bg-red-50 border-red-200 text-red-900",
          position: "top-center",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error("Authentication error", {
        description: "Failed to verify password. Please try again.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
    }
  }, [authPassword, user]);

  const handleSubmitAttendance = React.useCallback(async () => {
    if (!classData) return;

    // Check if there are any attendance records
    if (attendanceRecords.size === 0) {
      toast.error("No attendance records to save", {
        description: "Please mark attendance for at least one student",
        position: "top-center",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Convert Map to array for API
      const records = Array.from(attendanceRecords.values());

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: classData.id,
          date: selectedDate.toISOString().split('T')[0],
          records: records,
          markedBy: user?.id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save attendance');
      }

      toast.success("Attendance saved successfully!", {
        description: `Saved ${data.saved} attendance records for ${formatSolarDate(selectedDate, "long")}`,
        className: "bg-green-50 border-green-200 text-green-900",
        position: "top-center",
      });

    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error("Failed to save attendance", {
        description: error instanceof Error ? error.message : "Please try again",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "top-center",
      });
    } finally {
      setIsSaving(false);
    }
  }, [classData, selectedDate, attendanceRecords, user]);

  const displayUser = user ? {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email || "",
    role: user.role,
  } : { name: "User", email: "", role: "OFFICE" as const };

  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return null;

  if (loading) {
    return (
      <ModernDashboardLayout user={displayUser} title="Mark Attendance" subtitle="Loading class details..." currentPath={currentPath} onNavigate={handleNavigation} onLogout={handleLogout} onSearch={handleSearch} hideSearch={true}>
        <PageContainer>
          <div className="py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
            <p className="text-slate-600">Loading class details...</p>
          </div>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  if (error || !classData) {
    return (
      <ModernDashboardLayout user={displayUser} title="Mark Attendance" subtitle="Error loading class" currentPath={currentPath} onNavigate={handleNavigation} onLogout={handleLogout} onSearch={handleSearch} hideSearch={true}>
        <PageContainer>
          <Card className="rounded-2xl shadow-md border-0 bg-red-50">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 w-fit mx-auto rounded-2xl mb-4">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">Failed to Load Class</h3>
              <p className="text-red-700 mb-6 max-w-md mx-auto">{error || "Class not found"}</p>
              <Button onClick={() => router.push("/dashboard/mark-attendance")} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg border-0">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Classes
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
      </ModernDashboardLayout>
    );
  }

  return (
    <ModernDashboardLayout user={displayUser} title={`Mark Attendance - ${classData.name}`} subtitle={`${classData.major} • Semester ${classData.semester} • ${classData.session}`} currentPath={currentPath} onNavigate={handleNavigation} onLogout={handleLogout} onSearch={handleSearch} hideSearch={true}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <PageContainer>
          <div className="mb-6">
            <Button onClick={() => router.push("/dashboard/mark-attendance")} className="h-11 bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-0 touch-manipulation">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
          </div>

          <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 mb-6 md:mb-8">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className="p-3 md:p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg flex-shrink-0">
                    <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 truncate">{classData.name}</h2>
                    <p className="text-sm md:text-base text-slate-700 truncate">{classData.major} • Semester {classData.semester}</p>
                  </div>
                </div>
                <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-1.5 md:gap-2 flex-shrink-0 ${classData.session === "MORNING" ? "bg-amber-200 text-amber-800" : "bg-indigo-200 text-indigo-800"}`}>
                  {classData.session === "MORNING" ? <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                  {classData.session}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-slate-200 mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <Button variant="outline" size="sm" onClick={handlePreviousDay} className="h-11 border-slate-300 hover:bg-slate-50 touch-manipulation">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-600">Marking attendance for</p>
                      <p className="text-base md:text-lg font-bold text-slate-900">{formatSolarDate(selectedDate, "long")}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleNextDay} disabled={isToday} className="h-11 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-11 border-orange-300 text-orange-600 hover:bg-orange-50 touch-manipulation w-full md:w-auto">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Change Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                          toast.success("Date changed", {
                            description: `Viewing attendance for ${formatSolarDate(date, "long")}`,
                            position: "top-center",
                          });
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-orange-600 rounded-lg flex-shrink-0">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-orange-600 truncate">Total</p>
                      <p className="text-xl md:text-2xl font-bold text-orange-700">{totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-green-600 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-green-600 truncate">Present</p>
                      <p className="text-xl md:text-2xl font-bold text-green-700">{presentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-red-600 rounded-lg flex-shrink-0">
                      <XCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-red-600 truncate">Absent</p>
                      <p className="text-xl md:text-2xl font-bold text-red-700">{absentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-amber-600 rounded-lg flex-shrink-0">
                      <Heart className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-amber-600 truncate">Sick</p>
                      <p className="text-xl md:text-2xl font-bold text-amber-700">{sickCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-cyan-50 to-cyan-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-cyan-600 rounded-lg flex-shrink-0">
                      <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-cyan-600 truncate">Leave</p>
                      <p className="text-xl md:text-2xl font-bold text-cyan-700">{leaveCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
              <Card className="rounded-xl shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100/50">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-slate-600 rounded-lg flex-shrink-0">
                      <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-600 truncate">Not Marked</p>
                      <p className="text-xl md:text-2xl font-bold text-slate-700">{notMarkedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="rounded-2xl shadow-md border-0 bg-white mb-6">
            <CardContent className="p-4 md:p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 text-base">Quick Actions</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {!isAuthenticated ? (
                    <Button 
                      onClick={() => setShowAuthDialog(true)} 
                      disabled={attendanceRecords.size === 0}
                      className="h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed border-0"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Authenticate to Submit
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmitAttendance} 
                      disabled={isSaving || attendanceRecords.size === 0}
                      className="h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed border-0"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Submit Attendance
                        </>
                      )}
                    </Button>
                  )}
                  <Button onClick={() => setShowMarkAllDialog(true)} className="h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation border-0">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button onClick={() => setShowResetDialog(true)} className="h-11 bg-white hover:bg-slate-50 text-slate-700 shadow-sm touch-manipulation border-0">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md border-0 bg-white mb-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input type="text" placeholder="Search by name or student ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 border border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-base bg-white" />
                </div>
                <div className="w-full md:w-64">
                  <CustomSelect value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as "ALL" | AttendanceStatus)} placeholder="Filter by status" className="h-11 border border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-base bg-white">
                    <option value="ALL">All Statuses</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="SICK">Sick</option>
                    <option value="LEAVE">Leave</option>
                    <option value="NOT_MARKED">Not Marked</option>
                  </CustomSelect>
                </div>
              </div>
            </CardContent>
          </Card>

          {studentsLoading ? (
            <Card className="rounded-2xl shadow-md border-0 bg-white">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
                <p className="text-slate-600">Loading students...</p>
              </CardContent>
            </Card>
          ) : studentsError ? (
            <Card className="rounded-2xl shadow-md border-0 bg-red-50">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 w-fit mx-auto rounded-2xl mb-4">
                  <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">Failed to Load Students</h3>
                <p className="text-red-700 mb-6 max-w-md mx-auto">{studentsError}</p>
                <Button onClick={loadStudents} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg">
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : students.length === 0 ? (
            <Card className="rounded-2xl shadow-md border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 w-fit mx-auto rounded-2xl mb-4">
                  <Users className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Students Enrolled</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">Add students to this class to mark attendance</p>
                <Button onClick={() => router.push("/dashboard/students")} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Go to Students
                </Button>
              </CardContent>
            </Card>
          ) : filteredStudents.length === 0 ? (
            <Card className="rounded-2xl shadow-md border-slate-200">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 w-fit mx-auto rounded-2xl mb-4">
                  <Search className="h-16 w-16 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No Students Found</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">Try adjusting your search or filter criteria</p>
                <Button onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : scheduleLoading ? (
            <Card className="rounded-2xl shadow-md border-slate-200">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
                <p className="text-slate-600">Loading schedule...</p>
              </CardContent>
            </Card>
          ) : schedule.length === 0 ? (
            <Card className="rounded-2xl shadow-md border-amber-200 bg-amber-50">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 w-fit mx-auto rounded-2xl mb-4">
                  <AlertCircle className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">No Schedule for This Day</h3>
                <p className="text-amber-700 mb-6 max-w-md mx-auto">There are no scheduled classes for {formatSolarDate(selectedDate, "long")}</p>
              </CardContent>
            </Card>
          ) : (

            <Card className="rounded-2xl shadow-md border-slate-200 overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-orange-50 to-amber-50 z-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider sticky left-8 md:left-12 bg-gradient-to-r from-orange-50 to-amber-50 z-10">
                        <div className="flex flex-col gap-0.5">
                          <span>Name</span>
                          <span className="text-[10px] font-normal text-slate-500">Father Name / Student ID</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider bg-gradient-to-br from-slate-50 to-slate-100">
                        <div className="flex flex-col items-center gap-1">
                          <span>Day Status</span>
                          <span className="text-[10px] font-normal text-slate-500">(Sick/Leave)</span>
                        </div>
                      </th>
                      {standardPeriods.map((period) => (
                        <th key={period.periodNumber} className="px-3 py-3 text-center bg-gradient-to-b from-orange-50 to-amber-50">
                          <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <div className="text-sm font-bold text-orange-600">{period.startTime}-{period.endTime}</div>
                            <div className="text-xs text-slate-600 font-medium px-2 py-1 bg-white rounded-md">{period.teacherName}</div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredStudents.map((student, index) => (
                      <StudentAttendanceRow
                        key={student.id}
                        student={student}

                        standardPeriods={standardPeriods}
                        attendanceRecords={attendanceRecords}
                        onStatusChange={handleStatusChange}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-lg shadow-sm border border-orange-200">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-bold text-slate-700">Total Periods: <span className="text-orange-600">6</span></span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Dialog open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark All Students Present?</DialogTitle>
                <DialogDescription>
                  This will mark all {totalStudents} students in {classData.name} as present for {formatSolarDate(selectedDate, "long")}. This action will override any existing attendance records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMarkAllDialog(false)}>Cancel</Button>
                <Button onClick={handleMarkAllPresent} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset All Attendance?</DialogTitle>
                <DialogDescription>
                  This will clear all attendance records for {classData.name} on {formatSolarDate(selectedDate, "long")}. All students will be marked as &quot;Not Marked&quot;. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
                <Button onClick={handleResetAll} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Authenticate to Submit Attendance</DialogTitle>
                <DialogDescription>
                  Please enter your password to authenticate and submit the attendance records for {classData.name} on {formatSolarDate(selectedDate, "long")}.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="auth-password" className="text-sm font-medium text-slate-700 mb-2 block">
                      Password
                    </label>
                    <Input
                      id="auth-password"
                      type="password"
                      placeholder="Enter your password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAuthenticate();
                        }
                      }}
                      className="h-12 text-base border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Authentication ensures that only authorized personnel can submit attendance records.
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowAuthDialog(false);
                  setAuthPassword("");
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAuthenticate}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Authenticate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageContainer>
      </motion.div>
    </ModernDashboardLayout>
  );
}
