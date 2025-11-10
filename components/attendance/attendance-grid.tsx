"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Search,
  Users,
  CheckCircle,
  XCircle,
  Heart,
  FileText,
  AlertTriangle,
  Clock,
  Filter,
  MoreHorizontal,
  TrendingDown,
  Shield,
  Target,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { StudentRiskIndicator, calculateStudentRisk } from "./student-risk-indicators";
import type { AttendanceStatus, Student, StudentWithAttendance } from "@/types/attendance";

interface AttendanceGridProps {
  classId: string;
  className?: string;
  students: StudentWithAttendance[];
  isLoading?: boolean;
  error?: string | null;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onBulkStatusChange?: (studentIds: string[], status: AttendanceStatus) => void;
  selectedStudents?: string[];
  onStudentSelect?: (studentId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showRiskIndicators?: boolean;
}

// Status button configuration with orange theme
const statusButtonConfig = {
  PRESENT: {
    label: "Present",
    icon: CheckCircle,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    hoverColor: "hover:bg-green-100",
    borderColor: "border-green-200",
  },
  ABSENT: {
    label: "Absent",
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    hoverColor: "hover:bg-red-100",
    borderColor: "border-red-200",
  },
  SICK: {
    label: "Sick",
    icon: Heart,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    hoverColor: "hover:bg-yellow-100",
    borderColor: "border-yellow-200",
  },
  LEAVE: {
    label: "Leave",
    icon: FileText,
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    hoverColor: "hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
  NOT_MARKED: {
    label: "Not Marked",
    icon: Clock,
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    hoverColor: "hover:bg-slate-100",
    borderColor: "border-slate-200",
  },
};

// Enhanced risk indicator configuration with proper thresholds
const ATTENDANCE_THRESHOLDS = {
  TOTAL_CLASS_DAYS: 30, // Typical semester class days
  ALLOWED_ABSENCE_PERCENTAGE: 25, // 25% allowed absences
  WARNING_THRESHOLD: 0.8, // Warn when 80% of allowed absences are used
  CRITICAL_THRESHOLD: 0.9, // Critical when 90% of allowed absences are used
};

// Mock attendance history for demonstration (in real app, this would come from API)
const generateMockAttendanceHistory = (studentId: string, currentStatus: AttendanceStatus) => {
  const history = [];
  const totalDays = ATTENDANCE_THRESHOLDS.TOTAL_CLASS_DAYS;
  
  // Generate realistic attendance pattern
  for (let i = 0; i < totalDays - 1; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (totalDays - i));
    
    // Simulate attendance pattern based on current status
    let status = 'PRESENT';
    if (currentStatus === 'ABSENT') {
      // Students currently absent are more likely to have previous absences
      status = Math.random() < 0.3 ? 'ABSENT' : 'PRESENT';
    } else {
      // Good students have fewer absences
      status = Math.random() < 0.1 ? 'ABSENT' : 'PRESENT';
    }
    
    history.push({
      status,
      date: date.toISOString(),
    });
  }
  
  // Add today's status
  history.push({
    status: currentStatus,
    date: new Date().toISOString(),
  });
  
  return history;
};

export function AttendanceGrid({
  classId,
  className,
  students = [],
  isLoading = false,
  error = null,
  onStatusChange,
  onBulkStatusChange,
  selectedStudents = [],
  onStudentSelect,
  onSelectAll,
  searchQuery = "",
  onSearchChange,
  showRiskIndicators = true,
}: AttendanceGridProps) {
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const [statusFilter, setStatusFilter] = React.useState<AttendanceStatus | "ALL">("ALL");
  const [riskFilter, setRiskFilter] = React.useState<"ALL" | "AT_RISK" | "GOOD_STANDING">("ALL");

  // Filter students based on search query, status, and risk level
  const filteredStudents = React.useMemo(() => {
    let filtered = students;
    
    // Apply search filter
    if (localSearchQuery.trim()) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          student.classSection.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(student => student.status === statusFilter);
    }
    
    return filtered;
  }, [students, localSearchQuery, statusFilter]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange?.(value);
  };

  // Handle status button click
  const handleStatusClick = (studentId: string, newStatus: AttendanceStatus) => {
    onStatusChange(studentId, newStatus);
    
    // Show feedback toast
    const student = students.find(s => s.id === studentId);
    const statusConfig = statusButtonConfig[newStatus];
    
    if (student && statusConfig) {
      toast.success(`${student.name} marked as ${statusConfig.label}`, {
        duration: 2000,
      });
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
  const allSelected = filteredStudents.length > 0 && 
    filteredStudents.every(student => selectedStudents.includes(student.id));

  // Check if some students are selected
  const someSelected = selectedStudents.length > 0 && !allSelected;

  // Get student initials for avatar fallback
  const getStudentInitials = (student: StudentWithAttendance) => {
    const names = student.name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
  };

  // Calculate comprehensive risk data for each student
  const getStudentRiskData = React.useCallback((student: StudentWithAttendance) => {
    // Generate mock attendance history (in real app, this would come from API)
    const attendanceHistory = generateMockAttendanceHistory(student.id, student.status);
    
    // Calculate risk using the utility function
    return calculateStudentRisk(
      student.id,
      student.name,
      attendanceHistory,
      ATTENDANCE_THRESHOLDS.TOTAL_CLASS_DAYS,
      ATTENDANCE_THRESHOLDS.ALLOWED_ABSENCE_PERCENTAGE
    );
  }, []);

  // Memoize risk calculations for performance
  const studentsWithRisk = React.useMemo(() => {
    let studentsWithRiskData = filteredStudents.map(student => ({
      ...student,
      riskData: getStudentRiskData(student),
    }));
    
    // Apply risk filter
    if (riskFilter === "AT_RISK") {
      studentsWithRiskData = studentsWithRiskData.filter(student => 
        student.riskData.riskType !== 'good_standing'
      );
    } else if (riskFilter === "GOOD_STANDING") {
      studentsWithRiskData = studentsWithRiskData.filter(student => 
        student.riskData.riskType === 'good_standing'
      );
    }
    
    return studentsWithRiskData;
  }, [filteredStudents, getStudentRiskData, riskFilter]);

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
      {/* Risk Summary Cards */}
      {showRiskIndicators && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50 rounded-xl p-4 border border-red-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {studentsWithRisk.filter(s => s.riskData.riskType === 'محروم').length}
                </p>
                <p className="text-sm text-red-600">محروم Students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-50 rounded-xl p-4 border border-orange-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700">
                  {studentsWithRisk.filter(s => s.riskData.riskType === 'تصدیق_طلب').length}
                </p>
                <p className="text-sm text-orange-600">تصدیق طلب Students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">
                  {studentsWithRisk.filter(s => s.riskData.riskType === 'approaching_limit').length}
                </p>
                <p className="text-sm text-yellow-600">At Risk Students</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-50 rounded-xl p-4 border border-green-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {studentsWithRisk.filter(s => s.riskData.riskType === 'good_standing').length}
                </p>
                <p className="text-sm text-green-600">Good Standing</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Search and Filter Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search students by name or ID..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-xl"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "bg-white/60 backdrop-blur-sm border-0 shadow-sm rounded-xl hover:bg-white/80 relative",
                  (statusFilter !== "ALL" || riskFilter !== "ALL") && "bg-orange-50 text-orange-700 hover:bg-orange-100"
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {(statusFilter !== "ALL" || riskFilter !== "ALL") && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full" />
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-0 shadow-xl rounded-xl">
              {(statusFilter !== "ALL" || riskFilter !== "ALL") && (
                <>
                  <DropdownMenuItem 
                    onClick={() => {
                      setStatusFilter("ALL");
                      setRiskFilter("ALL");
                    }}
                    className="cursor-pointer rounded-lg mx-1 my-0.5 text-orange-600 hover:bg-orange-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                </>
              )}
              <DropdownMenuLabel className="text-slate-900 font-semibold">Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "ALL" && "bg-orange-50 text-orange-700"
                )}
              >
                <Users className="h-4 w-4 mr-2" />
                All Students
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("PRESENT")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "PRESENT" && "bg-green-50 text-green-700"
                )}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Present
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("ABSENT")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "ABSENT" && "bg-red-50 text-red-700"
                )}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Absent
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("SICK")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "SICK" && "bg-yellow-50 text-yellow-700"
                )}
              >
                <Heart className="h-4 w-4 mr-2" />
                Sick
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("LEAVE")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "LEAVE" && "bg-orange-50 text-orange-700"
                )}
              >
                <FileText className="h-4 w-4 mr-2" />
                Leave
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setStatusFilter("NOT_MARKED")}
                className={cn(
                  "cursor-pointer rounded-lg mx-1 my-0.5",
                  statusFilter === "NOT_MARKED" && "bg-slate-50 text-slate-700"
                )}
              >
                <Clock className="h-4 w-4 mr-2" />
                Not Marked
              </DropdownMenuItem>
              
              {showRiskIndicators && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuLabel className="text-slate-900 font-semibold">Filter by Risk</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => setRiskFilter("ALL")}
                    className={cn(
                      "cursor-pointer rounded-lg mx-1 my-0.5",
                      riskFilter === "ALL" && "bg-orange-50 text-orange-700"
                    )}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    All Risk Levels
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setRiskFilter("AT_RISK")}
                    className={cn(
                      "cursor-pointer rounded-lg mx-1 my-0.5",
                      riskFilter === "AT_RISK" && "bg-red-50 text-red-700"
                    )}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    At Risk Students
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setRiskFilter("GOOD_STANDING")}
                    className={cn(
                      "cursor-pointer rounded-lg mx-1 my-0.5",
                      riskFilter === "GOOD_STANDING" && "bg-green-50 text-green-700"
                    )}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Good Standing
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4" />
          <span>
            {studentsWithRisk.length} 
            {studentsWithRisk.length !== students.length && ` of ${students.length}`} students
            {(statusFilter !== "ALL" || riskFilter !== "ALL") && (
              <span className="text-orange-600 font-medium"> (filtered)</span>
            )}
          </span>
          {showRiskIndicators && studentsWithRisk.filter(s => s.riskData.riskType !== 'good_standing').length > 0 && (
            <>
              <span>•</span>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600 font-medium">
                {studentsWithRisk.filter(s => s.riskData.riskType !== 'good_standing').length} at risk
              </span>
            </>
          )}
        </div>
      </div>

      {/* Attendance Grid Container with Glass Morphism */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-orange-500/10 border-0 overflow-hidden">
        {/* Header with Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-100/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Student Attendance</h3>
            {selectedStudents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {selectedStudents.length} selected
                </Badge>
              </motion.div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
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
                <TableHead className="font-semibold text-slate-700">Student</TableHead>
                <TableHead className="font-semibold text-slate-700">ID</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                {showRiskIndicators && (
                  <TableHead className="font-semibold text-slate-700">Risk</TableHead>
                )}
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="border-0">
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
                      <TableCell>
                        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {Array.from({ length: 4 }).map((_, btnIndex) => (
                            <div
                              key={btnIndex}
                              className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse"
                            />
                          ))}
                        </div>
                      </TableCell>
                      {showRiskIndicators && (
                        <TableCell>
                          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <TableRow className="border-0">
                    <TableCell colSpan={showRiskIndicators ? 6 : 5} className="text-center py-12">
                      <div className="space-y-4">
                        <Users className="h-12 w-12 text-slate-400 mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">No students found</h3>
                          <p className="text-slate-600 mt-1">
                            {localSearchQuery 
                              ? "Try adjusting your search criteria"
                              : "No students are enrolled in this class"
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  studentsWithRisk.map((student, index) => {
                    const isSelected = selectedStudents.includes(student.id);
                    const { riskData } = student;
                    const isAtRisk = riskData.riskType !== 'good_standing';
                    
                    return (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border-0 transition-colors duration-200",
                          "hover:bg-orange-50/30",
                          isSelected && "bg-orange-50/50",
                          // Highlight at-risk students with subtle background
                          isAtRisk && "bg-gradient-to-r from-red-50/20 to-orange-50/20"
                        )}
                      >
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleStudentSelect(student.id, checked as boolean)
                            }
                            className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={undefined} alt={student.name} />
                                <AvatarFallback className={cn(
                                  "font-semibold",
                                  isAtRisk 
                                    ? "bg-red-100 text-red-700" 
                                    : "bg-orange-100 text-orange-700"
                                )}>
                                  {getStudentInitials(student)}
                                </AvatarFallback>
                              </Avatar>
                              {/* Risk indicator ring around avatar */}
                              {isAtRisk && (
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className={cn(
                                    "absolute -inset-0.5 rounded-full border-2",
                                    riskData.riskType === 'محروم' && "border-red-500 animate-pulse",
                                    riskData.riskType === 'تصدیق_طلب' && "border-orange-500 animate-pulse",
                                    riskData.riskType === 'approaching_limit' && "border-yellow-500"
                                  )}
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{student.name}</p>
                                {/* Quick risk indicator next to name */}
                                {isAtRisk && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center"
                                  >
                                    <AlertTriangle className={cn(
                                      "h-4 w-4",
                                      riskData.riskType === 'محروم' && "text-red-600",
                                      riskData.riskType === 'تصدیق_طلب' && "text-orange-600",
                                      riskData.riskType === 'approaching_limit' && "text-yellow-600"
                                    )} />
                                  </motion.div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span>{student.programs}</span>
                                {/* Show attendance rate for at-risk students */}
                                {isAtRisk && (
                                  <>
                                    <span>•</span>
                                    <span className={cn(
                                      "font-medium",
                                      riskData.attendanceRate < 70 ? "text-red-600" : "text-orange-600"
                                    )}>
                                      {riskData.attendanceRate.toFixed(1)}% attendance
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="font-mono text-sm text-slate-700">
                            {student.studentId}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex gap-1">
                            {(Object.keys(statusButtonConfig) as AttendanceStatus[]).map((status) => {
                              const config = statusButtonConfig[status];
                              const Icon = config.icon;
                              const isActive = student.status === status;
                              
                              return (
                                <motion.div
                                  key={status}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusClick(student.id, status)}
                                    className={cn(
                                      "h-8 px-3 text-xs font-medium rounded-lg transition-all duration-200 border-0 shadow-sm",
                                      isActive
                                        ? `${config.bgColor} ${config.textColor} shadow-md`
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                    )}
                                  >
                                    <Icon className="h-3 w-3 mr-1" />
                                    {status === 'NOT_MARKED' ? 'Not Set' : config.label}
                                  </Button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </TableCell>
                        
                        {showRiskIndicators && (
                          <TableCell>
                            <div className="space-y-1">
                              {/* Main risk indicator */}
                              <StudentRiskIndicator
                                riskData={riskData}
                                showDetails={false}
                                size="sm"
                              />
                              
                              {/* Additional warning for critical cases */}
                              {(riskData.riskType === 'محروم' || riskData.riskType === 'تصدیق_طلب') && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <TrendingDown className="h-3 w-3 text-red-500" />
                                  <span className="text-red-600 font-medium">
                                    {riskData.remainingAbsences === 0 
                                      ? "No absences left" 
                                      : `${riskData.remainingAbsences} left`
                                    }
                                  </span>
                                </motion.div>
                              )}
                              
                              {/* Warning for approaching limit */}
                              {riskData.riskType === 'approaching_limit' && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Shield className="h-3 w-3 text-yellow-500" />
                                  <span className="text-yellow-600 font-medium">
                                    {riskData.remainingAbsences} absences left
                                  </span>
                                </motion.div>
                              )}
                              
                              {/* Good standing indicator */}
                              {riskData.riskType === 'good_standing' && riskData.attendanceRate >= 95 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center gap-1 text-xs"
                                >
                                  <Target className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600 font-medium">
                                    Excellent
                                  </span>
                                </motion.div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-orange-50 rounded-lg"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
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