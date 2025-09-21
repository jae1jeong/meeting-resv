'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signOut, signUp, useSession, updateUser } from '@/packages/frontend/lib/auth-client'
import type { Session, User } from 'better-auth/types'

interface AuthUser extends User {
  id: string
  isAdmin?: boolean
  groups?: Array<{
    id: string
    name: string
    role: string
  }>
}

interface AuthContextType {
  // Better Auth의 세션 데이터 그대로 노출
  session: Session | null
  user: AuthUser | null
  isPending: boolean
  error: any
  isAuthenticated: boolean

  // Better Auth 함수들 직접 노출
  signIn: typeof signIn
  signOut: typeof signOut
  signUp: typeof signUp
  updateUser: typeof updateUser

  // 추가 유틸리티
  refetch: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const sessionData = useSession()
  const router = useRouter()
  const [userWithGroups, setUserWithGroups] = useState<AuthUser | null>(null)

  // 세션 변경 시 그룹 정보 포함한 사용자 정보 가져오기
  useEffect(() => {
    if (sessionData.data?.user) {
      fetchUserWithGroups(sessionData.data.user.id)
    } else {
      setUserWithGroups(null)
    }
  }, [sessionData.data])

  // 그룹 정보를 포함한 전체 사용자 정보 가져오기
  const fetchUserWithGroups = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUserWithGroups({
            ...sessionData.data!.user,
            id: userId,
            isAdmin: data.user.isAdmin,
            groups: data.user.groups
          } as AuthUser)
        }
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error)
      // 실패 시 기본 사용자 정보만 사용
      if (sessionData.data?.user) {
        setUserWithGroups({
          ...sessionData.data.user,
          id: userId
        } as AuthUser)
      }
    }
  }

  const value: AuthContextType = {
    // Better Auth 세션 데이터
    session: sessionData.data,
    user: userWithGroups,
    isPending: sessionData.isPending,
    error: sessionData.error,
    isAuthenticated: !!sessionData.data?.user,

    // Better Auth 함수들 직접 노출
    signIn,
    signOut,
    signUp,
    updateUser,

    // 세션 새로고침
    refetch: sessionData.refetch
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

  useEffect(() => {
    if (!auth.isPending && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isPending, auth.isAuthenticated, router])

  return auth
}

export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isPending && auth.isAuthenticated) {
      router.push(redirectTo)
    }
  }, [auth.isPending, auth.isAuthenticated, router, redirectTo])

  return auth
}