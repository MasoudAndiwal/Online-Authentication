"use client";

import type { Metadata } from "next";
import { StudentGuard } from "@/components/auth/role-guard";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { StudentErrorBoundary } from "@/components/student/error-boundary";

// Note: metadata export is not supported in client components
// Move metadata to a parent server component if needed

function StudentLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track user activity for auto-logout
  useActivityTracker();

  return <>{children}</>;
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentGuard>
      <StudentErrorBoundary
        onError={(error, errorInfo) => {
          // Log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Student Layout Error:', error, errorInfo);
          }
          // In production, send to error tracking service
        }}
      >
        <StudentLayoutContent>
          {children}
        </StudentLayoutContent>
      </StudentErrorBoundary>
    </StudentGuard>
  );
}
