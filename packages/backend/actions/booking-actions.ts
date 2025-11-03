'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '../lib/prisma'
import { getSession } from '../auth/better-auth'
import { CreateBookingRequest, UpdateBookingRequest, BookingResponse } from '@/packages/shared/types/api/booking'
import { checkRoomAvailability, validateTimeSlot } from '@/packages/shared/utils/booking-utils'
import { assignBookingColor } from '@/packages/shared/utils/color-utils'
import { parseKSTDate, setToKSTStartOfDay, toKSTDateString } from '@/packages/shared/utils/date-utils'

export async function createBookingAction(data: CreateBookingRequest): Promise<{
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

    // 시간 슬롯 유효성 검증
    if (!validateTimeSlot(data.startTime, data.endTime)) {
      return {
        success: false,
        error: {
          code: 'INVALID_TIME_SLOT',
          message: '유효하지 않은 시간 슬롯입니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 회의실 접근 권한 확인
    const room = await prisma.meetingRoom.findFirst({
      where: {
        id: data.roomId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        group: true
      }
    })

    if (!room) {
      return {
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: '회의실을 찾을 수 없거나 접근 권한이 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 회의실 사용 가능 여부 확인
    const availability = await checkRoomAvailability(
      data.roomId,
      parseKSTDate(data.date),
      data.startTime,
      data.endTime
    )

    if (!availability) {
      return {
        success: false,
        error: {
          code: 'ROOM_NOT_AVAILABLE',
          message: '해당 시간에 회의실이 이미 예약되어 있습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 참석자 ID 배열 추출
    let participantIds: string[] = []
    if (data.participantIds && data.participantIds.length > 0) {
      participantIds = data.participantIds
    }

    // 사용자의 기존 예약 색상 조회
    const existingBookings = await prisma.booking.findMany({
      where: { creatorId: session.user.id },
      select: { color: true }
    })
    
    const existingColors = existingBookings.map(b => b.color)
    const assignedColor = assignBookingColor(existingColors)

    // 날짜 변환 로그
    console.log('📅 [CREATE] 예약 생성 날짜 처리:')
    console.log('  - 입력받은 날짜 문자열:', data.date)
    const parsedDate = parseKSTDate(data.date)
    console.log('  - parseKSTDate 결과:', parsedDate)
    console.log('  - ISO String:', parsedDate.toISOString())
    console.log('  - Local String:', parsedDate.toString())

    // 예약 생성
    const booking = await prisma.booking.create({
      data: {
        title: data.title,
        description: data.description,
        date: parsedDate, // KST 날짜로 파싱 (이미 00:00:00으로 설정됨)
        startTime: data.startTime,
        endTime: data.endTime,
        roomId: data.roomId,
        creatorId: session.user.id,
        color: assignedColor,
        participants: {
          create: participantIds.map(userId => ({
            userId
          }))
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
      }
    })

    // 태그 기반 재검증 (부분 업데이트만)
    revalidateTag(`room-${data.roomId}`)
    revalidateTag(`bookings-${data.roomId}`)

    // 반환 전 날짜 변환 로그
    console.log('📅 [CREATE] 생성된 예약 반환:')
    console.log('  - DB에서 조회한 date:', booking.date)
    console.log('  - DB date ISO:', booking.date.toISOString())
    console.log('  - toKSTDateString 결과:', toKSTDateString(booking.date))

    return {
      success: true,
      data: {
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
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('예약 생성 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '예약 생성 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}

export async function updateBookingAction(
  id: string, 
  data: UpdateBookingRequest
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

    // 기존 예약 조회 및 권한 확인
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { 
        room: true,
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
          message: '예약을 찾을 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    if (existingBooking.creatorId !== session.user.id) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '예약 생성자만 수정할 수 있습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 업데이트 데이터 준비
    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description

    // 날짜/시간 변경 처리
    if (data.date || data.startTime || data.endTime) {
      const newDate = data.date ? parseKSTDate(data.date) : existingBooking.date
      const newStartTime = data.startTime || existingBooking.startTime
      const newEndTime = data.endTime || existingBooking.endTime

      // 시간 슬롯 유효성 검증
      if (data.startTime || data.endTime) {
        if (!validateTimeSlot(newStartTime, newEndTime)) {
          return {
            success: false,
            error: {
              code: 'INVALID_TIME_SLOT',
              message: '유효하지 않은 시간 슬롯입니다'
            },
            timestamp: new Date().toISOString()
          }
        }
      }

      // 회의실 사용 가능 여부 확인 (날짜/시간이 변경된 경우)
      if (data.date || data.startTime || data.endTime) {
        const availability = await checkRoomAvailability(
          existingBooking.roomId,
          newDate,
          newStartTime,
          newEndTime,
          id
        )

        if (!availability) {
          return {
            success: false,
            error: {
              code: 'ROOM_NOT_AVAILABLE',
              message: '해당 시간에 회의실이 이미 예약되어 있습니다'
            },
            timestamp: new Date().toISOString()
          }
        }
      }

      if (data.date) {
        updateData.date = newDate // parseKSTDate가 이미 00:00:00으로 설정함
      }
      if (data.startTime) updateData.startTime = newStartTime
      if (data.endTime) updateData.endTime = newEndTime
    }

    // 참여자 업데이트 처리
    if (data.participantIds !== undefined) {
      // 기존 참여자 삭제 후 새로 추가
      await prisma.bookingParticipant.deleteMany({
        where: { bookingId: id }
      })

      if (data.participantIds.length > 0) {
        updateData.participants = {
          create: data.participantIds.map(userId => ({
            userId
          }))
        }
      }
    }

    // 예약 업데이트
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
      }
    })

    // 태그 기반 재검증 (부분 업데이트만)
    revalidateTag(`room-${existingBooking.roomId}`)
    revalidateTag(`bookings-${existingBooking.roomId}`)

    return {
      success: true,
      data: {
        id: updatedBooking.id,
        title: updatedBooking.title,
        description: updatedBooking.description,
        date: toKSTDateString(updatedBooking.date), // Date 객체를 KST 문자열로 변환
        startTime: updatedBooking.startTime,
        endTime: updatedBooking.endTime,
        roomId: updatedBooking.roomId,
        creatorId: updatedBooking.creatorId,
        isRecurring: updatedBooking.isRecurring,
        recurringId: updatedBooking.recurringId,
        color: updatedBooking.color,
        room: updatedBooking.room,
        creator: {
          id: updatedBooking.creator.id,
          name: updatedBooking.creator.name || '',
          email: updatedBooking.creator.email || '',
          emailVerified: updatedBooking.creator.emailVerified ?? false,
          image: updatedBooking.creator.image,
          isAdmin: updatedBooking.creator.isAdmin,
          createdAt: updatedBooking.creator.createdAt,
          updatedAt: updatedBooking.creator.updatedAt
        },
        participants: updatedBooking.participants.map(p => ({
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
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('예약 수정 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '예약 수정 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}

export async function removeBookingParticipantAction(
  bookingId: string, 
  userId: string
): Promise<{
  success: boolean
  data?: null
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

    // 예약이 존재하고 사용자가 생성자인지 확인
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        creatorId: session.user.id
      }
    })

    if (!booking) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '예약을 찾을 수 없거나 삭제 권한이 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 참여자가 존재하는지 확인
    const participant = await prisma.bookingParticipant.findUnique({
      where: {
        bookingId_userId: {
          bookingId: bookingId,
          userId: userId
        }
      }
    })

    if (!participant) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '참여자를 찾을 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 참여자 제거
    await prisma.bookingParticipant.delete({
      where: {
        bookingId_userId: {
          bookingId: bookingId,
          userId: userId
        }
      }
    })

    // 태그 기반 재검증 (부분 업데이트만)
    revalidateTag(`room-${booking.roomId}`)
    revalidateTag(`bookings-${booking.roomId}`)

    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('참여자 제거 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '참여자 제거 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}

export async function deleteBookingAction(id: string): Promise<{
  success: boolean
  data?: null
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

    // 기존 예약 조회 및 권한 확인
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true }
    })

    if (!existingBooking) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '예약을 찾을 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    if (existingBooking.creatorId !== session.user.id) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '예약 생성자만 삭제할 수 있습니다'
        },
        timestamp: new Date().toISOString()
      }
    }

    // 예약 삭제 (cascade로 participants도 함께 삭제됨)
    await prisma.booking.delete({
      where: { id }
    })

    // 태그 기반 재검증 (부분 업데이트만)
    revalidateTag(`room-${existingBooking.roomId}`)
    revalidateTag(`bookings-${existingBooking.roomId}`)

    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('예약 삭제 오류:', error)
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '예약 삭제 중 오류가 발생했습니다'
      },
      timestamp: new Date().toISOString()
    }
  }
}