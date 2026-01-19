"use client";

import * as React from "react";
import { SimpleClassCard } from "./simple-class-card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Class } from "@/lib/stores/teacher-dashboard-store";

interface SimpleClassGridProps {
  classes: Class[];
  isLoading?: boolean;
  error?: string | null;
  onViewDetails?: (classId: string) => void;
  className?: string;
}

export function SimpleClassGrid({
  classes,
  isLoading = false,
  error = null,
  onViewDetails,
  className
}: SimpleClassGridProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ClassCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={className}>
        <EmptyState
          type="error"
          colorScheme="orange"
          customConfig={{
            title: "Failed to load classes",
            description: error
          }}
          actions={{
            onPrimaryAction: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Show empty state
  if (!classes || classes.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          type="no-data"
          colorScheme="orange"
          customConfig={{
            title: "No classes assigned",
            description: "You don't have any classes assigned yet. Contact your administrator to get started."
          }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((classData) => (
          <SimpleClassCard
            key={classData.id}
            classData={classData}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton component for loading state
function ClassCardSkeleton() {
  return (
    <div className="rounded-2xl border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 overflow-hidden">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-gradient-to-r from-slate-200 to-slate-300 rounded mb-2 animate-pulse" />
            <div className="h-4 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
          </div>
        </div>

        {/* Student count skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
          <div className="h-5 w-24 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
