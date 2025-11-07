import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const [totalRooms, totalCapacity, monthlyBookings] = await Promise.all([
      prisma.meetingRoom.count(),
      prisma.meetingRoom.aggregate({
        _sum: {
          capacity: true
        }
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      })
    ])

    const averageUtilization = 82 // TODO: 실제 계산 로직 구현

    return successResponse({
      totalRooms,
      totalCapacity: totalCapacity._sum.capacity || 0,
      monthlyBookings,
      averageUtilization
    }, '조회 완료')
  } catch (error) {
    console.error('회의실 통계 조회 오류:', error)
    return errorResponse('회의실 통계를 불러올 수 없습니다', 500)
  }
}



