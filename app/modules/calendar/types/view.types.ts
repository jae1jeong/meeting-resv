export type CalendarViewType = 'day' | 'week' | 'month' | 'year'

export interface ViewConfig {
  type: CalendarViewType
  showWeekends: boolean
  showWeekNumbers: boolean
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
}

export interface TimeSlot {
  hour: number
  minute: number
  isAvailable: boolean
}

export interface DateRange {
  start: Date
  end: Date
}