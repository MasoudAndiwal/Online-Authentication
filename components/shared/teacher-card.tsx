"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap, Phone, Edit, Trash2, Eye } from "lucide-react";

interface Teacher {
  id: string; // Database UUID
  teacherId?: string; // Custom teacher ID for display
  name: string;
  email: string;
  department: string;
  phone: string;
  qualification: string;
  experience: string;
  status: "Active" | "On Leave" | "Inactive";
  classes: number;
  subjects?: string[];
}

interface TeacherCardProps {
  teacher: Teacher;
  index?: number;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TeacherCard({ teacher, onView, onEdit, onDelete }: TeacherCardProps) {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-all duration-300 border-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {teacher.name}
                </h3>
                <p className="text-sm text-slate-500">
                  ID: {teacher.teacherId || teacher.id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  teacher.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : teacher.status === "Inactive"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {teacher.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
              <div className="bg-slate-50/80 rounded-lg p-2">
                <span className="text-slate-500 text-xs">Department</span>
                <p className="font-medium text-slate-900 truncate">
                  {teacher.department || '-'}
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-lg p-2">
                <span className="text-slate-500 text-xs">Qualification</span>
                <p className="font-medium text-slate-900 truncate">
                  {teacher.qualification || '-'}
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-lg p-2">
                <span className="text-slate-500 text-xs">Experience</span>
                <p className="font-medium text-slate-900">
                  {teacher.experience || '-'}
                </p>
              </div>
              <div className="bg-slate-50/80 rounded-lg p-2">
                <span className="text-slate-500 text-xs">Classes</span>
                <p className="font-medium text-slate-900">
                  {teacher.classes}
                </p>
              </div>
            </div>

            {teacher.subjects && teacher.subjects.length > 0 && (
              <div className="mb-3">
                <span className="text-slate-500 text-xs">Subjects</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {teacher.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-md bg-orange-50 text-orange-700 font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>{teacher.phone}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              onClick={() => onView?.(teacher.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
              onClick={() => onEdit?.(teacher.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              onClick={() => onDelete?.(teacher.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
  );
}

// Skeleton loading component
export function TeacherCardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm border-0 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 bg-slate-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-100 rounded-lg p-2">
                <div className="h-3 w-16 bg-slate-200 rounded mb-1" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>

          <div className="mb-3">
            <div className="h-3 w-14 bg-slate-200 rounded mb-2" />
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-slate-200 rounded-md" />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-200 rounded" />
            <div className="h-4 w-28 bg-slate-200 rounded" />
          </div>
        </div>

        <div className="flex gap-2">
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}