'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/packages/frontend/contexts/auth-context'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * 미인증 사용자는 자동으로 로그인 페이지로 리다이렉션됩니다.
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { session, isPending } = useAuth()
  const router = useRouter()

  const isAuthenticated = !!session?.user

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      router.push('/login')
    }
  }, [isPending, isAuthenticated, router])

  // 로딩 중일 때 표시할 컴포넌트
  if (isPending) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // 인증되지 않은 경우 리다이렉션 처리 중
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60">로그인이 필요합니다...</div>
      </div>
    )
  }

  return <>{children}</>
}