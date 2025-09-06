export interface CalendarEvent {
  id: number
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
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