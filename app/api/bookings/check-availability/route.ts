import { NextRequest } from 'next/server'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { parseKSTDate } from '@/packages/shared/utils/date-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    const { roomId, date, startTime, endTime, excludeBookingId } = body

    if (!roomId || !date || !startTime || !endTime) {
      return errorResponse('필수 항목을 모두 입력해주세요', 400)
    }

    // 해당 회의실의 같은 날짜, 겹치는 시간대 예약 확인
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        date: parseKSTDate(date),
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } }
                ]
              }
            ]
          },
          excludeBookingId ? { id: { not: excludeBookingId } } : {}
        ]
      }
    })

    const isAvailable = conflictingBookings.length === 0

    return successResponse({ available: isAvailable }, '조회 완료')
  } catch (error) {
    console.error('시간대 확인 중 오류:', error)
    return errorResponse('시간대 확인 중 오류가 발생했습니다', 500)
  }
}



