import { CalendarEvent } from '../../types'

export interface CalendarEventProps {
  event: CalendarEvent
  onClick: (event: CalendarEvent) => void
  variant?: 'default' | 'compact' | 'detailed'
}