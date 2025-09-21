/**
 * 예약 색상 관련 유틸리티
 */

export const BOOKING_COLORS = [
  'bg-blue-500',
  'bg-green-500', 
  'bg-purple-500',
  'bg-pink-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-cyan-500'
] as const

export type BookingColor = typeof BOOKING_COLORS[number]

/**
 * 사용자의 기존 예약 색상과 겹치지 않는 색상을 할당
 * @param existingColors 이미 사용 중인 색상 배열
 * @returns 새로운 색상
 */
export function assignBookingColor(existingColors: string[] = []): BookingColor {
  // 사용되지 않은 색상 찾기
  const availableColors = BOOKING_COLORS.filter(color => !existingColors.includes(color))
  
  // 사용되지 않은 색상이 있으면 랜덤 선택
  if (availableColors.length > 0) {
    return availableColors[Math.floor(Math.random() * availableColors.length)]
  }
  
  // 모든 색상이 사용 중이면 랜덤 선택
  return BOOKING_COLORS[Math.floor(Math.random() * BOOKING_COLORS.length)]
}

/**
 * 색상 이름에서 실제 색상값 매핑
 */
export const COLOR_MAP: Record<BookingColor, string> = {
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#10B981',
  'bg-purple-500': '#8B5CF6',
  'bg-pink-500': '#EC4899',
  'bg-yellow-500': '#F59E0B',
  'bg-orange-500': '#F97316',
  'bg-indigo-500': '#6366F1',
  'bg-red-500': '#EF4444',
  'bg-teal-500': '#14B8A6',
  'bg-cyan-500': '#06B6D4'
}