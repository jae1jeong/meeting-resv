import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  parseKSTDate,
  toKSTDateString,
  setToKSTStartOfDay,
  setToKSTEndOfDay
} from '@/packages/shared/utils/date-utils'

// Mock Prisma
jest.mock('@/packages/backend/lib/prisma', () => ({
  prisma: {
    booking: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    },
    meetingRoom: {
      findFirst: jest.fn()
    },
    bookingParticipant: {
      deleteMany: jest.fn()
    }
  }
}))

// Mock better-auth
jest.mock('@/packages/backend/auth/better-auth', () => ({
  getSession: jest.fn(),
  getCurrentUser: jest.fn()
}))

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

describe('날짜 유틸리티 함수 테스트', () => {
  describe('parseKSTDate', () => {
    it('YYYY-MM-DD 형식의 문자열을 올바른 Date 객체로 변환해야 함', () => {
      const dateStr = '2025-09-12'
      const result = parseKSTDate(dateStr)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(8) // 0-based (9월 = 8)
      expect(result.getDate()).toBe(12)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
    })

    it('날짜가 하루 전으로 밀리지 않아야 함', () => {
      const dateStr = '2025-09-12'
      const result = parseKSTDate(dateStr)
      const resultStr = toKSTDateString(result)

      expect(resultStr).toBe(dateStr)
    })
  })

  describe('toKSTDateString', () => {
    it('Date 객체를 YYYY-MM-DD 형식으로 변환해야 함', () => {
      const date = new Date(2025, 8, 12) // 2025년 9월 12일
      const result = toKSTDateString(date)

      expect(result).toBe('2025-09-12')
    })

    it('자정 시간도 올바르게 처리해야 함', () => {
      const date = new Date(2025, 8, 12, 0, 0, 0)
      const result = toKSTDateString(date)

      expect(result).toBe('2025-09-12')
    })
  })

  describe('setToKSTStartOfDay', () => {
    it('시간을 00:00:00으로 설정해야 함', () => {
      const date = new Date(2025, 8, 12, 15, 30, 45)
      const result = setToKSTStartOfDay(date)

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(12) // 날짜는 변경되지 않아야 함
    })
  })

  describe('setToKSTEndOfDay', () => {
    it('시간을 23:59:59.999로 설정해야 함', () => {
      const date = new Date(2025, 8, 12, 15, 30, 45)
      const result = setToKSTEndOfDay(date)

      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
      expect(result.getDate()).toBe(12) // 날짜는 변경되지 않아야 함
    })
  })
})

describe('예약 생성 시 날짜 처리 테스트', () => {
  const { prisma } = require('@/packages/backend/lib/prisma')
  const { getSession } = require('@/packages/backend/auth/better-auth')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('예약 생성 시 정확한 날짜가 저장되어야 함', async () => {
    // Mock 설정
    getSession.mockResolvedValue({
      user: { id: 'user123', name: 'Test User' }
    })

    prisma.meetingRoom.findFirst.mockResolvedValue({
      id: 'room123',
      name: 'Test Room',
      group: { id: 'group123' }
    })

    prisma.booking.findMany.mockResolvedValue([]) // 충돌 없음

    const mockCreatedBooking = {
      id: 'booking123',
      title: 'Test Meeting',
      date: new Date(2025, 8, 12, 0, 0, 0), // 9월 12일
      startTime: '14:00',
      endTime: '15:00',
      roomId: 'room123',
      creatorId: 'user123',
      color: '#3B82F6'
    }

    prisma.booking.create.mockResolvedValue({
      ...mockCreatedBooking,
      room: { id: 'room123', name: 'Test Room', group: { id: 'group123' } },
      creator: { id: 'user123', name: 'Test User', email: 'test@test.com' },
      participants: []
    })

    // createBookingAction import
    const { createBookingAction } = await import('@/packages/backend/actions/booking-actions')

    const requestData = {
      title: 'Test Meeting',
      description: 'Test Description',
      date: '2025-09-12', // 9월 12일 요청
      startTime: '14:00',
      endTime: '15:00',
      roomId: 'room123',
      participantIds: []
    }

    const result = await createBookingAction(requestData)

    // 검증
    expect(result.success).toBe(true)
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: expect.any(Date)
        })
      })
    )

    // 저장된 날짜 확인
    const savedDate = prisma.booking.create.mock.calls[0][0].data.date
    expect(savedDate.getFullYear()).toBe(2025)
    expect(savedDate.getMonth()).toBe(8) // 9월
    expect(savedDate.getDate()).toBe(12) // 12일 (11일이 아님!)
  })
})

describe('예약 변경 시 날짜 처리 테스트', () => {
  const { prisma } = require('@/packages/backend/lib/prisma')
  const { getSession } = require('@/packages/backend/auth/better-auth')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('드래그앤드롭으로 예약 이동 시 정확한 날짜가 저장되어야 함', async () => {
    // Mock 설정
    getSession.mockResolvedValue({
      user: { id: 'user123', name: 'Test User' }
    })

    const existingBooking = {
      id: 'booking123',
      title: 'Test Meeting',
      date: new Date(2025, 8, 10, 0, 0, 0), // 원래 9월 10일
      startTime: '14:00',
      endTime: '15:00',
      roomId: 'room123',
      creatorId: 'user123',
      room: { id: 'room123', name: 'Test Room', group: { id: 'group123' } },
      creator: { id: 'user123', name: 'Test User' },
      participants: []
    }

    prisma.booking.findFirst.mockResolvedValue(existingBooking)
    prisma.booking.findMany.mockResolvedValue([]) // 충돌 없음

    const updatedBooking = {
      ...existingBooking,
      date: new Date(2025, 8, 12, 0, 0, 0) // 9월 12일로 변경
    }

    prisma.booking.update.mockResolvedValue(updatedBooking)

    // updateBookingTimeAction import
    const { updateBookingTimeAction } = await import('@/packages/backend/actions/booking-dnd-actions')

    const request = {
      bookingId: 'booking123',
      newDate: '2025-09-12', // 9월 12일로 이동
      newStartTime: '14:00',
      newEndTime: '15:00'
    }

    const result = await updateBookingTimeAction(request)

    // 검증
    expect(result.success).toBe(true)
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: expect.any(Date)
        })
      })
    )

    // 업데이트된 날짜 확인
    const savedDate = prisma.booking.update.mock.calls[0][0].data.date
    expect(savedDate.getFullYear()).toBe(2025)
    expect(savedDate.getMonth()).toBe(8) // 9월
    expect(savedDate.getDate()).toBe(12) // 12일 (11일이 아님!)
  })
})

describe('날짜 중복 처리 문제 테스트', () => {
  it('parseKSTDate와 setToKSTStartOfDay 중복 사용 시 문제 확인', () => {
    const dateStr = '2025-09-12'

    // parseKSTDate만 사용
    const parsed = parseKSTDate(dateStr)
    expect(parsed.getDate()).toBe(12)
    expect(parsed.getHours()).toBe(0)

    // setToKSTStartOfDay 추가 적용 (중복)
    const doubleProcessed = setToKSTStartOfDay(parsed)
    expect(doubleProcessed.getDate()).toBe(12) // 날짜가 변경되지 않아야 함
    expect(doubleProcessed.getHours()).toBe(0)

    // 두 결과가 동일해야 함
    expect(parsed.getTime()).toBe(doubleProcessed.getTime())
  })

  it('ISO 문자열 변환 시 UTC 문제 확인', () => {
    const dateStr = '2025-09-12'
    const parsed = parseKSTDate(dateStr)

    // toISOString은 UTC로 변환하므로 사용하면 안 됨
    const isoString = parsed.toISOString()
    const isoDate = new Date(isoString)

    // KST와 UTC의 차이로 인해 날짜가 다를 수 있음
    // toKSTDateString을 사용해야 함
    const kstString = toKSTDateString(parsed)
    expect(kstString).toBe(dateStr)
  })
})