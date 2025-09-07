"use client"

import { useEffect, type ReactNode } from "react"
import Image from "next/image"
import { useAuth } from "@/shared/hooks/useAuth"
import { GlassCard } from "@/packages/frontend/components/ui/glass-card"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      requireAuth()
    }
  }, [isLoading, isAuthenticated, requireAuth])

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
        
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <GlassCard className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            <p className="text-white/70">로딩 중...</p>
          </GlassCard>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 (리다이렉트 처리됨)
  if (!isAuthenticated) {
    return null
  }

  // 인증된 사용자만 children 렌더링
  return <>{children}</>
}