'use client'

import { redirect } from 'next/navigation'

// Redirect to all-users as the default user management page
export default function UserManagementPage() {
  redirect('/user-management/all-users')
}