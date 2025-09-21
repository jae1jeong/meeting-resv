import { CalendarEvent } from '../../types'

export interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onEmptySlotClick?: (day: number, timeSlot: string) => void
  onEventDragEnd?: (event: CalendarEvent, newDay: number, newTimeSlot: string) => void
  currentDate: Date
  isLoaded?: boolean
  isDragEnabled?: boolean
}

export interface WeekDay {
  date: number
  dayName: string
  isToday: boolean
  isWeekend: boolean
}