"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Users, 
  BookOpen,
  Edit,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    session: "MORNING" | "AFTERNOON";
    studentCount: number;
    teacherCount: number;
    scheduleCount: number;
    major: string;
    semester: number;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ClassCard({ classData, onEdit, onDelete }: ClassCardProps) {
  const SessionIcon = classData.session === "MORNING" ? Sun : Moon;
  
  const iconBgColor = classData.session === "MORNING" 
    ? "bg-orange-500" 
    : "bg-indigo-500";
  
  const sessionBadgeStyle = classData.session === "MORNING"
    ? "bg-orange-50 text-orange-700 border-orange-200"
    : "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-lg transition-all duration-200">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              iconBgColor
            )}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {classData.name}
              </h3>
              <p className="text-sm text-slate-600">{classData.major}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("font-medium text-xs px-2.5 py-1", sessionBadgeStyle)}
          >
            <SessionIcon className="h-3 w-3 mr-1" />
            {classData.session}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-slate-600">Students</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classData.studentCount}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Teachers</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classData.teacherCount}</p>
          </div>
        </div>

        {/* Semester */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <BookOpen className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-sm text-slate-600">
            Semester <span className="font-bold text-slate-900">{classData.semester}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(classData.id)}
              className="flex-1 h-9 border-0 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium shadow-sm"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(classData.id)}
              className="flex-1 h-9 border-0 bg-red-50 text-red-700 hover:bg-red-100 font-medium shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
