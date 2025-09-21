'use server'

import { prisma } from '@/packages/backend/lib/prisma'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { revalidatePath } from 'next/cache'

/**
 * 모든 사용자 목록 조회 (어드민 전용)
 */
export async function getAllUsers() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
      _count: {
        select: {
          groupMemberships: true,
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return users
}

/**
 * 사용자 Admin 권한 토글 (어드민 전용)
 */
export async function toggleAdminStatus(userId: string) {
  const session = await requireAdmin()

  // 자기 자신의 권한은 변경할 수 없음
  if (session.user.id === userId) {
    throw new Error('자신의 권한은 변경할 수 없습니다')
  }

  // 현재 상태 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  })

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다')
  }

  // 상태 토글
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: !user.isAdmin
    }
  })

  revalidatePath('/admin/users')
  return updatedUser
}

/**
 * 사용자를 Admin으로 승급 (어드민 전용)
 */
export async function makeUserAdmin(userId: string) {
  await requireAdmin()

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: true
    }
  })

  revalidatePath('/admin/users')
  return user
}

/**
 * 사용자의 Admin 권한 제거 (어드민 전용)
 */
export async function removeAdminStatus(userId: string) {
  const session = await requireAdmin()

  // 자기 자신의 권한은 제거할 수 없음
  if (session.user.id === userId) {
    throw new Error('자신의 권한은 제거할 수 없습니다')
  }

  // 최소 1명의 admin은 있어야 함
  const adminCount = await prisma.user.count({
    where: { isAdmin: true }
  })

  if (adminCount <= 1) {
    throw new Error('최소 1명의 관리자는 필요합니다')
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: false
    }
  })

  revalidatePath('/admin/users')
  return user
}

/**
 * Admin 사용자 목록 조회 (어드민 전용)
 */
export async function getAdminUsers() {
  await requireAdmin()

  const admins = await prisma.user.findMany({
    where: {
      isAdmin: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return admins
}