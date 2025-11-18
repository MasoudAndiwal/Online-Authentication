"use client";

import type { Metadata } from "next";
import { StudentGuard } from "@/components/auth/role-guard";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

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
      <StudentLayoutContent>
        {children}
      </StudentLayoutContent>
    </StudentGuard>
  );
}
