export interface Booking {
  id: string
  roomId: string
  createdById: string
  title: string
  description?: string
  startDateTime: Date
  endDateTime: Date
  recurringPatternId?: string
  participants: BookingParticipant[]
  createdAt: Date
  updatedAt: Date
}

export interface BookingParticipant {
  id: string
  bookingId: string
  userId: string
  status: ParticipantStatus
  createdAt: Date
}

export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative'

export interface CreateBookingDto {
  roomId: string
  title: string
  description?: string
  startDateTime: Date
  endDateTime: Date
  participantIds?: string[]
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {
  id: string
}