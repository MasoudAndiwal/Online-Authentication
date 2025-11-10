"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Info,
  Calendar,
  Target,
} from "lucide-react";

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RiskType = "محروم" | "تصدیق_طلب" | "approaching_limit" | "good_standing";

interface StudentRiskData {
  studentId: string;
  studentName: string;
  totalAbsences: number;
  allowedAbsences: number;
  remainingAbsences: number;
  attendanceRate: number;
  riskLevel: RiskLevel;
  riskType: RiskType;
  daysUntilDeadline?: number;
  lastAbsenceDate?: Date;
  consecutiveAbsences?: number;
}

interface StudentRiskIndicatorProps {
  riskData: StudentRiskData;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface RiskIndicatorsGridProps {
  students: StudentRiskData[];
  onStudentClick?: (studentId: string) => void;
  className?: string;
}

// Risk configuration with colors and animations
const riskConfig = {
  محروم: {
    label: "محروم",
    description: "Student is disqualified due to excessive absences",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    pulseColor: "animate-pulse",
    priority: 4,
  },
  تصدیق_طلب: {
    label: "تصدیق طلب",
    description: "Student requires certification due to high absences",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    iconColor: "text-orange-600",
    pulseColor: "animate-pulse",
    priority: 3,
  },
  approaching_limit: {
    label: "At Risk",
    description: "Student is approaching absence limit",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    pulseColor: "",
    priority: 2,
  },
  good_standing: {
    label: "Good Standing",
    description: "Student has good attendance record",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    iconColor: "text-green-600",
    pulseColor: "",
    priority: 1,
  },
};

const riskLevelConfig = {
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    intensity: "High Priority",
  },
  high: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    intensity: "Needs Attention",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    intensity: "Monitor Closely",
  },
  low: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    intensity: "Good Standing",
  },
};

export function StudentRiskIndicator({
  riskData,
  showDetails = false,
  size = "md",
  className,
}: StudentRiskIndicatorProps) {
  const config = riskConfig[riskData.riskType];
  const levelConfig = riskLevelConfig[riskData.riskLevel];

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Calculate urgency based on remaining absences and risk level
  const getUrgencyMessage = () => {
    if (riskData.riskType === "محروم") {
      return "Immediate action required";
    }
    if (riskData.riskType === "تصدیق_طلب") {
      return "Certification needed";
    }
    if (riskData.remainingAbsences <= 2) {
      return `Only ${riskData.remainingAbsences} absence${riskData.remainingAbsences !== 1 ? 's' : ''} remaining`;
    }
    if (riskData.remainingAbsences <= 5) {
      return `${riskData.remainingAbsences} absences remaining`;
    }
    return "Good attendance record";
  };

  const indicator = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center rounded-lg font-medium border transition-all duration-200",
        config.bgColor,
        config.textColor,
        config.borderColor,
        config.pulseColor,
        sizeClasses[size],
        "hover:shadow-md cursor-pointer",
        className
      )}
    >
      <AlertTriangle className={cn(iconSizes[size], "mr-1.5", config.iconColor)} />
      <span>{config.label}</span>
      
      {showDetails && (
        <div className="ml-2 flex items-center gap-1">
          <span className="text-xs opacity-75">
            ({riskData.remainingAbsences} left)
          </span>
        </div>
      )}
    </motion.div>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="max-w-xs bg-white border border-slate-200 shadow-xl text-slate-900"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-slate-900">{riskData.studentName}</span>
              </div>
              <div className="text-sm space-y-1 text-slate-700">
                <p><strong className="text-slate-900">Status:</strong> {config.description}</p>
                <p><strong className="text-slate-900">Attendance Rate:</strong> {riskData.attendanceRate.toFixed(1)}%</p>
                <p><strong className="text-slate-900">Absences:</strong> {riskData.totalAbsences}/{riskData.allowedAbsences}</p>
                <p><strong className="text-slate-900">Remaining:</strong> {riskData.remainingAbsences}</p>
                <p className={cn("font-medium", levelConfig.color)}>
                  {getUrgencyMessage()}
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
}

export function RiskIndicatorsGrid({
  students,
  onStudentClick,
  className,
}: RiskIndicatorsGridProps) {
  // Sort students by risk priority (highest first)
  const sortedStudents = React.useMemo(() => {
    return [...students].sort((a, b) => {
      const aPriority = riskConfig[a.riskType].priority;
      const bPriority = riskConfig[b.riskType].priority;
      return bPriority - aPriority;
    });
  }, [students]);

  // Filter out students with good standing for the main grid
  const atRiskStudents = sortedStudents.filter(
    student => student.riskType !== "good_standing"
  );

  if (atRiskStudents.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-2xl inline-block">
            <Target className="h-8 w-8 text-green-600 mx-auto" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">All Students in Good Standing</h3>
            <p className="text-slate-600 mt-1">
              No students currently at risk of محروم or تصدیق طلب status
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-red-50 rounded-2xl p-4 border border-red-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {students.filter(s => s.riskType === "محروم").length}
              </p>
              <p className="text-sm text-red-600">محروم Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-orange-50 rounded-2xl p-4 border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {students.filter(s => s.riskType === "تصدیق_طلب").length}
              </p>
              <p className="text-sm text-orange-600">تصدیق طلب Students</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {students.filter(s => s.riskType === "approaching_limit").length}
              </p>
              <p className="text-sm text-yellow-600">At Risk Students</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Risk List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-orange-500/10 border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-100/50">
          <h3 className="text-lg font-semibold text-slate-900">Students Requiring Attention</h3>
          <p className="text-sm text-slate-600 mt-1">
            {atRiskStudents.length} student{atRiskStudents.length !== 1 ? 's' : ''} need monitoring
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {atRiskStudents.map((student, index) => {
              const config = riskConfig[student.riskType];
              const levelConfig = riskLevelConfig[student.riskLevel];

              return (
                <motion.div
                  key={student.studentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    config.bgColor,
                    config.borderColor,
                    "hover:shadow-md cursor-pointer",
                    config.pulseColor
                  )}
                  onClick={() => onStudentClick?.(student.studentId)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg", levelConfig.bgColor)}>
                      <AlertTriangle className={cn("h-5 w-5", config.iconColor)} />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900">{student.studentName}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                        <span>Attendance: {student.attendanceRate.toFixed(1)}%</span>
                        <span>Absences: {student.totalAbsences}/{student.allowedAbsences}</span>
                        <span className={cn("font-medium", levelConfig.color)}>
                          {student.remainingAbsences} remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StudentRiskIndicator
                      riskData={student}
                      showDetails={false}
                      size="md"
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-white/60 rounded-lg"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility function to calculate risk data for a student
export function calculateStudentRisk(
  studentId: string,
  studentName: string,
  attendanceRecords: Array<{ status: string; date: string }>,
  totalClassDays: number,
  allowedAbsencePercentage: number = 25 // 25% allowed absences
): StudentRiskData {
  const totalAbsences = attendanceRecords.filter(
    record => record.status === "ABSENT"
  ).length;
  
  const allowedAbsences = Math.floor(totalClassDays * (allowedAbsencePercentage / 100));
  const remainingAbsences = Math.max(0, allowedAbsences - totalAbsences);
  const attendanceRate = totalClassDays > 0 
    ? ((totalClassDays - totalAbsences) / totalClassDays) * 100 
    : 100;

  // Determine risk type and level
  let riskType: RiskType;
  let riskLevel: RiskLevel;

  if (totalAbsences > allowedAbsences) {
    riskType = "محروم";
    riskLevel = "critical";
  } else if (totalAbsences > allowedAbsences * 0.8) {
    riskType = "تصدیق_طلب";
    riskLevel = "high";
  } else if (remainingAbsences <= 3) {
    riskType = "approaching_limit";
    riskLevel = "medium";
  } else {
    riskType = "good_standing";
    riskLevel = "low";
  }

  // Calculate consecutive absences
  const recentRecords = attendanceRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  let consecutiveAbsences = 0;
  for (const record of recentRecords) {
    if (record.status === "ABSENT") {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  return {
    studentId,
    studentName,
    totalAbsences,
    allowedAbsences,
    remainingAbsences,
    attendanceRate,
    riskLevel,
    riskType,
    consecutiveAbsences,
    lastAbsenceDate: attendanceRecords
      .filter(r => r.status === "ABSENT")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      ? new Date(attendanceRecords
          .filter(r => r.status === "ABSENT")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
      : undefined,
  };
}