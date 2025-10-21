"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  X,
  AlertCircle,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phone: string;
  fatherPhone?: string;
  address?: string;
  programs: string;
  semester: string;
  enrollmentYear: number;
  classSection: string;
  timeSlot: string;
  status: string;
  dateOfBirth?: string;
  fatherName?: string;
  grandFatherName?: string;
}

interface ViewStudentDialogProps {
  studentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStudentDialog({
  studentId,
  open,
  onOpenChange,
}: ViewStudentDialogProps) {
  const [student, setStudent] = React.useState<Student | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !studentId) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/students/${studentId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch student details");
        }

        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching student:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId, open]);

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    className,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string | null;
    className?: string;
  }) => {
    if (!value) return null;

    return (
      <div className={cn("flex items-start gap-3 p-3 rounded-lg bg-slate-50", className)}>
        <Icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
          <p className="text-sm text-slate-900 font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Student Details
          </DialogTitle>
          <DialogDescription>
            View complete information about the student
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent mb-4"></div>
            <p className="text-slate-600">Loading student details...</p>
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        )}

        {!loading && !error && student && (
          <div className="space-y-6">
            {/* Header with Name and Status */}
            <div className="flex items-start justify-between p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-slate-600 mb-2">Student ID: {student.studentId}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    student.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : student.status === "SICK"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-slate-100 text-slate-800 border-slate-200"
                  )}
                >
                  {student.status === "ACTIVE" ? "Active" : student.status === "SICK" ? "Sick" : "Inactive"}
                </Badge>
              </div>
              <User className="h-12 w-12 text-green-600" />
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={User} label="Father Name" value={student.fatherName} />
                <InfoRow icon={User} label="Grandfather Name" value={student.grandFatherName} />
                {student.dateOfBirth && (
                  <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={new Date(student.dateOfBirth).toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Phone} label="Student Phone" value={student.phone} />
                <InfoRow icon={Phone} label="Father Phone" value={student.fatherPhone} />
                <InfoRow icon={MapPin} label="Address" value={student.address} className="sm:col-span-2" />
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                Academic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={BookOpen} label="Semester" value={student.semester} />
                <InfoRow icon={Calendar} label="Enrollment Year" value={student.enrollmentYear?.toString()} />
                <InfoRow icon={GraduationCap} label="Class Section" value={student.classSection} />
                <InfoRow
                  icon={Clock}
                  label="Time Slot"
                  value={
                    student.timeSlot === "morning"
                      ? "Morning (8:30 AM - 12:30 PM)"
                      : "Afternoon (1:30 PM - 6:30 PM)"
                  }
                />
              </div>
            </div>

            {/* Programs */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                Enrolled Programs
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium mb-2">Programs/Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(student.programs)
                      ? student.programs
                      : student.programs.split(",")
                    ).map((program, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {typeof program === "string" ? program.trim() : program}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
