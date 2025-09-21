import { describe, it, expect, jest } from '@jest/globals'
import { toKSTDateString, parseKSTDate, isSameDay } from '@/packages/shared/utils/date-utils'

describe('DnD 날짜 처리 테스트', () => {
  describe('날짜 변환 흐름 테스트', () => {
    it('백엔드에서 문자열로 반환된 날짜가 올바르게 파싱되어야 함', () => {
      // 백엔드에서 반환된 날짜 문자열 (toKSTDateString 사용)
      const backendDateString = '2025-09-12'

      // 프론트엔드에서 파싱
      const parsedDate = parseKSTDate(backendDateString)

      expect(parsedDate.getFullYear()).toBe(2025)
      expect(parsedDate.getMonth()).toBe(8) // 9월 (0-based)
      expect(parsedDate.getDate()).toBe(12)
    })

    it('DnD로 날짜 이동 시 올바른 날짜가 계산되어야 함', () => {
      // 주간 날짜 생성 (2025년 9월 7일 주)
      const currentDate = new Date(2025, 8, 10) // 9월 10일 (수요일)
      const weekDates = getWeekDates(currentDate)

      // 금요일로 이동 (인덱스 5)
      const fridayIndex = 5
      const fridayDate = weekDates[fridayIndex]

      // 날짜 문자열로 변환 (백엔드로 전송)
      const dateString = toKSTDateString(fridayDate)

      expect(dateString).toBe('2025-09-12') // 금요일은 12일
    })

    it('새로고침 후 날짜가 유지되어야 함', () => {
      // 1. 원본 예약 데이터
      const originalBooking = {
        id: 'booking123',
        date: new Date(2025, 8, 10), // 9월 10일
        title: 'Test Meeting'
      }

      // 2. DnD로 12일로 이동
      const newDate = new Date(2025, 8, 12) // 9월 12일
      const newDateString = toKSTDateString(newDate)

      // 3. 백엔드에서 업데이트 후 반환 (문자열로)
      const updatedBookingFromBackend = {
        id: 'booking123',
        date: newDateString, // '2025-09-12'
        title: 'Test Meeting'
      }

      // 4. 프론트엔드에서 다시 파싱
      const parsedDate = parseKSTDate(updatedBookingFromBackend.date)

      // 5. 올바른 날짜인지 확인
      expect(parsedDate.getDate()).toBe(12)
      expect(toKSTDateString(parsedDate)).toBe('2025-09-12')
    })
  })

  describe('날짜 비교 로직 테스트', () => {
    it('isSameDay 함수가 올바르게 작동해야 함', () => {
      const date1 = new Date(2025, 8, 12, 10, 30) // 9월 12일 10:30
      const date2 = new Date(2025, 8, 12, 15, 45) // 9월 12일 15:45
      const date3 = new Date(2025, 8, 13, 10, 30) // 9월 13일 10:30

      expect(isSameDay(date1, date2)).toBe(true) // 같은 날
      expect(isSameDay(date1, date3)).toBe(false) // 다른 날
    })

    it('주간 날짜 배열에서 올바른 인덱스를 찾아야 함', () => {
      const currentDate = new Date(2025, 8, 10) // 9월 10일
      const weekDates = getWeekDates(currentDate)

      // 12일 (금요일) 예약
      const bookingDateString = '2025-09-12'
      const bookingDate = parseKSTDate(bookingDateString)

      // 인덱스 찾기
      const dayIndex = weekDates.findIndex(date =>
        isSameDay(date, bookingDate)
      )

      expect(dayIndex).toBe(5) // 금요일은 인덱스 5 (0-based)
    })
  })

  describe('타입 체크 테스트', () => {
    it('날짜가 문자열인지 Date 객체인지 확인하고 적절히 처리해야 함', () => {
      // 문자열인 경우
      const dateString = '2025-09-12'
      const parsedFromString = typeof dateString === 'string'
        ? parseKSTDate(dateString)
        : new Date(dateString)

      expect(parsedFromString.getDate()).toBe(12)

      // Date 객체인 경우 (레거시 코드 호환성)
      const dateObject = new Date(2025, 8, 12)
      const parsedFromObject = typeof dateObject === 'string'
        ? parseKSTDate(dateObject)
        : dateObject

      expect(parsedFromObject.getDate()).toBe(12)
    })
  })

  describe('전체 DnD 시나리오 테스트', () => {
    it('DnD 전체 과정에서 날짜가 올바르게 처리되어야 함', () => {
      // 1. 초기 상태: 10일 예약
      const initialBooking = {
        date: '2025-09-10',
        title: 'Meeting',
        day: 3 // 수요일 (1-based)
      }

      // 2. 12일(금요일)로 DnD
      const targetDayIndex = 5 // 금요일 (0-based)
      const currentDate = new Date(2025, 8, 10)
      const weekDates = getWeekDates(currentDate)
      const newDate = weekDates[targetDayIndex]
      const newDateString = toKSTDateString(newDate)

      // 3. 백엔드로 전송할 데이터
      const updateRequest = {
        bookingId: 'booking123',
        newDate: newDateString, // '2025-09-12'
        newStartTime: '14:00',
        newEndTime: '15:00'
      }

      expect(updateRequest.newDate).toBe('2025-09-12')

      // 4. 백엔드에서 업데이트 후 반환
      const updatedBooking = {
        date: newDateString, // '2025-09-12'
        title: 'Meeting',
        day: 6 // 금요일 (1-based)
      }

      // 5. 프론트엔드에서 재렌더링
      const parsedDate = parseKSTDate(updatedBooking.date)
      const displayDate = parsedDate.getDate()

      expect(displayDate).toBe(12)
      expect(updatedBooking.day).toBe(6) // 금요일
    })
  })
})

// 헬퍼 함수 (calendar-container.tsx에서 사용하는 것과 동일)
function getWeekDates(currentDate: Date) {
  const start = new Date(currentDate)
  const day = start.getDay() // 0 = 일요일
  start.setDate(start.getDate() - day) // 주의 시작 (일요일)

  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date)
  }
  return dates
}