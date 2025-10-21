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
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  BookOpen,
  Calendar,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  departments: string;
  qualification: string;
  experience: string;
  specialization: string;
  subjects: string;
  classes: string;
  status: string;
  dateOfBirth?: string;
  fatherName?: string;
  grandFatherName?: string;
}

interface ViewTeacherDialogProps {
  teacherId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTeacherDialog({
  teacherId,
  open,
  onOpenChange,
}: ViewTeacherDialogProps) {
  const [teacher, setTeacher] = React.useState<Teacher | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !teacherId) return;

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/teachers/${teacherId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch teacher details");
        }

        const data = await response.json();
        setTeacher(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching teacher:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [teacherId, open]);

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
        <Icon className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
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
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            Teacher Details
          </DialogTitle>
          <DialogDescription>
            View complete information about the teacher
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent mb-4"></div>
            <p className="text-slate-600">Loading teacher details...</p>
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        )}

        {!loading && !error && teacher && (
          <div className="space-y-6">
            {/* Header with Name and Status */}
            <div className="flex items-start justify-between p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-slate-600 mb-2">Teacher ID: {teacher.teacherId}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    teacher.status === "ACTIVE"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  )}
                >
                  {teacher.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <User className="h-12 w-12 text-orange-600" />
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={User} label="Father Name" value={teacher.fatherName} />
                <InfoRow icon={User} label="Grandfather Name" value={teacher.grandFatherName} />
                {teacher.dateOfBirth && (
                  <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={new Date(teacher.dateOfBirth).toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Phone} label="Primary Phone" value={teacher.phone} />
                <InfoRow icon={Phone} label="Secondary Phone" value={teacher.secondaryPhone} />
                <InfoRow icon={Mail} label="Email" value={teacher.email} />
                <InfoRow icon={MapPin} label="Address" value={teacher.address} className="sm:col-span-2" />
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-orange-600" />
                Academic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Briefcase} label="Qualification" value={teacher.qualification} />
                <InfoRow icon={Clock} label="Experience" value={`${teacher.experience} years`} />
                <InfoRow icon={BookOpen} label="Specialization" value={teacher.specialization} className="sm:col-span-2" />
              </div>
            </div>

            {/* Teaching Details */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-600" />
                Teaching Details
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium mb-2">Departments</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(teacher.departments)
                      ? teacher.departments
                      : teacher.departments.split(",")
                    ).map((dept, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-orange-100 text-orange-800 border-orange-200"
                      >
                        {typeof dept === "string" ? dept.trim() : dept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(teacher.subjects)
                      ? teacher.subjects
                      : teacher.subjects.split(",")
                    ).map((subject, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200"
                      >
                        {typeof subject === "string" ? subject.trim() : subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500 font-medium mb-2">Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(teacher.classes)
                      ? teacher.classes
                      : teacher.classes.split(",")
                    ).map((classItem, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-200"
                      >
                        {typeof classItem === "string" ? classItem.trim() : classItem}
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
