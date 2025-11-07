import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSession } from '@/packages/backend/auth/better-auth'
import {
  successResponse,
  errorResponse,
} from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import {
  parseKSTDate,
  toKSTDateString,
} from '@/packages/shared/utils/date-utils'
import type {
  BookingResponse,
  BookingParticipantWithUser,
} from '@/packages/shared/types/api/booking'
import type { Prisma } from '@prisma/client'
import type { UserResponse } from '@/packages/shared/types/api/user'

type BookingWithIncludes = Prisma.BookingGetPayload<{
  include: {
    room: {
      include: {
        group: true
      }
    }
    creator: true
    participants: {
      include: {
        user: true
      }
    }
  }
}>

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    const { bookingId, newDate, newStartTime, newEndTime } = body

    if (!bookingId || !newDate || !newStartTime || !newEndTime) {
      return errorResponse('필수 항목을 모두 입력해주세요', 400)
    }

    // 기존 예약 조회 및 권한 확인
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        creatorId: session.user.id,
      },
      select: {
        roomId: true,
      },
    })

    if (!existingBooking) {
      return errorResponse('예약을 찾을 수 없거나 수정 권한이 없습니다', 404)
    }

    // 예약 조회 (권한 확인용)
    const bookingForAuth = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { roomId: true },
    })

    if (!bookingForAuth) {
      return errorResponse('예약을 찾을 수 없습니다', 404)
    }

    // 시간대 충돌 확인
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: existingBooking.roomId,
        date: parseKSTDate(newDate),
        id: { not: bookingId },
        AND: [
          {
            OR: [
              {
                AND: [
                  { startTime: { lte: newStartTime } },
                  { endTime: { gt: newStartTime } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: newEndTime } },
                  { endTime: { gte: newEndTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: newStartTime } },
                  { endTime: { lte: newEndTime } },
                ],
              },
            ],
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return errorResponse('해당 시간대에 다른 예약이 있습니다', 409)
    }

    // 예약 시간 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: parseKSTDate(newDate),
        startTime: newStartTime,
        endTime: newEndTime,
      },
      include: {
        room: {
          include: {
            group: true,
          },
        },
        creator: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    })

    // 응답 데이터 변환
    const creator: UserResponse = {
      id: updatedBooking.creator.id,
      name: updatedBooking.creator.name || '',
      email: updatedBooking.creator.email || '',
      emailVerified: updatedBooking.creator.emailVerified ?? false,
      image: updatedBooking.creator.image,
      isAdmin: updatedBooking.creator.isAdmin,
      createdAt: updatedBooking.creator.createdAt,
      updatedAt: updatedBooking.creator.updatedAt,
    }

    const participants: BookingParticipantWithUser[] =
      updatedBooking.participants.map(
        (p: BookingWithIncludes['participants'][number]) => ({
          id: p.id,
          bookingId: p.bookingId,
          userId: p.userId,
          addedAt: p.addedAt,
          user: {
            id: p.user.id,
            name: p.user.name || '',
            email: p.user.email || '',
            emailVerified: p.user.emailVerified ?? false,
            image: p.user.image,
            isAdmin: p.user.isAdmin,
            createdAt: p.user.createdAt,
            updatedAt: p.user.updatedAt,
          },
        })
      )

    const bookingResponse: BookingResponse = {
      id: updatedBooking.id,
      title: updatedBooking.title,
      description: updatedBooking.description,
      roomId: updatedBooking.roomId,
      creatorId: updatedBooking.creatorId,
      date: toKSTDateString(updatedBooking.date),
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime,
      isRecurring: updatedBooking.isRecurring,
      recurringId: updatedBooking.recurringId,
      color: updatedBooking.color,
      room: {
        id: updatedBooking.room.id,
        name: updatedBooking.room.name,
        capacity: updatedBooking.room.capacity,
        location: updatedBooking.room.location,
        amenities: updatedBooking.room.amenities,
        groupId: updatedBooking.room.groupId,
        createdAt: updatedBooking.room.createdAt,
        updatedAt: updatedBooking.room.updatedAt,
      },
      creator,
      participants,
      createdAt: updatedBooking.createdAt,
      updatedAt: updatedBooking.updatedAt,
    }

    // 태그 기반 재검증
    revalidateTag(`room-${existingBooking.roomId}`)
    revalidateTag(`bookings-${existingBooking.roomId}`)

    return successResponse<BookingResponse>(
      bookingResponse,
      '예약 시간이 변경되었습니다'
    )
  } catch (error) {
    console.error('예약 시간 변경 중 오류:', error)
    return errorResponse('예약 시간 변경 중 오류가 발생했습니다', 500)
  }
}
