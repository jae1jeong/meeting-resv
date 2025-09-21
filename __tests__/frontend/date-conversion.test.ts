import { describe, it, expect } from '@jest/globals'
import { toKSTDateString, parseKSTDate } from '@/packages/shared/utils/date-utils'

describe('프론트엔드 날짜 변환 테스트', () => {
  describe('toISOString vs toKSTDateString 비교', () => {
    it('KST 자정 시간이 UTC로 변환되어 하루 전으로 표시되는 문제 확인', () => {
      // KST 2025년 9월 12일 00:00:00
      const kstDate = new Date(2025, 8, 12, 0, 0, 0)

      // toISOString 사용 (문제가 되는 방식)
      const isoString = kstDate.toISOString() // UTC로 변환됨
      const isoDateOnly = isoString.split('T')[0]

      // toKSTDateString 사용 (올바른 방식)
      const kstString = toKSTDateString(kstDate)

      console.log('KST Date:', kstDate)
      console.log('ISO String:', isoString)
      console.log('ISO Date Only:', isoDateOnly)
      console.log('KST String:', kstString)

      // KST 시간대에 따라 결과가 다를 수 있음
      // UTC+9에서는 9시간 차이로 인해 날짜가 하루 전으로 될 수 있음
      expect(kstString).toBe('2025-09-12')

      // toISOString은 UTC로 변환하므로 다른 결과가 나올 수 있음
      // 한국에서 실행 시 isoDateOnly는 '2025-09-11'이 될 수 있음
    })

    it('오후 시간대는 toISOString도 정상 작동', () => {
      // KST 2025년 9월 12일 15:00:00 (오후 3시)
      const kstDate = new Date(2025, 8, 12, 15, 0, 0)

      const isoDateOnly = kstDate.toISOString().split('T')[0]
      const kstString = toKSTDateString(kstDate)

      // 오후 시간은 UTC 변환 후에도 같은 날짜
      expect(kstString).toBe('2025-09-12')
      // ISO는 UTC이므로 여전히 12일
      expect(isoDateOnly).toBe('2025-09-12')
    })
  })

  describe('UI 날짜 선택 시나리오', () => {
    it('캘린더에서 12일 클릭 시 12일로 저장되어야 함', () => {
      // UI에서 2025년 9월 12일 선택
      const selectedDate = new Date(2025, 8, 12)

      // 잘못된 방식: toISOString 사용
      const wrongWay = selectedDate.toISOString().split('T')[0]

      // 올바른 방식: toKSTDateString 사용
      const rightWay = toKSTDateString(selectedDate)

      // 올바른 방식은 항상 12일
      expect(rightWay).toBe('2025-09-12')

      // 잘못된 방식은 시간대에 따라 11일이 될 수 있음
      console.log('Wrong way (toISOString):', wrongWay)
      console.log('Right way (toKSTDateString):', rightWay)
    })

    it('getWeekDates로 생성된 날짜가 올바르게 변환되어야 함', () => {
      // 주간 날짜 배열 시뮬레이션
      const weekDates = [
        new Date(2025, 8, 7),   // 일요일
        new Date(2025, 8, 8),   // 월요일
        new Date(2025, 8, 9),   // 화요일
        new Date(2025, 8, 10),  // 수요일
        new Date(2025, 8, 11),  // 목요일
        new Date(2025, 8, 12),  // 금요일
        new Date(2025, 8, 13),  // 토요일
      ]

      // 금요일 선택 (인덱스 5)
      const fridayDate = weekDates[5]

      // 변환
      const dateString = toKSTDateString(fridayDate)

      expect(dateString).toBe('2025-09-12')
    })
  })

  describe('백엔드로 전송 시 날짜 처리', () => {
    it('parseKSTDate로 다시 파싱해도 같은 날짜여야 함', () => {
      const originalDate = new Date(2025, 8, 12)
      const dateString = toKSTDateString(originalDate)
      const parsedDate = parseKSTDate(dateString)

      expect(parsedDate.getFullYear()).toBe(2025)
      expect(parsedDate.getMonth()).toBe(8)
      expect(parsedDate.getDate()).toBe(12)
      expect(parsedDate.getHours()).toBe(0)
      expect(parsedDate.getMinutes()).toBe(0)
    })

    it('왕복 변환 테스트', () => {
      // UI → String → Backend → String → UI
      const uiDate = new Date(2025, 8, 12, 14, 30) // UI에서 선택한 날짜
      const toBackend = toKSTDateString(uiDate) // "2025-09-12"
      const backendDate = parseKSTDate(toBackend) // 백엔드에서 파싱
      const toFrontend = toKSTDateString(backendDate) // 다시 문자열로

      expect(toBackend).toBe('2025-09-12')
      expect(toFrontend).toBe('2025-09-12')
      expect(toBackend).toBe(toFrontend)
    })
  })
})