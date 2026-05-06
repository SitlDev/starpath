'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component wrapper that ensures user is authenticated
 * Usage: Wrap your page component with <ProtectedRoute>{Page}</ProtectedRoute>
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const token = getToken()

  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
    }
  }, [token, router])

  if (!token) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return children
}
