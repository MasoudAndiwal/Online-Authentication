'use client'

import { redirect } from 'next/navigation'

// Redirect to teachers list as default
// Note: (user-management) is a route group, so it doesn't appear in the URL
// URL will be /dashboard/teachers, not /dashboard/user-management/teachers
export default function UserManagementPage() {
  redirect('/dashboard/teachers')
}