'use server'

import { prisma } from '@/packages/backend/lib/prisma'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { revalidatePath } from 'next/cache'

/**
 * 그룹 목록 조회 (어드민 전용)
 */
export async function getGroups() {
  await requireAdmin()

  const groups = await prisma.group.findMany({
    include: {
      _count: {
        select: {
          members: true,
          rooms: true
        }
      },
      members: {
        where: {
          role: 'ADMIN'
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return groups.map(group => ({
    id: group.id,
    name: group.name,
    description: group.description,
    inviteCode: group.inviteCode,
    memberCount: group._count.members,
    adminCount: group.members.length,
    roomCount: group._count.rooms,
    createdAt: group.createdAt
  }))
}

/**
 * 그룹 생성 (어드민 전용)
 */
export async function createGroup(data: {
  name: string
  description?: string
  backgroundImage?: string
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundPosition?: string
}) {
  const session = await requireAdmin()

  // 초대 코드 생성 (6자리 랜덤)
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  const group = await prisma.group.create({
    data: {
      name: data.name,
      description: data.description,
      inviteCode,
      backgroundImage: data.backgroundImage,
      backgroundBlur: data.backgroundBlur ?? 10,
      backgroundOpacity: data.backgroundOpacity ?? 0.5,
      backgroundPosition: data.backgroundPosition ?? 'center',
      members: {
        create: {
          userId: session.user.id,
          role: 'ADMIN'
        }
      }
    }
  })

  revalidatePath('/admin/groups')
  return group
}

/**
 * 그룹 업데이트 (어드민 전용)
 */
export async function updateGroup(groupId: string, data: {
  name?: string
  description?: string
  backgroundImage?: string | null
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundPosition?: string
}) {
  await requireAdmin()

  const group = await prisma.group.update({
    where: {
      id: groupId
    },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.backgroundImage !== undefined && { backgroundImage: data.backgroundImage }),
      ...(data.backgroundBlur !== undefined && { backgroundBlur: data.backgroundBlur }),
      ...(data.backgroundOpacity !== undefined && { backgroundOpacity: data.backgroundOpacity }),
      ...(data.backgroundPosition && { backgroundPosition: data.backgroundPosition })
    }
  })

  revalidatePath('/admin/groups')
  revalidatePath(`/admin/groups/${groupId}`)
  return group
}

/**
 * 그룹 삭제 (어드민 전용)
 */
export async function deleteGroup(groupId: string) {
  await requireAdmin()

  // 그룹과 관련된 모든 데이터는 CASCADE로 자동 삭제됨
  await prisma.group.delete({
    where: {
      id: groupId
    }
  })

  revalidatePath('/admin/groups')
  return { success: true }
}

/**
 * 그룹 멤버 추가 (어드민 전용)
 */
export async function addGroupMember(data: {
  groupId: string
  userEmail: string
  role: 'ADMIN' | 'MEMBER'
}) {
  await requireAdmin()

  // 사용자 찾기
  const user = await prisma.user.findUnique({
    where: {
      email: data.userEmail
    }
  })

  if (!user) {
    throw new Error('사용자를 찾을 수 없습니다')
  }

  // 이미 멤버인지 확인
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: user.id,
        groupId: data.groupId
      }
    }
  })

  if (existingMember) {
    throw new Error('이미 그룹의 멤버입니다')
  }

  // 멤버 추가
  const member = await prisma.groupMember.create({
    data: {
      userId: user.id,
      groupId: data.groupId,
      role: data.role
    },
    include: {
      user: true
    }
  })

  revalidatePath(`/admin/groups/${data.groupId}`)
  return member
}

/**
 * 그룹 멤버 제거 (어드민 전용)
 */
export async function removeGroupMember(data: {
  groupId: string
  memberId: string
}) {
  await requireAdmin()

  await prisma.groupMember.delete({
    where: {
      id: data.memberId
    }
  })

  revalidatePath(`/admin/groups/${data.groupId}`)
  return { success: true }
}

/**
 * 그룹 멤버 역할 변경 (어드민 전용)
 */
export async function changeGroupMemberRole(data: {
  memberId: string
  newRole: 'ADMIN' | 'MEMBER'
}) {
  await requireAdmin()

  const member = await prisma.groupMember.update({
    where: {
      id: data.memberId
    },
    data: {
      role: data.newRole
    }
  })

  revalidatePath('/admin/groups')
  return member
}