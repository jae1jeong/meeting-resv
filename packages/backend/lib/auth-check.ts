import { redirect } from 'next/navigation'
import { getCurrentUser as getBetterAuthUser } from '@/packages/backend/auth/better-auth'
import { prisma } from './prisma'

interface AuthUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

/**
 * Better Auth 세션에서 사용자 정보 가져오기 (서버 컴포넌트용)
 */
async function getUserFromSession(): Promise<AuthUser | null> {
  try {
    const user = await getBetterAuthUser()

    if (!user || !user.email || !user.name) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin
    }
  } catch (error) {
    console.error('세션에서 사용자 정보 가져오기 실패:', error)
    return null
  }
}

/**
 * 어드민 권한 체크 (서버 컴포넌트용)
 * 권한이 없으면 홈으로 리다이렉트
 */
export async function requireAdmin() {
  const user = await getUserFromSession()

  if (!user) {
    redirect('/login')
  }

  // DB에서 최신 admin 상태 확인
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAdmin: true }
  })

  if (!dbUser?.isAdmin) {
    redirect('/')
  }

  return user
}

/**
 * 인증 체크 (서버 컴포넌트용)
 * 로그인하지 않았으면 로그인 페이지로 리다이렉트
 */
export async function requireAuth() {
  const user = await getUserFromSession()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * 어드민 권한 확인 (boolean 반환)
 */
export async function isAdmin() {
  const user = await getUserFromSession()

  if (!user) {
    return false
  }

  // DB에서 최신 admin 상태 확인
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAdmin: true }
  })

  return dbUser?.isAdmin || false
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  return await getUserFromSession()
}

/**
 * 로그인 여부 확인
 */
export async function isAuthenticated() {
  const user = await getUserFromSession()
  return !!user
}