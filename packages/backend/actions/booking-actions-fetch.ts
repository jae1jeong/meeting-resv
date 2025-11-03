'use server'

import { prisma } from '../lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { BookingResponse } from '@/packages/shared/types/api/booking'
import { parseKSTDate, setToKSTStartOfDay, setToKSTEndOfDay, toKSTDateString } from '@/packages/shared/utils/date-utils'

// 회의실별 예약 조회 서버 액션 - ROOM VERSION
export async function getRoomBookingsAction(
  roomId: string,
  startDate: string,
  endDate: string
): Promise<{
  success: boolean
  data?: BookingResponse[]
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

    // 회의실 접근 권한 확인
    const room = await prisma.meetingRoom.findFirst({
      where: {
        id: roomId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!room) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '회의실에 접근 권한이 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 날짜 범위 로그
    console.log('📅 [FETCH] 예약 조회 날짜 범위:')
    console.log('  - startDate 문자열:', startDate)
    console.log('  - endDate 문자열:', endDate)
    console.log('  - parseKSTDate(startDate):', parseKSTDate(startDate))
    console.log('  - setToKSTEndOfDay(endDate):', setToKSTEndOfDay(parseKSTDate(endDate)))

    // 예약 조회
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        date: {
          gte: parseKSTDate(startDate), // KST 날짜 (이미 00:00:00)
          lte: setToKSTEndOfDay(parseKSTDate(endDate)) // KST 종료 시간 (23:59:59)
        }
      },
      include: {
        room: {
          include: {
            group: true
          }
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
            updatedAt: true
          }
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
                updatedAt: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      title: booking.title,
      description: booking.description,
      date: toKSTDateString(booking.date), // Date 객체를 KST 문자열로 변환
      startTime: booking.startTime,
      endTime: booking.endTime,
      roomId: booking.roomId,
      creatorId: booking.creatorId,
      isRecurring: booking.isRecurring,
      recurringId: booking.recurringId,
      color: booking.color,
      room: booking.room,
      creator: {
        id: booking.creator.id,
        name: booking.creator.name || '',
        email: booking.creator.email || '',
        emailVerified: booking.creator.emailVerified ?? false,
        image: booking.creator.image,
        isAdmin: booking.creator.isAdmin,
        createdAt: booking.creator.createdAt,
        updatedAt: booking.creator.updatedAt
      },
      participants: booking.participants.map(p => ({
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
          updatedAt: p.user.updatedAt
        }
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    return {
      success: true,
      data: formattedBookings as any as BookingResponse[], // 날짜를 문자열로 반환하므로 타입 캐스팅
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('회의실 예약 조회 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '예약 조회 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}

// 날짜 범위별 예약 조회 서버 액션 (모든 회의실)
export async function getBookingsForDateRangeAction(
  startDate: Date,
  endDate: Date
): Promise<{
  success: boolean
  data?: BookingResponse[]
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

    // 사용자가 속한 그룹의 모든 예약 조회
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startDate, // Date 객체 직접 사용
          lte: setToKSTEndOfDay(endDate) // KST 종료 시간
        },
        room: {
          group: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      },
      include: {
        room: {
          include: {
            group: true
          }
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
            updatedAt: true
          }
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
                updatedAt: true
              }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      title: booking.title,
      description: booking.description,
      date: toKSTDateString(booking.date), // Date 객체를 KST 문자열로 변환
      startTime: booking.startTime,
      endTime: booking.endTime,
      roomId: booking.roomId,
      creatorId: booking.creatorId,
      isRecurring: booking.isRecurring,
      recurringId: booking.recurringId,
      color: booking.color,
      room: booking.room,
      creator: {
        id: booking.creator.id,
        name: booking.creator.name || '',
        email: booking.creator.email || '',
        emailVerified: booking.creator.emailVerified ?? false,
        image: booking.creator.image,
        isAdmin: booking.creator.isAdmin,
        createdAt: booking.creator.createdAt,
        updatedAt: booking.creator.updatedAt
      },
      participants: booking.participants.map(p => ({
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
          updatedAt: p.user.updatedAt
        }
      })),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }))

    return {
      success: true,
      data: formattedBookings as any as BookingResponse[], // 날짜를 문자열로 반환하므로 타입 캐스팅
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('예약 조회 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '예약 조회 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}