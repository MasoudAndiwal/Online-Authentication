"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceHistoryTimeline } from "./attendance-history-timeline";
import { AttendanceHistoryFilters, type HistoryFilters } from "./attendance-history-filters";
import { AttendanceHistoryExport } from "./attendance-history-export";
import { AttendanceHistoryStats } from "./attendance-history-stats";
import { History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/types";

interface AttendanceHistoryViewProps {
  records: AttendanceRecord[];
  studentName?: string;
  isLoading?: boolean;
  className?: string;
}

const RECORDS_PER_PAGE = 20;

/**
 * Attendance History View Component
 * Main container for attendance history with filters, stats, export, and timeline
 * Features infinite scroll, skeleton loading, and full responsive design
 * Requirements: 7.1, 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function AttendanceHistoryView({
  records,
  studentName = "Student",
  isLoading = false,
  className,
}: AttendanceHistoryViewProps) {
  const [filters, setFilters] = useState<HistoryFilters>({
    dateRange: { start: undefined, end: undefined },
    statusTypes: [],
    month: undefined,
  });

  const [displayedRecordsCount, setDisplayedRecordsCount] = useState(RECORDS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter records based on active filters
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;

        if (startDate && endDate) {
          return recordDate >= startDate && recordDate <= endDate;
        } else if (startDate) {
          return recordDate >= startDate;
        } else if (endDate) {
          return recordDate <= endDate;
        }
        return true;
      });
    }

    // Filter by status types
    if (filters.statusTypes.length > 0) {
      filtered = filtered.filter((record) =>
        filters.statusTypes.includes(record.status)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [records, filters]);

  // Records to display (with pagination)
  const displayedRecords = useMemo(() => {
    return filteredRecords.slice(0, displayedRecordsCount);
  }, [filteredRecords, displayedRecordsCount]);

  const hasMoreRecords = displayedRecordsCount < filteredRecords.length;

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRecords && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay
          setTimeout(() => {
            setDisplayedRecordsCount((prev) =>
              Math.min(prev + RECORDS_PER_PAGE, filteredRecords.length)
            );
            setIsLoadingMore(false);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreRecords, isLoadingMore, filteredRecords.length]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedRecordsCount(RECORDS_PER_PAGE);
  }, [filters]);

  const handleFilterChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6 sm:space-y-8", className)}>
        <AttendanceHistoryViewSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6 sm:space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <History className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
            Attendance History
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            View and export your complete attendance records
          </p>
        </div>
      </div>

      {/* Statistics Summary */}
      <AttendanceHistoryStats
        records={filteredRecords}
        dateRange={filters.dateRange}
      />

      {/* Filters */}
      <AttendanceHistoryFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Export Functionality */}
      <AttendanceHistoryExport
        records={filteredRecords}
        studentName={studentName}
      />

      {/* Timeline */}
      <div>
        <AttendanceHistoryTimeline records={displayedRecords} />

        {/* Infinite Scroll Trigger */}
        {hasMoreRecords && (
          <div ref={observerTarget} className="py-8 flex justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-emerald-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading more records...</span>
              </div>
            )}
          </div>
        )}

        {/* End of Records Message */}
        {!hasMoreRecords && displayedRecords.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">
              You've reached the end of your attendance history
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton Loading Component
 * Displays while attendance history data is being fetched
 */
function AttendanceHistoryViewSkeleton() {
  return (
    <>
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-xl shadow-lg border-0">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 sm:h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <Card className="rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Skeleton */}
      <Card className="rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 sm:p-5 lg:p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-11 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="ml-5 sm:ml-6 pl-6 sm:pl-8 space-y-4">
              <Card className="rounded-xl border-2">
                <CardContent className="p-4 sm:p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
