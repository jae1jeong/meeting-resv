'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '../lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { parseKSTDate, setToKSTStartOfDay, toKSTDateString } from '@/packages/shared/utils/date-utils'

interface TimeSlotCheckRequest {
  roomId: string
  date: string // YYYY-MM-DD 형식 (KST)
  startTime: string // HH:MM 형식
  endTime: string // HH:MM 형식
  excludeBookingId?: string // 현재 변경하려는 예약 제외
}

interface UpdateBookingTimeRequest {
  bookingId: string
  newDate: string // YYYY-MM-DD 형식 (KST)
  newStartTime: string // HH:MM 형식
  newEndTime: string // HH:MM 형식
}

/**
 * 특정 시간대에 예약 가능 여부 확인
 */
export async function checkTimeSlotAvailabilityAction(
  request: TimeSlotCheckRequest
): Promise<{
  success: boolean
  available: boolean
  error?: {
    code: string
    message: string
  }
  timestamp: string
}> {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return {
        success: false,
        available: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    const { roomId, date, startTime, endTime, excludeBookingId } = request

    // 해당 회의실의 같은 날짜, 겹치는 시간대 예약 확인
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        date: parseKSTDate(date), // parseKSTDate가 이미 00:00:00으로 설정함
        AND: [
          {
            OR: [
              // 새 시작시간이 기존 예약 시간 사이에 있는 경우
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              // 새 종료시간이 기존 예약 시간 사이에 있는 경우
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              },
              // 새 예약이 기존 예약을 완전히 포함하는 경우
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } }
                ]
              }
            ]
          },
          // 현재 변경하려는 예약은 제외
          excludeBookingId ? { id: { not: excludeBookingId } } : {}
        ]
      }
    })

    const isAvailable = conflictingBookings.length === 0

    return {
      success: true,
      available: isAvailable,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('시간대 확인 중 오류:', error)
    return {
      success: false,
      available: false,
      error: {
        code: 'SERVER_ERROR',
        message: '시간대 확인 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * 예약 시간 변경
 */
export async function updateBookingTimeAction(
  request: UpdateBookingTimeRequest
): Promise<{
  success: boolean
  data?: BookingResponse
  error?: {
    code: string
    message: string
  }
  timestamp: string
}> {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    const { bookingId, newDate, newStartTime, newEndTime } = request

    // 기존 예약 조회 및 권한 확인
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        creatorId: session.user.id // 생성자만 변경 가능
      },
      include: {
        room: {
          include: {
            group: true
          }
        },
        creator: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!existingBooking) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '예약을 찾을 수 없거나 수정 권한이 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 시간대 충돌 확인
    const availability = await checkTimeSlotAvailabilityAction({
      roomId: existingBooking.roomId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      excludeBookingId: bookingId
    })

    if (!availability.available) {
      return {
        success: false,
        error: {
          code: 'TIME_CONFLICT',
          message: '해당 시간대에 다른 예약이 있습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 예약 시간 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date: parseKSTDate(newDate), // parseKSTDate가 이미 00:00:00으로 설정함
        startTime: newStartTime,
        endTime: newEndTime
      },
      include: {
        room: {
          include: {
            group: true
          }
        },
        creator: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    // 응답 데이터 변환
    const bookingResponse: BookingResponse = {
      id: updatedBooking.id,
      title: updatedBooking.title,
      description: updatedBooking.description,
      roomId: updatedBooking.roomId,
      creatorId: updatedBooking.creatorId,
      date: toKSTDateString(updatedBooking.date) as any, // Date 객체를 KST 문자열로 변환 (타입 캐스팅)
      startTime: updatedBooking.startTime,
      endTime: updatedBooking.endTime,
      isRecurring: updatedBooking.isRecurring,
      recurringId: updatedBooking.recurringId,
      color: '#3B82F6', // 기본 파란색
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
      creator: updatedBooking.creator,
      participants: updatedBooking.participants.map(p => ({
        id: p.id,
        bookingId: p.bookingId,
        userId: p.userId,
        addedAt: p.addedAt,
        user: p.user
      })),
      createdAt: updatedBooking.createdAt,
      updatedAt: updatedBooking.updatedAt
    }

    // 태그 기반 재검증 (부분 업데이트만)
    revalidateTag(`room-${existingBooking.roomId}`)
    revalidateTag(`bookings-${existingBooking.roomId}`)

    return {
      success: true,
      data: bookingResponse,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('예약 시간 변경 중 오류:', error)
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '예약 시간 변경 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}