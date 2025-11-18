"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/types/types";

interface AttendanceHistoryTimelineProps {
  records: AttendanceRecord[];
  className?: string;
}

/**
 * Attendance History Timeline Component
 * Displays chronological list of all attendance records with vertical timeline
 * Features color-coded status badges, date markers, and session details
 * Requirements: 8.1, 8.2
 */
export function AttendanceHistoryTimeline({
  records,
  className,
}: AttendanceHistoryTimelineProps) {
  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          badge: "bg-green-100 text-green-700 border-green-300",
          icon: "✓",
          label: "Present",
          dotColor: "bg-green-500",
        };
      case "absent":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700 border-red-300",
          icon: "✗",
          label: "Absent",
          dotColor: "bg-red-500",
        };
      case "sick":
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          badge: "bg-yellow-100 text-yellow-700 border-yellow-300",
          icon: "🤒",
          label: "Sick",
          dotColor: "bg-yellow-500",
        };
      case "leave":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          badge: "bg-blue-100 text-blue-700 border-blue-300",
          icon: "📅",
          label: "Leave",
          dotColor: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-slate-50",
          text: "text-slate-700",
          border: "border-slate-200",
          badge: "bg-slate-100 text-slate-700 border-slate-300",
          icon: "-",
          label: "Unknown",
          dotColor: "bg-slate-500",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Group records by date
  const groupedRecords = records.reduce((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const sortedDates = Object.keys(groupedRecords).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (records.length === 0) {
    return (
      <Card className={cn("rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0", className)}>
        <CardContent className="p-8 sm:p-12 text-center">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">
            No Attendance Records
          </h3>
          <p className="text-sm sm:text-base text-slate-500">
            Your attendance history will appear here once records are available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {sortedDates.map((dateKey, dateIndex) => {
        const dayRecords = groupedRecords[dateKey];
        const isLastDate = dateIndex === sortedDates.length - 1;

        return (
          <div key={dateKey} className="relative">
            {/* Date Marker */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  {formatDate(dateKey)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {dayRecords.length} session{dayRecords.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Timeline Records */}
            <div className="ml-5 sm:ml-6 border-l-2 border-slate-200 pl-6 sm:pl-8 space-y-4 sm:space-y-6">
              {dayRecords.map((record, recordIndex) => {
                const statusConfig = getStatusConfig(record.status);
                const isLastRecord = isLastDate && recordIndex === dayRecords.length - 1;

                return (
                  <div key={record.id} className="relative">
                    {/* Timeline Dot */}
                    <div
                      className={cn(
                        "absolute -left-[33px] sm:-left-[37px] top-3 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-md",
                        statusConfig.dotColor
                      )}
                    />

                    {/* Record Card */}
                    <Card
                      className={cn(
                        "rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                        statusConfig.bg,
                        statusConfig.border,
                        "cursor-default"
                      )}
                    >
                      <CardContent className="p-4 sm:p-5">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl sm:text-3xl">{statusConfig.icon}</span>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-800">
                                {record.courseName}
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-600">
                                Period {record.period} • {record.dayOfWeek}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-semibold border-2 self-start",
                              statusConfig.badge
                            )}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-slate-200">
                          {/* Marked By */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate">
                              <span className="font-medium">Marked by:</span>{" "}
                              {record.notes?.split("Marked by: ")[1]?.split(" at ")[0] || "System"}
                            </span>
                          </div>

                          {/* Marked At */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate">
                              <span className="font-medium">Time:</span>{" "}
                              {record.notes?.includes("at ") 
                                ? record.notes.split(" at ")[1] 
                                : formatTime(record.date)}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {record.notes && !record.notes.includes("Marked by:") && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                              <FileText className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-medium">Notes:</span>
                                <p className="mt-1 text-slate-700">{record.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Connector Line (hidden for last record) */}
                    {!isLastRecord && (
                      <div className="absolute -left-[29px] sm:-left-[33px] top-8 w-0.5 h-full bg-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
