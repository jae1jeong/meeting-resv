import { MeetingRoom, Group } from '@prisma/client'
import { BookingResponse } from './booking'

export interface MeetingRoomWithGroup extends MeetingRoom {
  group: Group
}

export interface MeetingRoomWithBookings extends MeetingRoom {
  bookings: BookingResponse[]
  group: Group
}

export interface CreateMeetingRoomRequest {
  name: string
  capacity: number
  location?: string
  amenities?: string[]
  groupId: string
}

export interface UpdateMeetingRoomRequest {
  name?: string
  capacity?: number
  location?: string
  amenities?: string[]
}

export interface MeetingRoomQueryParams {
  page?: number
  pageSize?: number
  groupId?: string
  search?: string
  includeBookings?: boolean
}

// 페이지네이션된 회의실 목록 응답 타입
export interface PaginatedRoomResponse {
  items: MeetingRoomWithGroup[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type RoomListResponse = PaginatedRoomResponse