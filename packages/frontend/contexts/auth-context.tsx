'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, signUp, useSession } from '@/packages/frontend/lib/auth-client'

interface AuthContextType {
  // Better Auth 세션 데이터 직접 노출
  session: ReturnType<typeof useSession>['data']
  isPending: boolean
  error: ReturnType<typeof useSession>['error']
  isAuthenticated: boolean

  // Better Auth 함수들 직접 노출
  signIn: typeof signIn
  signOut: typeof signOut
  signUp: typeof signUp

  // 세션 새로고침
  refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending, error, refetch } = useSession()

  const value: AuthContextType = {
    // Better Auth 세션 데이터 직접 사용
    session,
    isPending,
    error,
    isAuthenticated: !!session?.user,

    // Better Auth 함수들 직접 노출
    signIn,
    signOut,
    signUp,

    // 세션 새로고침
    refetch
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다')
  }

  return context
}

// 유틸리티 훅들
export function useRequiredAuth() {
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!auth.isPending && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isPending, auth.isAuthenticated, router])

  return auth
}

export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const auth = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!auth.isPending && auth.isAuthenticated) {
      router.push(redirectTo)
    }
  }, [auth.isPending, auth.isAuthenticated, router, redirectTo])

  return auth
}