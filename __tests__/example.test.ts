import { describe, it, expect } from '@jest/globals'

// 간단한 유틸리티 함수 예제
function add(a: number, b: number): number {
  return a + b
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

describe('기본 유틸리티 함수 테스트', () => {
  describe('add 함수', () => {
    it('두 수를 더할 수 있어야 한다', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
      expect(add(0, 0)).toBe(0)
    })
  })

  describe('formatDate 함수', () => {
    it('날짜를 YYYY-MM-DD 형식으로 포맷할 수 있어야 한다', () => {
      const testDate = new Date('2025-03-15T10:30:00.000Z')
      expect(formatDate(testDate)).toBe('2025-03-15')
    })
  })
})