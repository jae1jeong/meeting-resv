/**
 * 서버 컴포넌트에서 사용하는 데이터 fetching 헬퍼 함수들
 * Prisma를 직접 사용하여 DB에서 데이터를 가져옵니다.
 */

import { prisma } from '@/packages/backend/lib/prisma'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { cache } from 'react'
import { toKSTDateString, setToKSTStartOfDay, setToKSTEndOfDay } from '@/packages/shared/utils/date-utils'

const DAY_IN_MS = 24 * 60 * 60 * 1000

/**
 * 캐시된 회의실 정보 조회 (인증 확인 포함)
 */
export const getRoomWithAuth = cache(async (roomId: string, userId: string): Promise<MeetingRoomWithGroup | null> => {
  try {
    const room = await prisma.meetingRoom.findFirst({
      where: {
        id: roomId,
        group: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        group: true
      }
    })

    return room
  } catch (error) {
    console.error('Error fetching room:', error)
    return null
  }
})

/**
 * 캐시된 회의실별 예약 목록 조회
 */
export const getRoomBookings = cache(async (
  roomId: string, 
  userId: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<BookingResponse[]> => {
  try {
    // 기본적으로 이번 주 예약만 조회
    const now = new Date()
    const fallbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const baseStart = startDate ? new Date(startDate) : fallbackStart
    const baseEnd = endDate ? new Date(endDate) : new Date(baseStart.getTime() + 6 * DAY_IN_MS)

    const normalizedStart = setToKSTStartOfDay(baseStart)
    const normalizedEnd = setToKSTEndOfDay(baseEnd)

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: roomId,
        date: {
          gte: normalizedStart,
          lte: normalizedEnd
        },
        room: {
          group: {
            members: {
              some: {
                userId: userId
              }
            }
          }
        }
      },
      include: {
        room: true,
        creator: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                emailVerified: true,
                name: true,
                image: true,
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

    return bookings.map(booking => ({
      ...booking,
      date: toKSTDateString(booking.date),
      creator: {
        ...booking.creator,
        isAdmin: false // 기본값 설정
      },
      participants: booking.participants.map(p => ({
        ...p,
        user: {
          ...p.user,
          isAdmin: false // 기본값 설정
        }
      }))
    }))
  } catch (error) {
    console.error('Error fetching room bookings:', error)
    return []
  }
})

/**
 * 캐시된 사용자의 모든 예약 조회
 */
export const getUserBookings = cache(async (
  userId: string, 
  startDate?: Date, 
  endDate?: Date
): Promise<BookingResponse[]> => {
  try {
    // 기본적으로 이번 주 예약만 조회
    const now = new Date()
    const fallbackStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const baseStart = startDate ? new Date(startDate) : fallbackStart
    const baseEnd = endDate ? new Date(endDate) : new Date(baseStart.getTime() + 6 * DAY_IN_MS)

    const normalizedStart = setToKSTStartOfDay(baseStart)
    const normalizedEnd = setToKSTEndOfDay(baseEnd)

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: normalizedStart,
          lte: normalizedEnd
        },
        room: {
          group: {
            members: {
              some: {
                userId: userId
              }
            }
          }
        }
      },
      include: {
        room: true,
        creator: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                emailVerified: true,
                name: true,
                image: true,
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

    return bookings.map(booking => ({
      ...booking,
      date: toKSTDateString(booking.date),
      creator: {
        ...booking.creator,
        isAdmin: false // 기본값 설정
      },
      participants: booking.participants.map(p => ({
        ...p,
        user: {
          ...p.user,
          isAdmin: false // 기본값 설정
        }
      }))
    }))
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }
})

/**
 * 캐시된 사용자 접근 가능한 회의실 목록 조회
 */
export const getUserRooms = cache(async (userId: string): Promise<MeetingRoomWithGroup[]> => {
  try {
    const rooms = await prisma.meetingRoom.findMany({
      where: {
        group: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        group: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return rooms
  } catch (error) {
    console.error('Error fetching user rooms:', error)
    return []
  }
})

/**
 * 특정 날짜 범위의 예약 데이터 조회 (날짜 범위 지정)
 */
export const getBookingsForDateRange = cache(async (
  userId: string,
  startDate: Date,
  endDate: Date,
  roomId?: string
): Promise<BookingResponse[]> => {
  try {
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate
      },
      room: {
        group: {
          members: {
            some: {
              userId: userId
            }
          }
        }
      }
    }

    if (roomId) {
      whereClause.roomId = roomId
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        room: true,
        creator: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                emailVerified: true,
                name: true,
                image: true,
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

    return bookings.map(booking => ({
      ...booking,
      date: toKSTDateString(booking.date),
      creator: {
        ...booking.creator,
        isAdmin: false // 기본값 설정
      },
      participants: booking.participants.map(p => ({
        ...p,
        user: {
          ...p.user,
          isAdmin: false // 기본값 설정
        }
      }))
    }))
  } catch (error) {
    console.error('Error fetching bookings for date range:', error)
    return []
  }
})