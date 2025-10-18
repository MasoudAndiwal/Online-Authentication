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
  Calendar,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    session: "MORNING" | "AFTERNOON";
    studentCount: number;
    scheduleCount: number;
    major: string;
    semester: number;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ClassCard({ classData, onView, onEdit, onDelete }: ClassCardProps) {
  const SessionIcon = classData.session === "MORNING" ? Sun : Moon;
  const sessionColor = classData.session === "MORNING"
    ? "from-amber-500 to-orange-500"
    : "from-indigo-500 to-blue-500";
  
  const sessionBadgeColor = classData.session === "MORNING"
    ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-200"
    : "bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-indigo-200";

  return (
    <Card className="group rounded-2xl shadow-md border-orange-200 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl shadow-lg bg-gradient-to-br",
              sessionColor
            )}>
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                {classData.name}
              </h3>
              <p className="text-sm text-slate-600">{classData.major}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("font-semibold shadow-sm", sessionBadgeColor)}
          >
            <SessionIcon className="h-3.5 w-3.5 mr-1" />
            {classData.session}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-slate-600">Students</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classData.studentCount}</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-slate-600">Schedules</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{classData.scheduleCount}</p>
          </div>
        </div>

        {/* Semester Badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
            <BookOpen className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <span className="text-sm text-slate-600">
            Semester <span className="font-bold text-slate-900">{classData.semester}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(classData.id)}
            className="flex-1 h-9 border-orange-300 text-orange-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:border-orange-400 shadow-sm transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View
          </Button>
          
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(classData.id)}
              className="h-9 px-3 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm transition-all duration-200"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(classData.id)}
              className="h-9 px-3 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Hover Effect Indicator */}
        <div className="mt-3 h-1 w-0 group-hover:w-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300" />
      </CardContent>
    </Card>
  );
}
