/**
 * Shared response types for frontend and backend
 * These types ensure type safety across the application
 */

// Base response structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Auth responses
export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
  accessToken: string
  refreshToken: string
}

export interface SignupResponse {
  user: {
    id: string
    email: string
    name: string
  }
  message: string
}

// Group responses
export interface GroupResponse {
  id: string
  name: string
  description?: string
  memberCount: number
  roomCount: number
  role: 'ADMIN' | 'MEMBER'
  createdAt: string
  updatedAt: string
}

export type GroupListResponse = PaginatedResponse<GroupResponse>

// Room responses
export interface RoomResponse {
  id: string
  groupId: string
  name: string
  capacity?: number
  amenities?: string[]
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export type RoomListResponse = PaginatedResponse<RoomResponse>

// Booking responses - import from API types
import type { BookingResponse, BookingListResponse } from './api/booking'
export type { BookingResponse, BookingListResponse }

export interface BookingCreateResponse {
  booking: BookingResponse
  conflicts?: Array<{
    id: string
    title: string
    startDateTime: string
    endDateTime: string
  }>
}

// Calendar responses
export interface CalendarEventResponse {
  id: string
  title: string
  startTime: string
  endTime: string
  date: string
  roomId: string
  roomName: string
  color: string
  isEditable: boolean
  participants: number
}

export interface CalendarResponse {
  events: CalendarEventResponse[]
  dateRange: {
    start: string
    end: string
  }
}

// Statistics responses
export interface StatsResponse {
  totalBookings: number
  upcomingBookings: number
  totalRooms: number
  availableRooms: number
  groupCount: number
  memberCount: number
}

// Error response types
export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT'
  | 'MAINTENANCE'

export interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    field?: string // For validation errors
    details?: Record<string, unknown>
  }
  timestamp: string
}