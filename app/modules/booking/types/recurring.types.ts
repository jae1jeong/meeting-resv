export interface RecurringPattern {
  id: string
  createdById: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  startTime: string // "10:00" format
  endTime: string   // "11:00" format
  daysOfWeek: number[] // 0-6, where 0 is Sunday
  intervalWeeks: number // 1 = every week, 2 = bi-weekly, etc.
  exceptions: BookingException[]
  createdAt: Date
  updatedAt: Date
}

export interface BookingException {
  id: string
  recurringPatternId: string
  date: Date
  action: ExceptionAction
  modifiedBookingId?: string
  createdAt: Date
}

export type ExceptionAction = 'SKIP' | 'MODIFY'

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface RecurrenceConfig {
  type: RecurrenceType
  interval: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  monthOfYear?: number
  endCondition: {
    type: 'never' | 'date' | 'occurrences'
    date?: Date
    occurrences?: number
  }
}