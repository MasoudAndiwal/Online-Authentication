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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomSelect } from "@/components/shared/custom-select";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  GraduationCap,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  XCircle,
  Heart,
  Calendar as CalendarIcon,
  Zap,
  RotateCcw,
  User,
  Search,
  Plus,
} from "lucide-react";
import { format, addDays, subDays, isToday as checkIsToday } from "date-fns";
import type { AttendanceStatus, Student, AttendanceRecord } from "@/types/attendance";

type ClassItem = {
  id: string;
  name: string;
  session: "MORNING" | "AFTERNOON";
  studentCount: number;
  major: string;
  semester: number;
};

// Helper function to get status badge configuration
function getStatusBadgeConfig(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return {
        label: "Present",
        className: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle,
      };
    case "ABSENT":
      return {
        label: "Absent",
        className: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
      };
    case "SICK":
      return {
        label: "Sick",
        className: "bg-amber-100 text-amber-700 border-amber-200",
        icon: Heart,
      };
    case "LEAVE":
      return {
        label: "Leave",
        className: "bg-cyan-100 text-cyan-700 border-cyan-200",
        icon: CalendarIcon,
      };
    case "NOT_MARKED":
    default:
      return {
        label: "Not Marked",
        className: "bg-slate-100 text-slate-600 border-slate-200",
        icon: AlertCircle,
      };
  }
}

// StudentAttendanceCard Component
interface StudentAttendanceCardProps {
  student: Student;
  status: AttendanceStatus;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
}

function StudentAttendanceCard({ student, status, onStatusChange }: StudentAttendanceCardProps) {
  const badgeConfig = getStatusBadgeConfig(status);
  const BadgeIcon = badgeConfig.icon;
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <Card className="rounded-xl shadow-md border-slate-200 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        {/* Student Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-slate-900 truncate">{fullName}</h4>
              <p className="text-xs text-slate-500">{student.studentId}</p>
            </div>
          </div>
          
          <Badge className={cn("flex items-center gap-1 border", badgeConfig.className)}>
            <BadgeIcon className="h-3 w-3" />
            <span className="text-xs">{badgeConfig.label}</span>
          </Badge>
        </div>
        
        {/* Status Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={() => onStatusChange(student.id, "PRESENT")}
            className={cn(
              "h-10 rounded-lg transition-all duration-200",
              status === "PRESENT"
                ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            )}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Present
          </Button>
          
          <Button
            size="sm"
            onClick={() => onStatusChange(student.id, "ABSENT")}
            className={cn(
              "h-10 rounded-lg transition-all duration-200",
              status === "ABSENT"
                ? "bg-red-600 text-white hover:bg-red-700 shadow-md"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            )}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Absent
          </Button>
          
          <Button
            size="sm"
            onClick={() => onStatusChange(student.id, "SICK")}
            className={cn(
              "h-10 rounded-lg transition-all duration-200",
              status === "SICK"
                ? "bg-amber-600 text-white hover:bg-amber-700 shadow-md"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
            )}
          >
            <Heart className="h-4 w-4 mr-1" />
            Sick
          </Button>
          
          <Button
            size="sm"
            onClick={() => onStatusChange(student.id, "LEAVE")}
            className={cn(
              "h-10 rounded-lg transition-all duration-200",
              status === "LEAVE"
                ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-md"
                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200"
            )}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Leave
          </Button>
        </div>
      </CardContent>
    </Card>
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
  const [attendanceRecords, setAttendanceRecords] = React.useState<
    Map<string, AttendanceRecord>
  >(new Map());
  const [showMarkAllDialog, setShowMarkAllDialog] = React.useState(false);
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  
  // Student data state
  const [students, setStudents] = React.useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = React.useState(true);
  const [studentsError, setStudentsError] = React.useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | AttendanceStatus>("ALL");

  // Fetch class details
  const loadClassData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      const foundClass = data.find((c: ClassItem) => c.id === classId);
      if (!foundClass) {
        throw new Error("Class not found");
      }
      setClassData(foundClass);
    } catch (error) {
      console.error("Error fetching class:", error);
      setError("Failed to load class details");
      toast.error("Failed to load class details", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  }, [classId]);

  // Fetch students for the selected class
  const loadStudents = React.useCallback(async () => {
    if (!classData) return;
    
    try {
      setStudentsLoading(true);
      setStudentsError(null);
      const response = await fetch(`/api/students?classSection=${encodeURIComponent(classData.name)}`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data: Student[] = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudentsError("Failed to load students");
      toast.error("Failed to load students", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-red-900",
        position: "bottom-center",
      });
    } finally {
      setStudentsLoading(false);
    }
  }, [classData]);

  React.useEffect(() => {
    if (user) {
      loadClassData();
    }
  }, [user, loadClassData]);

  React.useEffect(() => {
    if (classData) {
      loadStudents();
    }
  }, [classData, loadStudents]);

  // Navigation handler
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Logout handler
  const handleLogout = async () => {
    const { handleLogout: performLogout } = await import("@/lib/auth/logout");
    await performLogout();
    router.push("/login");
  };

  // Search handler
  const handleSearch = () => {
    // Not used on this page
  };

  // Date navigation handlers
  const handlePreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    if (!checkIsToday(selectedDate)) {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  };

  const isToday = checkIsToday(selectedDate);

  // Calculate attendance statistics
  const totalStudents = students.length;
  const presentCount = React.useMemo(() => {
    return Array.from(attendanceRecords.values()).filter(
      (record) => record.status === "PRESENT"
    ).length;
  }, [attendanceRecords]);

  const absentCount = React.useMemo(() => {
    return Array.from(attendanceRecords.values()).filter(
      (record) => record.status === "ABSENT"
    ).length;
  }, [attendanceRecords]);

  const sickCount = React.useMemo(() => {
    return Array.from(attendanceRecords.values()).filter(
      (record) => record.status === "SICK"
    ).length;
  }, [attendanceRecords]);

  const leaveCount = React.useMemo(() => {
    return Array.from(attendanceRecords.values()).filter(
      (record) => record.status === "LEAVE"
    ).length;
  }, [attendanceRecords]);

  const notMarkedCount = React.useMemo(() => {
    return totalStudents - attendanceRecords.size;
  }, [totalStudents, attendanceRecords]);

  // Handle individual student status change
  const handleStatusChange = React.useCallback((studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const newRecords = new Map(prev);
      newRecords.set(studentId, {
        studentId,
        status,
        markedAt: new Date(),
      });
      return newRecords;
    });
    
    // Show success toast
    toast.success("Attendance marked", {
      description: `Status updated to ${status}`,
      className: "bg-green-50 border-green-200 text-green-900",
      position: "bottom-center",
    });
  }, []);

  // Filter students based on search and status filter
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const studentStatus = attendanceRecords.get(student.id)?.status || "NOT_MARKED";
      const matchesStatus = statusFilter === "ALL" || studentStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter, attendanceRecords]);

  // Bulk action handlers
  const handleMarkAllPresent = React.useCallback(() => {
    const newRecords = new Map<string, AttendanceRecord>();
    students.forEach(student => {
      newRecords.set(student.id, {
        studentId: student.id,
        status: "PRESENT",
        markedAt: new Date(),
      });
    });
    setAttendanceRecords(newRecords);
    setShowMarkAllDialog(false);
    toast.success("All students marked present", {
      description: `${students.length} students marked as present`,
      className: "bg-green-50 border-green-200 text-green-900",
      position: "bottom-center",
    });
  }, [students]);

  const handleResetAll = React.useCallback(() => {
    setAttendanceRecords(new Map());
    setShowResetDialog(false);
    toast.info("Attendance reset", {
      description: "All attendance records cleared",
      position: "bottom-center",
    });
  }, []);

  // Create display user
  const displayUser = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email || "",
        role: user.role,
      }
    : { name: "User", email: "", role: "OFFICE" as const };

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <ModernDashboardLayout
        user={displayUser}
        title="Mark Attendance"
        subtitle="Loading class details..."
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideSearch={true}
      >
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
      <ModernDashboardLayout
        user={displayUser}
        title="Mark Attendance"
        subtitle="Error loading class"
        currentPath={currentPath}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onSearch={handleSearch}
        hideSearch={true}
      >
        <PageContainer>
          <Card className="rounded-2xl shadow-md border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 w-fit mx-auto rounded-2xl mb-4">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Failed to Load Class
              </h3>
              <p className="text-red-700 mb-6 max-w-md mx-auto">
                {error || "Class not found"}
              </p>
              <Button
                onClick={() => router.push("/dashboard/mark-attendance")}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
              >
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
    <ModernDashboardLayout
      user={displayUser}
      title={`Mark Attendance - ${classData.name}`}
      subtitle={`${classData.major} • Semester ${classData.semester} • ${classData.session}`}
      currentPath={currentPath}
      onNavigate={handleNavigation}
      onLogout={handleLogout}
      onSearch={handleSearch}
      hideSearch={true}
    >
      <PageContainer>
        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/dashboard/mark-attendance")}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>

        {/* Class Info Card */}
        <Card className="rounded-2xl shadow-lg border-orange-200 bg-gradient-to-br from-orange-50 via-orange-100 to-amber-50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {classData.name}
                  </h2>
                  <p className="text-slate-700">
                    {classData.major} • Semester {classData.semester}
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                  classData.session === "MORNING"
                    ? "bg-amber-200 text-amber-800"
                    : "bg-indigo-200 text-indigo-800"
                }`}
              >
                {classData.session === "MORNING" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {classData.session}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Selector */}
        <Card className="rounded-2xl shadow-md border-slate-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousDay}
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">
                      Marking attendance for
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDay}
                  disabled={isToday}
                  className="border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  // Date picker will be implemented in task 7.1
                  toast.info("Date picker coming soon", {
                    description: "Use Previous/Next buttons for now",
                    position: "bottom-center",
                  });
                }}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Change Date
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Students */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-600">Total</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Present */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-600">Present</p>
                  <p className="text-2xl font-bold text-green-700">
                    {presentCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Absent */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-red-600">Absent</p>
                  <p className="text-2xl font-bold text-red-700">
                    {absentCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sick */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-600">Sick</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {sickCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-600 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-cyan-600">Leave</p>
                  <p className="text-2xl font-bold text-cyan-700">
                    {leaveCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Not Marked */}
          <Card className="rounded-xl shadow-md border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-600 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">
                    Not Marked
                  </p>
                  <p className="text-2xl font-bold text-slate-700">
                    {notMarkedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        <Card className="rounded-2xl shadow-md border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-slate-900">
                  Quick Actions
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowMarkAllDialog(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Present
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Bar */}
        <Card className="rounded-2xl shadow-md border-slate-200 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by name or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="w-full md:w-64">
                <CustomSelect
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as "ALL" | AttendanceStatus)}
                  options={[
                    { value: "ALL", label: "All Statuses" },
                    { value: "PRESENT", label: "Present" },
                    { value: "ABSENT", label: "Absent" },
                    { value: "SICK", label: "Sick" },
                    { value: "LEAVE", label: "Leave" },
                    { value: "NOT_MARKED", label: "Not Marked" },
                  ]}
                  placeholder="Filter by status"
                  className="border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Attendance Grid */}
        {studentsLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-xl shadow-md border-slate-200">
                <CardContent className="p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-slate-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-slate-200 rounded-lg" />
                      <div className="h-10 bg-slate-200 rounded-lg" />
                      <div className="h-10 bg-slate-200 rounded-lg" />
                      <div className="h-10 bg-slate-200 rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : studentsError ? (
          // Error state
          <Card className="rounded-2xl shadow-md border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-red-100 to-rose-100 w-fit mx-auto rounded-2xl mb-4">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Failed to Load Students
              </h3>
              <p className="text-red-700 mb-6 max-w-md mx-auto">
                {studentsError}
              </p>
              <Button
                onClick={loadStudents}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          // Empty state - no students
          <Card className="rounded-2xl shadow-md border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-cyan-100 w-fit mx-auto rounded-2xl mb-4">
                <Users className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No Students Enrolled
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Add students to this class to mark attendance
              </p>
              <Button
                onClick={() => router.push("/dashboard/students")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Go to Students
              </Button>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          // Empty state - no search results
          <Card className="rounded-2xl shadow-md border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 w-fit mx-auto rounded-2xl mb-4">
                <Search className="h-16 w-16 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No Students Found
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Try adjusting your search or filter criteria
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Student cards grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((student) => {
              const studentStatus = attendanceRecords.get(student.id)?.status || "NOT_MARKED";
              
              return (
                <StudentAttendanceCard
                  key={student.id}
                  student={student}
                  status={studentStatus}
                  onStatusChange={handleStatusChange}
                />
              );
            })}
          </div>
        )}

        {/* Mark All Present Confirmation Dialog */}
        <Dialog open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark All Students Present?</DialogTitle>
              <DialogDescription>
                This will mark all {totalStudents} students in {classData.name}{" "}
                as present for {format(selectedDate, "MMMM dd, yyyy")}. This
                action will override any existing attendance records.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowMarkAllDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleMarkAllPresent}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset All Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset All Attendance?</DialogTitle>
              <DialogDescription>
                This will clear all attendance records for {classData.name} on{" "}
                {format(selectedDate, "MMMM dd, yyyy")}. All students will be
                marked as &quot;Not Marked&quot;. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetAll}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </ModernDashboardLayout>
  );
}
