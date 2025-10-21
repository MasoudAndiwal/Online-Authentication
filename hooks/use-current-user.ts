'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/auth/session'

interface UserProfile {
  name: string
  email: string
  role: 'OFFICE' | 'TEACHER' | 'STUDENT'
  avatar?: string
}

/**
 * Hook to get current logged-in user
 * Returns user profile or null if not authenticated
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const session = getSession()
      
      if (session) {
        // Convert session to user profile format
        const userProfile: UserProfile = {
          name: session.username || `${session.firstName} ${session.lastName}`.trim() || 'User',
          email: session.email || 'user@university.edu',
          role: session.role,
          avatar: undefined, // Can be extended to include avatar URL from session
        }
        setUser(userProfile)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error loading user session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading }
}
