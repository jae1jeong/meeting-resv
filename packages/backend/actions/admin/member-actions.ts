'use server'

import { prisma } from '@/packages/backend/lib/prisma'
import { requireAdmin } from '@/packages/backend/lib/auth-check'

/**
 * 그룹의 멤버 목록 조회 (어드민 전용)
 */
export async function getGroupMembers(groupId: string) {
  await requireAdmin()

  const members = await prisma.groupMember.findMany({
    where: {
      groupId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      joinedAt: 'desc'
    }
  })

  return members.map(member => ({
    id: member.id,
    userId: member.userId,
    name: member.user.name || '',
    email: member.user.email || '',
    role: member.role,
    joinedAt: member.joinedAt
  }))
}

/**
 * 그룹 정보 조회 (어드민 전용)
 */
export async function getGroupDetail(groupId: string) {
  await requireAdmin()

  const group = await prisma.group.findUnique({
    where: {
      id: groupId
    },
    select: {
      id: true,
      name: true,
      description: true
    }
  })

  if (!group) {
    throw new Error('그룹을 찾을 수 없습니다')
  }

  return group
}