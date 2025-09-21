import type { BookingResponse } from '@/packages/shared/types/responses'

export interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
  bookingData?: BookingResponse // 원본 예약 데이터 (API 연동 시 사용)
}

export interface Calendar {
  id: string
  name: string
  color: string
  isActive: boolean
}

export interface CalendarState {
  currentMonth: string
  currentDate: string
  selectedDate: Date | null
  events: CalendarEvent[]
  isLoading: boolean
}