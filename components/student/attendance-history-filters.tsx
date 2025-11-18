"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AttendanceStatus } from "@/types/types";

export interface HistoryFilters {
  dateRange: { start: Date | undefined; end: Date | undefined };
  statusTypes: AttendanceStatus[];
  month?: number;
}

interface AttendanceHistoryFiltersProps {
  filters: HistoryFilters;
  onFilterChange: (filters: HistoryFilters) => void;
  className?: string;
}

/**
 * Attendance History Filters Component
 * Provides date range picker, status type multi-select, and month selector
 * Features active filter chips and reset functionality
 * Requirements: 8.3
 */
export function AttendanceHistoryFilters({
  filters,
  onFilterChange,
  className,
}: AttendanceHistoryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: { value: AttendanceStatus; label: string; icon: string }[] = [
    { value: "present", label: "Present", icon: "✓" },
    { value: "absent", label: "Absent", icon: "✗" },
    { value: "sick", label: "Sick", icon: "🤒" },
    { value: "leave", label: "Leave", icon: "📅" },
  ];

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleStatusToggle = (status: AttendanceStatus) => {
    const newStatusTypes = filters.statusTypes.includes(status)
      ? filters.statusTypes.filter((s) => s !== status)
      : [...filters.statusTypes, status];

    onFilterChange({
      ...filters,
      statusTypes: newStatusTypes,
    });
  };

  const handleDateRangeChange = (range: { start: Date | undefined; end: Date | undefined }) => {
    onFilterChange({
      ...filters,
      dateRange: range,
      month: undefined, // Clear month when custom date range is set
    });
  };

  const handleMonthChange = (month: string) => {
    const monthNum = parseInt(month);
    const year = new Date().getFullYear();
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0);

    onFilterChange({
      ...filters,
      month: monthNum,
      dateRange: { start, end },
    });
  };

  const handleReset = () => {
    onFilterChange({
      dateRange: { start: undefined, end: undefined },
      statusTypes: [],
      month: undefined,
    });
  };

  const removeStatusFilter = (status: AttendanceStatus) => {
    onFilterChange({
      ...filters,
      statusTypes: filters.statusTypes.filter((s) => s !== status),
    });
  };

  const removeDateRangeFilter = () => {
    onFilterChange({
      ...filters,
      dateRange: { start: undefined, end: undefined },
      month: undefined,
    });
  };

  const hasActiveFilters =
    filters.statusTypes.length > 0 ||
    filters.dateRange.start !== undefined ||
    filters.dateRange.end !== undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Panel */}
      <Card className="rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border-0">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Filters</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 min-h-[44px] touch-manipulation"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Date Range</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal min-h-[44px] touch-manipulation",
                      !filters.dateRange.start && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.start ? (
                      filters.dateRange.end ? (
                        <>
                          {format(filters.dateRange.start, "MMM dd, yyyy")} -{" "}
                          {format(filters.dateRange.end, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(filters.dateRange.start, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.dateRange.start,
                      to: filters.dateRange.end,
                    }}
                    onSelect={(range) => {
                      if (range) {
                        handleDateRangeChange({
                          start: range.from,
                          end: range.to,
                        });
                      }
                    }}
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Month Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Quick Select Month</Label>
              <Select
                value={filters.month?.toString() || ""}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-full min-h-[44px] touch-manipulation">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Type Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Status Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Checkbox
                      id={option.value}
                      checked={filters.statusTypes.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                      className="touch-manipulation"
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-medium cursor-pointer flex items-center gap-1.5 flex-1"
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Active Filters:</span>

          {/* Date Range Chip */}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-300 pl-3 pr-2 py-1.5 gap-2 min-h-[32px] touch-manipulation"
            >
              <CalendarIcon className="h-3 w-3" />
              <span className="text-xs sm:text-sm">
                {filters.dateRange.start && format(filters.dateRange.start, "MMM dd")}
                {filters.dateRange.start && filters.dateRange.end && " - "}
                {filters.dateRange.end && format(filters.dateRange.end, "MMM dd")}
              </span>
              <button
                onClick={removeDateRangeFilter}
                className="ml-1 hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                aria-label="Remove date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Status Type Chips */}
          {filters.statusTypes.map((status) => {
            const option = statusOptions.find((opt) => opt.value === status);
            if (!option) return null;

            return (
              <Badge
                key={status}
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-300 pl-3 pr-2 py-1.5 gap-2 min-h-[32px] touch-manipulation"
              >
                <span>{option.icon}</span>
                <span className="text-xs sm:text-sm">{option.label}</span>
                <button
                  onClick={() => removeStatusFilter(status)}
                  className="ml-1 hover:bg-emerald-100 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${option.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
