import { NextRequest } from 'next/server'
import { getSession } from '@/packages/backend/auth/better-auth'
import {
  successResponse,
  errorResponse,
} from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { unstable_cache } from 'next/cache'

async function getGroupBackgroundData(roomId: string, userId: string) {
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
              userId: userId,
            },
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  if (!room || room.group.members.length === 0) {
    return null
  }

  return {
    roomId: room.id,
    roomName: room.name,
    groupId: room.group.id,
    group: {
      id: room.group.id,
      name: room.group.name,
      backgroundImage: room.group.backgroundImage,
      backgroundBlur: room.group.backgroundBlur,
      backgroundOpacity: room.group.backgroundOpacity,
      backgroundPosition: room.group.backgroundPosition,
    },
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const { id: roomId } = await params

    // 그룹 ID를 먼저 조회하여 태그에 포함
    const room = await prisma.meetingRoom.findUnique({
      where: { id: roomId },
      select: {
        groupId: true,
        group: {
          select: {
            members: {
              where: {
                userId: session.user.id,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!room || room.group.members.length === 0) {
      return errorResponse('회의실 접근 권한이 없습니다', 403)
    }

    // ISR 캐싱 적용 (1시간, 태그 기반)
    // 회의실별 태그와 그룹별 태그 둘 다 사용
    const cachedData = await unstable_cache(
      async () => getGroupBackgroundData(roomId, session.user.id),
      [`group-background-${roomId}`],
      {
        revalidate: 3600, // 1시간
        tags: [
          `group-background-${roomId}`,
          `group-background-group-${room.groupId}`,
        ],
      }
    )()

    if (!cachedData) {
      return errorResponse('회의실 접근 권한이 없습니다', 403)
    }

    return successResponse(
      {
        roomId: cachedData.roomId,
        roomName: cachedData.roomName,
        group: cachedData.group,
      },
      '조회 완료'
    )
  } catch (error) {
    console.error('그룹 배경 조회 오류:', error)
    return errorResponse('그룹 배경을 불러올 수 없습니다', 500)
  }
}

