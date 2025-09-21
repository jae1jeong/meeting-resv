import { describe, it, expect } from '@jest/globals'
import { getWeekDates, toKSTDateString, parseKSTDate } from '@/packages/shared/utils/date-utils'

describe('경계 날짜 테스트', () => {
  describe('월말/월초 경계 테스트', () => {
    it('9월 마지막 주의 날짜가 올바르게 계산되어야 함', () => {
      // 2025년 9월 28일 (일요일) - 9월 마지막 주
      const currentDate = new Date(2025, 8, 30) // 9월 30일 (화요일)
      const weekDates = getWeekDates(currentDate)

      expect(weekDates[0].getDate()).toBe(28) // 일요일 - 9월 28일
      expect(weekDates[0].getMonth()).toBe(8)  // 9월 (0-based)

      expect(weekDates[1].getDate()).toBe(29) // 월요일 - 9월 29일
      expect(weekDates[1].getMonth()).toBe(8)

      expect(weekDates[2].getDate()).toBe(30) // 화요일 - 9월 30일
      expect(weekDates[2].getMonth()).toBe(8)

      expect(weekDates[3].getDate()).toBe(1)  // 수요일 - 10월 1일
      expect(weekDates[3].getMonth()).toBe(9)  // 10월 (0-based)

      expect(weekDates[4].getDate()).toBe(2)  // 목요일 - 10월 2일
      expect(weekDates[4].getMonth()).toBe(9)

      expect(weekDates[5].getDate()).toBe(3)  // 금요일 - 10월 3일
      expect(weekDates[5].getMonth()).toBe(9)

      expect(weekDates[6].getDate()).toBe(4)  // 토요일 - 10월 4일
      expect(weekDates[6].getMonth()).toBe(9)
    })

    it('월말에서 다음 달로 DnD 시 올바른 날짜가 계산되어야 함', () => {
      const currentDate = new Date(2025, 8, 30) // 9월 30일
      const weekDates = getWeekDates(currentDate)

      // 10월 3일(금요일, 인덱스 5)로 드래그
      const newDayIndex = 5
      const newDate = weekDates[newDayIndex]
      const newDateStr = toKSTDateString(newDate)

      expect(newDateStr).toBe('2025-10-03')
      expect(newDate.getMonth()).toBe(9) // 10월 (0-based)
      expect(newDate.getDate()).toBe(3)
    })
  })

  describe('연말/연초 경계 테스트', () => {
    it('12월 마지막 주의 날짜가 올바르게 계산되어야 함', () => {
      // 2025년 12월 28일 (일요일) - 연말 주
      const currentDate = new Date(2025, 11, 31) // 12월 31일 (수요일)
      const weekDates = getWeekDates(currentDate)

      expect(weekDates[0].getDate()).toBe(28) // 일요일 - 12월 28일
      expect(weekDates[0].getMonth()).toBe(11) // 12월 (0-based)
      expect(weekDates[0].getFullYear()).toBe(2025)

      expect(weekDates[3].getDate()).toBe(31) // 수요일 - 12월 31일
      expect(weekDates[3].getMonth()).toBe(11)
      expect(weekDates[3].getFullYear()).toBe(2025)

      expect(weekDates[4].getDate()).toBe(1)  // 목요일 - 1월 1일
      expect(weekDates[4].getMonth()).toBe(0)  // 1월 (0-based)
      expect(weekDates[4].getFullYear()).toBe(2026)

      expect(weekDates[5].getDate()).toBe(2)  // 금요일 - 1월 2일
      expect(weekDates[5].getMonth()).toBe(0)
      expect(weekDates[5].getFullYear()).toBe(2026)
    })

    it('연말에서 다음 해로 DnD 시 올바른 날짜가 계산되어야 함', () => {
      const currentDate = new Date(2025, 11, 31) // 12월 31일
      const weekDates = getWeekDates(currentDate)

      // 1월 2일(금요일, 인덱스 5)로 드래그
      const newDayIndex = 5
      const newDate = weekDates[newDayIndex]
      const newDateStr = toKSTDateString(newDate)

      expect(newDateStr).toBe('2026-01-02')
      expect(newDate.getFullYear()).toBe(2026)
      expect(newDate.getMonth()).toBe(0) // 1월
      expect(newDate.getDate()).toBe(2)
    })
  })

  describe('윤년 테스트', () => {
    it('윤년 2월 마지막 주의 날짜가 올바르게 계산되어야 함', () => {
      // 2024년은 윤년 (2월 29일 존재)
      const currentDate = new Date(2024, 1, 28) // 2월 28일 (수요일)
      const weekDates = getWeekDates(currentDate)

      expect(weekDates[0].getDate()).toBe(25) // 일요일 - 2월 25일
      expect(weekDates[0].getMonth()).toBe(1)  // 2월

      expect(weekDates[3].getDate()).toBe(28) // 수요일 - 2월 28일
      expect(weekDates[3].getMonth()).toBe(1)

      expect(weekDates[4].getDate()).toBe(29) // 목요일 - 2월 29일 (윤년)
      expect(weekDates[4].getMonth()).toBe(1)

      expect(weekDates[5].getDate()).toBe(1)  // 금요일 - 3월 1일
      expect(weekDates[5].getMonth()).toBe(2)  // 3월
    })

    it('평년 2월 마지막 주의 날짜가 올바르게 계산되어야 함', () => {
      // 2025년은 평년 (2월 28일까지)
      const currentDate = new Date(2025, 1, 28) // 2월 28일 (금요일)
      const weekDates = getWeekDates(currentDate)

      expect(weekDates[0].getDate()).toBe(23) // 일요일 - 2월 23일
      expect(weekDates[0].getMonth()).toBe(1)  // 2월

      expect(weekDates[5].getDate()).toBe(28) // 금요일 - 2월 28일
      expect(weekDates[5].getMonth()).toBe(1)

      expect(weekDates[6].getDate()).toBe(1)  // 토요일 - 3월 1일
      expect(weekDates[6].getMonth()).toBe(2)  // 3월
    })
  })

  describe('DnD 시나리오 통합 테스트', () => {
    it('다양한 날짜에서 DnD가 올바르게 작동해야 함', () => {
      const testCases = [
        {
          current: new Date(2025, 8, 10),  // 9월 10일
          dragToIndex: 5,                  // 금요일
          expected: '2025-09-12'
        },
        {
          current: new Date(2025, 8, 30),  // 9월 30일
          dragToIndex: 5,                  // 금요일 (10월 3일)
          expected: '2025-10-03'
        },
        {
          current: new Date(2025, 11, 31), // 12월 31일
          dragToIndex: 5,                  // 금요일 (1월 2일)
          expected: '2026-01-02'
        },
        {
          current: new Date(2024, 1, 28),  // 윤년 2월 28일
          dragToIndex: 5,                  // 금요일 (3월 1일)
          expected: '2024-03-01'
        }
      ]

      testCases.forEach(({ current, dragToIndex, expected }) => {
        const weekDates = getWeekDates(current)
        const newDate = weekDates[dragToIndex]
        const newDateStr = toKSTDateString(newDate)

        expect(newDateStr).toBe(expected)

        // 왕복 변환 테스트
        const parsed = parseKSTDate(newDateStr)
        const roundTrip = toKSTDateString(parsed)
        expect(roundTrip).toBe(expected)
      })
    })
  })
})