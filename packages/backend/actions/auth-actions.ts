'use server'

import { auth } from '@/packages/backend/auth/better-auth'
import { headers } from 'next/headers'
import { prisma } from '@/packages/backend/lib/prisma'

interface AuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    isAdmin: boolean
    groups?: Array<{
      id: string
      name: string
      role: string
    }>
  }
  error?: string
}

/**
 * 현재 사용자 정보 조회 서버 액션
 * Better Auth 세션을 통해 사용자 정보를 가져옵니다
 */
export async function getCurrentUserAction(): Promise<AuthResult> {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList
    })

    if (!session?.session || !session.user) {
      return {
        success: false,
        error: '인증이 필요합니다'
      }
    }

    // 사용자 정보를 그룹 정보와 함께 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        groupMemberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다'
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        isAdmin: user.isAdmin || user.groupMemberships.some(m => m.role === 'ADMIN'),
        groups: user.groupMemberships.map(m => ({
          id: m.group.id,
          name: m.group.name,
          role: m.role
        }))
      }
    }
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return {
      success: false,
      error: '사용자 정보 조회 중 오류가 발생했습니다'
    }
  }
}

/**
 * 로그아웃 서버 액션
 * Better Auth의 세션을 무효화합니다
 */
export async function logoutAction(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const headersList = await headers()

    // Better Auth 로그아웃 API 호출
    await auth.api.signOut({
      headers: headersList
    })

    return {
      success: true,
      message: '로그아웃되었습니다'
    }
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return {
      success: false,
      error: '로그아웃 처리 중 오류가 발생했습니다'
    }
  }
}

/**
 * 토큰 갱신 서버 액션 (Better Auth가 자동으로 처리하지만 호환성을 위해 유지)
 */
export async function refreshTokenAction(): Promise<{ success: boolean; accessToken?: string; user?: any; error?: string }> {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList
    })

    if (!session?.session || !session.user) {
      return {
        success: false,
        error: '세션을 갱신할 수 없습니다'
      }
    }

    // Better Auth는 자동으로 세션을 갱신하므로
    // 여기서는 현재 세션 정보만 반환
    return {
      success: true,
      accessToken: session.session.token,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        isAdmin: session.user.isAdmin || false
      }
    }
  } catch (error) {
    console.error('세션 갱신 오류:', error)
    return {
      success: false,
      error: '세션 갱신 중 오류가 발생했습니다'
    }
  }
}

// 기존 loginAction은 제거 - Better Auth 클라이언트의 signIn 메서드 사용