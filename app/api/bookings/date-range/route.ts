import { NextRequest } from 'next/server'
import { getSession } from '@/packages/backend/auth/better-auth'
import {
  successResponse,
  errorResponse,
} from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import {
  setToKSTEndOfDay,
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
    creator: {
      select: {
        id: true
        name: true
        email: true
        emailVerified: true
        image: true
        isAdmin: true
        createdAt: true
        updatedAt: true
      }
    }
    participants: {
      include: {
        user: {
          select: {
            id: true
            name: true
            email: true
            emailVerified: true
            image: true
            isAdmin: true
            createdAt: true
            updatedAt: true
          }
        }
      }
    }
  }
}>

const mapBookingToResponse = (
  booking: BookingWithIncludes
): BookingResponse => {
  const creator: UserResponse = {
    id: booking.creator.id,
    name: booking.creator.name || '',
    email: booking.creator.email || '',
    emailVerified: booking.creator.emailVerified ?? false,
    image: booking.creator.image,
    isAdmin: booking.creator.isAdmin,
    createdAt: booking.creator.createdAt,
    updatedAt: booking.creator.updatedAt,
  }

  const participants: BookingParticipantWithUser[] = booking.participants.map(
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

  return {
    id: booking.id,
    title: booking.title,
    description: booking.description,
    date: toKSTDateString(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    roomId: booking.roomId,
    creatorId: booking.creatorId,
    isRecurring: booking.isRecurring,
    recurringId: booking.recurringId,
    color: booking.color,
    room: booking.room,
    creator,
    participants,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      return errorResponse('startDate와 endDate가 필요합니다', 400)
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // 사용자가 속한 그룹의 모든 예약 조회
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: start,
          lte: setToKSTEndOfDay(end),
        },
        room: {
          group: {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
      include: {
        room: {
          include: {
            group: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    const formattedBookings: BookingResponse[] =
      bookings.map(mapBookingToResponse)

    return successResponse<BookingResponse[]>(formattedBookings, '조회 완료')
  } catch (error) {
    console.error('예약 조회 오류:', error)
    return errorResponse('예약 조회 중 오류가 발생했습니다', 500)
  }
}
