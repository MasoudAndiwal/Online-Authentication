"use client";

import * as React from "react";
import { TeacherClassCard } from "./teacher-class-card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Class } from "@/lib/stores/teacher-dashboard-store";
import { useKeyboardNavigation } from "@/lib/hooks/use-keyboard-navigation";
import { useScreenReaderAnnouncements } from "@/lib/hooks/use-screen-reader-announcements";

interface TeacherClassGridProps {
  classes: Class[];
  isLoading?: boolean;
  error?: string | null;
  onMarkAttendance?: (classId: string) => void;
  onViewDetails?: (classId: string) => void;
  onViewStudents?: (classId: string) => void;
  onViewReports?: (classId: string) => void;
  onViewSchedule?: (classId: string) => void;
  onManageClass?: (classId: string) => void;
  onCreateClass?: () => void;
  className?: string;
}

export function TeacherClassGrid({
  classes,
  isLoading = false,
  error = null,
  onMarkAttendance,
  onViewDetails,
  onViewStudents,
  onViewReports,
  onViewSchedule,
  onManageClass,
  onCreateClass,
  className
}: TeacherClassGridProps) {
  const { announce } = useScreenReaderAnnouncements();
  
  // Determine grid columns based on screen size
  const [columns, setColumns] = React.useState(4);
  
  React.useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else if (window.innerWidth < 1280) setColumns(3);
      else setColumns(4);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const {
    focusedIndex,
    setItemRef,
    handleKeyDown,
  } = useKeyboardNavigation({
    totalItems: classes.length,
    columns,
    enabled: !isLoading && !error && classes.length > 0,
    onSelect: (index) => {
      const selectedClass = classes[index];
      if (selectedClass && onViewDetails) {
        onViewDetails(selectedClass.id);
        announce(`Opening ${selectedClass.name}`);
      }
    },
  });

  // Announce loading state changes
  React.useEffect(() => {
    if (isLoading) {
      announce('Loading classes');
    } else if (classes.length > 0) {
      announce(`${classes.length} ${classes.length === 1 ? 'class' : 'classes'} loaded`);
    }
  }, [isLoading, classes.length, announce]);

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={className}
        role="status"
        aria-live="polite"
        aria-label="Loading classes"
      >
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
            description: "You don't have any classes assigned yet. Contact your administrator to get started.",
            actionLabel: onCreateClass ? "Request Class Assignment" : undefined
          }}
          actions={{
            onPrimaryAction: onCreateClass
          }}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
        aria-label="Your assigned classes"
        onKeyDown={handleKeyDown}
      >
        {classes.map((classData, index) => (
          <div
            key={classData.id}
            role="listitem"
          >
            <TeacherClassCard
              ref={setItemRef(index)}
              classData={classData}
              onMarkAttendance={onMarkAttendance}
              onViewDetails={onViewDetails}
              onViewStudents={onViewStudents}
              onViewReports={onViewReports}
              onViewSchedule={onViewSchedule}
              onManageClass={onManageClass}
              isFocused={focusedIndex === index}
              tabIndex={focusedIndex === index ? 0 : -1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton component for loading state
function ClassCardSkeleton() {
  return (
    <div
      className="rounded-2xl shadow-md border-0 bg-[#FEF7ED] overflow-hidden"
    >
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
            <div>
              <div className="h-5 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="w-8 h-8 bg-slate-200 rounded-xl" />
        </div>

        {/* Students count skeleton */}
        <div className="mb-5">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
            <div className="h-4 w-16 bg-slate-200 rounded mb-2" />
            <div className="h-8 w-12 bg-slate-200 rounded" />
          </div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
          <div className="flex-1 h-11 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}