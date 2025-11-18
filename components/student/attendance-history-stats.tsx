"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Thermometer, Plane, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord, AttendanceStatus } from "@/types/types";

interface AttendanceHistoryStatsProps {
  records: AttendanceRecord[];
  dateRange?: { start: Date | undefined; end: Date | undefined };
  className?: string;
}

/**
 * Attendance History Statistics Component
 * Displays total records count, breakdown by status type, date range, and visual mini-charts
 * Requirements: 8.5
 */
export function AttendanceHistoryStats({
  records,
  dateRange,
  className,
}: AttendanceHistoryStatsProps) {
  // Calculate statistics
  const totalRecords = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const sickCount = records.filter((r) => r.status === "sick").length;
  const leaveCount = records.filter((r) => r.status === "leave").length;

  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRangeText = () => {
    if (dateRange?.start && dateRange?.end) {
      return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    } else if (dateRange?.start) {
      return `From ${formatDate(dateRange.start)}`;
    } else if (dateRange?.end) {
      return `Until ${formatDate(dateRange.end)}`;
    }
    return "All time";
  };

  const statusBreakdown = [
    {
      label: "Present",
      count: presentCount,
      percentage: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
      color: "text-green-700",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      icon: CheckCircle,
    },
    {
      label: "Absent",
      count: absentCount,
      percentage: totalRecords > 0 ? (absentCount / totalRecords) * 100 : 0,
      color: "text-red-700",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      icon: XCircle,
    },
    {
      label: "Sick",
      count: sickCount,
      percentage: totalRecords > 0 ? (sickCount / totalRecords) * 100 : 0,
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      icon: Thermometer,
    },
    {
      label: "Leave",
      count: leaveCount,
      percentage: totalRecords > 0 ? (leaveCount / totalRecords) * 100 : 0,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      icon: Plane,
    },
  ];

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Records */}
        <Card className="rounded-xl shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-700 uppercase tracking-wide">
                  Total Records
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
                  {totalRecords}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="rounded-xl shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-0">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-emerald-700 uppercase tracking-wide">
                  Attendance Rate
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
                  {attendanceRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Range */}
        <Card className="rounded-xl shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50 border-0 sm:col-span-2">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 uppercase tracking-wide">
                  Date Range
                </p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">
                  {getDateRangeText()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 sm:mb-6">
            Status Breakdown
          </h3>

          <div className="space-y-4">
            {statusBreakdown.map((status) => {
              const Icon = status.icon;
              return (
                <div key={status.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", status.color)} />
                      <span className="text-sm sm:text-base font-medium text-slate-700">
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold border-2",
                          status.bgColor,
                          status.color,
                          status.borderColor
                        )}
                      >
                        {status.count}
                      </Badge>
                      <span className="text-sm font-medium text-slate-600 min-w-[50px] text-right">
                        {status.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                        status.bgColor.replace("100", "500")
                      )}
                      style={{ width: `${status.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini Chart Visualization */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Visual Distribution</h4>
            <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
              {statusBreakdown.map((status, index) => {
                if (status.count === 0) return null;
                return (
                  <div
                    key={status.label}
                    className={cn(
                      "relative group cursor-default transition-all duration-300 hover:opacity-80",
                      status.bgColor.replace("100", "500")
                    )}
                    style={{ width: `${status.percentage}%` }}
                    title={`${status.label}: ${status.count} (${status.percentage.toFixed(1)}%)`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {status.label}: {status.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
