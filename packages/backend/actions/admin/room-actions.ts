'use server'

import { prisma } from '@/packages/backend/lib/prisma'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { revalidatePath } from 'next/cache'

/**
 * 회의실 목록 조회 (어드민 전용)
 */
export async function getRooms() {
  await requireAdmin()

  const rooms = await prisma.meetingRoom.findMany({
    include: {
      group: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          bookings: {
            where: {
              date: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return rooms.map(room => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    location: room.location,
    amenities: room.amenities,
    groupId: room.groupId,
    groupName: room.group.name,
    bookingCount: room._count.bookings
  }))
}

/**
 * 회의실 생성 (어드민 전용)
 */
export async function createRoom(data: {
  name: string
  capacity: number
  location?: string
  amenities: string[]
  groupId: string
}) {
  await requireAdmin()

  const room = await prisma.meetingRoom.create({
    data: {
      name: data.name,
      capacity: data.capacity,
      location: data.location,
      amenities: data.amenities,
      groupId: data.groupId
    }
  })

  revalidatePath('/admin/rooms')
  return room
}

/**
 * 회의실 수정 (어드민 전용)
 */
export async function updateRoom(
  roomId: string,
  data: {
    name?: string
    capacity?: number
    location?: string
    amenities?: string[]
    groupId?: string
  }
) {
  await requireAdmin()

  const room = await prisma.meetingRoom.update({
    where: {
      id: roomId
    },
    data
  })

  revalidatePath('/admin/rooms')
  return room
}

/**
 * 회의실 삭제 (어드민 전용)
 */
export async function deleteRoom(roomId: string) {
  await requireAdmin()

  // 회의실과 관련된 모든 예약은 CASCADE로 자동 삭제됨
  await prisma.meetingRoom.delete({
    where: {
      id: roomId
    }
  })

  revalidatePath('/admin/rooms')
  return { success: true }
}

/**
 * 회의실 통계 조회 (어드민 전용)
 */
export async function getRoomStats() {
  await requireAdmin()

  const [totalRooms, totalCapacity, monthlyBookings] = await Promise.all([
    // 전체 회의실 수
    prisma.meetingRoom.count(),

    // 총 수용 인원
    prisma.meetingRoom.aggregate({
      _sum: {
        capacity: true
      }
    }),

    // 이번 달 총 예약 수
    prisma.booking.count({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }
    })
  ])

  // 평균 이용률 계산 (임시로 고정값 사용)
  const averageUtilization = 82 // TODO: 실제 계산 로직 구현

  return {
    totalRooms,
    totalCapacity: totalCapacity._sum.capacity || 0,
    monthlyBookings,
    averageUtilization
  }
}