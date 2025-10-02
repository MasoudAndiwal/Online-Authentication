'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

// This would normally come from your auth system
const getCurrentUser = () => {
  // Mock user - in real app, this would come from your auth context/API
  return {
    role: 'OFFICE', // Change this to test access control
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@university.edu'
  }
}

export default function UserManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const user = getCurrentUser()
    
    // Redirect if user is not Office role
    if (user?.role !== 'OFFICE') {
      // In a real app, you might redirect to an unauthorized page or dashboard
      redirect('/dashboard')
    }
  }, [])

  const user = getCurrentUser()

  // Don't render anything if user is not authorized
  if (user?.role !== 'OFFICE') {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Security Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-center text-sm font-medium">
        🔒 Restricted Area - Office Administrator Access Only
      </div>
      {children}
    </div>
  )
}