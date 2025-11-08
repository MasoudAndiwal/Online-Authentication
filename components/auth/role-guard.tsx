"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'OFFICE' | 'TEACHER' | 'STUDENT';
  fallbackPath?: string;
}

/**
 * Role-based authentication guard component
 * Protects routes based on user role and redirects if unauthorized
 */
export function RoleGuard({ 
  children, 
  requiredRole, 
  fallbackPath 
}: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth({ requiredRole });

  // Show loading state while checking authentication
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // If user is not authenticated or doesn't have required role,
  // the useAuth hook will handle the redirect
  if (!user || user.role !== requiredRole) {
    return <AuthLoadingScreen />;
  }

  // User is authenticated and has the required role
  return <>{children}</>;
}

/**
 * Higher-order component for role-based route protection
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: 'OFFICE' | 'TEACHER' | 'STUDENT'
) {
  const WrappedComponent = (props: P) => (
    <RoleGuard requiredRole={requiredRole}>
      <Component {...props} />
    </RoleGuard>
  );

  WrappedComponent.displayName = `withRoleGuard(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Specific role guard components for convenience
 */
export const OfficeGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRole="OFFICE">{children}</RoleGuard>
);

export const TeacherGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRole="TEACHER">{children}</RoleGuard>
);

export const StudentGuard = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard requiredRole="STUDENT">{children}</RoleGuard>
);