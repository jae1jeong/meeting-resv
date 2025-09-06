import { Booking, BookingParticipant, RecurringPattern, RecurringException, MeetingRoom, RecurringType, ExceptionType } from '@prisma/client'
import { UserResponse } from './user'
import { MeetingRoomWithGroup } from './room'

export interface BookingResponse extends Booking {
  room: MeetingRoom
  creator: UserResponse
  participants?: BookingParticipantWithUser[]
  recurringPattern?: RecurringPatternWithExceptions
}

export interface BookingParticipantWithUser extends BookingParticipant {
  user: UserResponse
}

export interface RecurringPatternWithExceptions extends RecurringPattern {
  exceptions?: RecurringException[]
}

export interface BookingWithDetails extends Booking {
  room: MeetingRoomWithGroup
  creator: UserResponse
  participants: BookingParticipantWithUser[]
  recurringPattern?: RecurringPatternWithExceptions
}

export interface CreateBookingRequest {
  title: string
  description?: string
  roomId: string
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  participantIds?: string[]
  recurringPattern?: CreateRecurringPatternRequest
}

export interface CreateRecurringPatternRequest {
  type: RecurringType
  interval?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
  endDate?: string // ISO date string
  occurrences?: number
}

export interface UpdateBookingRequest {
  title?: string
  description?: string
  date?: string
  startTime?: string
  endTime?: string
  participantIds?: string[]
}

export interface CreateRecurringExceptionRequest {
  date: string // ISO date string
  type: ExceptionType
  newStartTime?: string
  newEndTime?: string
  reason?: string
}

export interface BookingQueryParams {
  page?: number
  pageSize?: number
  roomId?: string
  groupId?: string
  startDate?: string
  endDate?: string
  includeParticipants?: boolean
  includeRecurring?: boolean
}