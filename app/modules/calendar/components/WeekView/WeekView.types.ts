import { CalendarEvent } from '../../types'

export interface WeekViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  currentDate: Date
  isLoaded?: boolean
}

export interface WeekDay {
  date: number
  dayName: string
  isToday: boolean
  isWeekend: boolean
}