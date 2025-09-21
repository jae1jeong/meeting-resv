'use server'

import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'

/**
 * 특정 그룹의 배경이미지 설정 조회
 */
export async function getGroupBackground(groupId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('인증이 필요합니다')
  }

  // 사용자가 해당 그룹의 멤버인지 확인
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId: groupId
      }
    }
  })

  if (!member) {
    throw new Error('그룹 접근 권한이 없습니다')
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      backgroundImage: true,
      backgroundBlur: true,
      backgroundOpacity: true,
      backgroundPosition: true
    }
  })

  return group
}

/**
 * 사용자가 속한 모든 그룹의 배경이미지 조회
 */
export async function getUserGroupBackgrounds(userId?: string) {
  const session = await getSession()
  const targetUserId = userId || session?.user?.id

  if (!targetUserId) {
    throw new Error('인증이 필요합니다')
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: targetUserId
        }
      }
    },
    select: {
      id: true,
      name: true,
      backgroundImage: true,
      backgroundBlur: true,
      backgroundOpacity: true,
      backgroundPosition: true
    }
  })

  return groups
}

/**
 * 회의실이 속한 그룹의 배경이미지 조회
 */
export async function getRoomGroupBackground(roomId: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error('인증이 필요합니다')
  }

  const room = await prisma.meetingRoom.findUnique({
    where: { id: roomId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          backgroundImage: true,
          backgroundBlur: true,
          backgroundOpacity: true,
          backgroundPosition: true,
          members: {
            where: {
              userId: session.user.id
            },
            select: {
              id: true
            }
          }
        }
      }
    }
  })

  if (!room || room.group.members.length === 0) {
    throw new Error('회의실 접근 권한이 없습니다')
  }

  return {
    roomId: room.id,
    roomName: room.name,
    group: {
      id: room.group.id,
      name: room.group.name,
      backgroundImage: room.group.backgroundImage,
      backgroundBlur: room.group.backgroundBlur,
      backgroundOpacity: room.group.backgroundOpacity,
      backgroundPosition: room.group.backgroundPosition
    }
  }
}