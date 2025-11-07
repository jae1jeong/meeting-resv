import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
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

    const result = rooms.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      amenities: room.amenities,
      groupId: room.groupId,
      groupName: room.group.name,
      bookingCount: room._count.bookings
    }))

    return successResponse(result, '조회 완료')
  } catch (error) {
    console.error('회의실 목록 조회 오류:', error)
    return errorResponse('회의실 목록을 불러올 수 없습니다', 500)
  }
}



