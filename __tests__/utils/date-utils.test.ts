import { describe, it, expect } from '@jest/globals'
import {
  getWeekRange,
  getWeekDates,
  toKSTDateString,
  parseKSTDate,
  isSameDay,
  formatDateForURL,
  setToKSTStartOfDay,
  setToKSTEndOfDay
} from '@/packages/shared/utils/date-utils'

describe('date-utils 테스트', () => {
  describe('getWeekRange', () => {
    it('주의 시작(일요일)과 끝(토요일)을 올바르게 계산해야 함', () => {
      // 2025년 9월 10일 (수요일)
      const date = new Date(2025, 8, 10)
      const { start, end } = getWeekRange(date)

      // 시작: 9월 7일 일요일 00:00:00
      expect(start.getDate()).toBe(7)
      expect(start.getDay()).toBe(0) // 일요일
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)

      // 끝: 9월 13일 토요일 23:59:59
      expect(end.getDate()).toBe(13)
      expect(end.getDay()).toBe(6) // 토요일
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
    })

    it('월경계를 넘는 주도 올바르게 처리해야 함', () => {
      // 2025년 9월 30일 (화요일)
      const date = new Date(2025, 8, 30)
      const { start, end } = getWeekRange(date)

      // 시작: 9월 28일 일요일
      expect(start.getDate()).toBe(28)
      expect(start.getMonth()).toBe(8) // 9월

      // 끝: 10월 4일 토요일
      expect(end.getDate()).toBe(4)
      expect(end.getMonth()).toBe(9) // 10월
    })
  })

  describe('getWeekDates', () => {
    it('일주일 7일의 날짜 배열을 반환해야 함', () => {
      const date = new Date(2025, 8, 10) // 9월 10일
      const weekDates = getWeekDates(date)

      expect(weekDates).toHaveLength(7)
      expect(weekDates[0].getDate()).toBe(7)  // 일요일
      expect(weekDates[1].getDate()).toBe(8)  // 월요일
      expect(weekDates[2].getDate()).toBe(9)  // 화요일
      expect(weekDates[3].getDate()).toBe(10) // 수요일
      expect(weekDates[4].getDate()).toBe(11) // 목요일
      expect(weekDates[5].getDate()).toBe(12) // 금요일
      expect(weekDates[6].getDate()).toBe(13) // 토요일
    })

    it('월경계를 넘는 주의 날짜도 올바르게 계산해야 함', () => {
      const date = new Date(2025, 8, 30) // 9월 30일
      const weekDates = getWeekDates(date)

      expect(weekDates[0].getDate()).toBe(28) // 9월 28일
      expect(weekDates[0].getMonth()).toBe(8)

      expect(weekDates[2].getDate()).toBe(30) // 9월 30일
      expect(weekDates[2].getMonth()).toBe(8)

      expect(weekDates[3].getDate()).toBe(1)  // 10월 1일
      expect(weekDates[3].getMonth()).toBe(9)

      expect(weekDates[6].getDate()).toBe(4)  // 10월 4일
      expect(weekDates[6].getMonth()).toBe(9)
    })

    it('연경계를 넘는 주의 날짜도 올바르게 계산해야 함', () => {
      const date = new Date(2025, 11, 31) // 12월 31일
      const weekDates = getWeekDates(date)

      expect(weekDates[0].getDate()).toBe(28) // 12월 28일
      expect(weekDates[0].getFullYear()).toBe(2025)

      expect(weekDates[3].getDate()).toBe(31) // 12월 31일
      expect(weekDates[3].getFullYear()).toBe(2025)

      expect(weekDates[4].getDate()).toBe(1)  // 1월 1일
      expect(weekDates[4].getFullYear()).toBe(2026)

      expect(weekDates[6].getDate()).toBe(3)  // 1월 3일
      expect(weekDates[6].getFullYear()).toBe(2026)
    })
  })

  describe('KST 날짜 변환 함수', () => {
    it('toKSTDateString이 올바른 형식으로 변환해야 함', () => {
      const date = new Date(2025, 8, 10) // 9월 10일
      const result = toKSTDateString(date)
      expect(result).toBe('2025-09-10')
    })

    it('parseKSTDate가 문자열을 올바르게 파싱해야 함', () => {
      const dateStr = '2025-09-10'
      const result = parseKSTDate(dateStr)

      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(8) // 9월 (0-based)
      expect(result.getDate()).toBe(10)
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })

    it('왕복 변환이 일관되어야 함', () => {
      const originalDate = new Date(2025, 8, 10, 15, 30) // 시간 포함
      const dateString = toKSTDateString(originalDate)
      const parsedDate = parseKSTDate(dateString)
      const roundTrip = toKSTDateString(parsedDate)

      expect(roundTrip).toBe(dateString)
      expect(roundTrip).toBe('2025-09-10')
    })
  })

  describe('isSameDay', () => {
    it('같은 날짜는 true를 반환해야 함', () => {
      const date1 = new Date(2025, 8, 10, 10, 30)
      const date2 = new Date(2025, 8, 10, 15, 45)

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('다른 날짜는 false를 반환해야 함', () => {
      const date1 = new Date(2025, 8, 10)
      const date2 = new Date(2025, 8, 11)

      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('다른 월의 같은 일자는 false를 반환해야 함', () => {
      const date1 = new Date(2025, 8, 10) // 9월 10일
      const date2 = new Date(2025, 9, 10) // 10월 10일

      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('formatDateForURL', () => {
    it('날짜를 URL 형식으로 변환해야 함', () => {
      const date = new Date(2025, 8, 5) // 9월 5일
      expect(formatDateForURL(date)).toBe('2025-09-05')
    })

    it('두 자리 월/일을 올바르게 처리해야 함', () => {
      const date = new Date(2025, 11, 25) // 12월 25일
      expect(formatDateForURL(date)).toBe('2025-12-25')
    })
  })

  describe('시간 설정 함수', () => {
    it('setToKSTStartOfDay가 00:00:00으로 설정해야 함', () => {
      const date = new Date(2025, 8, 10, 15, 30, 45)
      const result = setToKSTStartOfDay(date)

      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
      expect(result.getSeconds()).toBe(0)
      expect(result.getMilliseconds()).toBe(0)
      expect(result.getDate()).toBe(10) // 날짜는 유지
    })

    it('setToKSTEndOfDay가 23:59:59로 설정해야 함', () => {
      const date = new Date(2025, 8, 10, 10, 30, 45)
      const result = setToKSTEndOfDay(date)

      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
      expect(result.getSeconds()).toBe(59)
      expect(result.getMilliseconds()).toBe(999)
      expect(result.getDate()).toBe(10) // 날짜는 유지
    })
  })

  describe('엣지 케이스 테스트', () => {
    it('윤년 2월 29일을 올바르게 처리해야 함', () => {
      const leapDate = new Date(2024, 1, 29) // 2024년 2월 29일
      const dateStr = toKSTDateString(leapDate)
      expect(dateStr).toBe('2024-02-29')

      const parsed = parseKSTDate(dateStr)
      expect(parsed.getDate()).toBe(29)
      expect(parsed.getMonth()).toBe(1) // 2월
    })

    it('DST(일광절약시간) 전환 시에도 정확해야 함', () => {
      // 한국은 DST를 사용하지 않지만, 테스트는 포함
      const date = new Date(2025, 2, 9) // 3월 9일 (미국 DST 시작일 근처)
      const weekDates = getWeekDates(date)

      expect(weekDates).toHaveLength(7)
      // 날짜 계산이 시간대 변경에 영향받지 않아야 함
    })

    it('자정 경계의 날짜를 올바르게 처리해야 함', () => {
      const midnight = new Date(2025, 8, 10, 0, 0, 0, 0)
      const beforeMidnight = new Date(2025, 8, 9, 23, 59, 59, 999)

      expect(isSameDay(midnight, beforeMidnight)).toBe(false)
    })
  })
})