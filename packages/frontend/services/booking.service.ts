'use client'

import type { 
  ApiResponse
} from '@/packages/shared/types/responses'
import type { 
  BookingResponse,
  BookingWithDetails,
  BookingListResponse
} from '@/packages/shared/types/api/booking'
import type { 
  CreateBookingRequest,
  UpdateBookingRequest 
} from '@/packages/shared/types/api/booking'

/**
 * 예약 관련 API 서비스
 */
export class BookingService {
  /**
   * 예약 목록 조회
   */
  static async getBookings(params?: {
    page?: number
    pageSize?: number
    roomId?: string
    groupId?: string
    startDate?: string
    endDate?: string
    includeParticipants?: boolean
    includeRecurring?: boolean
  }): Promise<ApiResponse<BookingListResponse>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params?.roomId) searchParams.set('roomId', params.roomId)
      if (params?.groupId) searchParams.set('groupId', params.groupId)
      if (params?.startDate) searchParams.set('startDate', params.startDate)
      if (params?.endDate) searchParams.set('endDate', params.endDate)
      if (params?.includeParticipants) searchParams.set('includeParticipants', 'true')
      if (params?.includeRecurring) searchParams.set('includeRecurring', 'true')

      const response = await fetch(`/api/bookings?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<BookingListResponse>
    } catch (error) {
      console.error('예약 목록 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 목록을 불러올 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 특정 날짜 범위의 예약 조회 (캘린더 뷰용)
   */
  static async getBookingsForDateRange(
    startDate: Date, 
    endDate: Date, 
    groupId?: string
  ): Promise<ApiResponse<BookingResponse[]>> {
    try {
      const response = await fetch('/api/bookings/date-range', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate, endDate }),
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse[]>
    } catch (error) {
      console.error('예약 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 조회에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 회의실별 예약 조회
   */
  static async getRoomBookings(
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<BookingResponse[]>> {
    try {
      const searchParams = new URLSearchParams({
        startDate,
        endDate
      })

      const response = await fetch(`/api/bookings/room/${roomId}?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse[]>
    } catch (error) {
      console.error('회의실 예약 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 조회에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 시간대 가용성 확인
   */
  static async checkTimeSlotAvailability(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, date, startTime, endTime, excludeBookingId }),
      })

      const result = await response.json()
      return result as ApiResponse<{ available: boolean }>
    } catch (error) {
      console.error('가용성 확인 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '가용성 확인에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 예약 시간 변경
   */
  static async updateBookingTime(
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<ApiResponse<BookingResponse>> {
    try {
      const response = await fetch('/api/bookings/update-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, newDate, newStartTime, newEndTime }),
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse>
    } catch (error) {
      console.error('예약 시간 변경 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 시간 변경에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 예약 상세 조회
   */
  static async getBooking(id: string): Promise<ApiResponse<BookingResponse>> {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse>
    } catch (error) {
      console.error('예약 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 정보를 불러올 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 예약 생성
   */
  static async createBooking(data: CreateBookingRequest): Promise<ApiResponse<BookingResponse>> {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse>
    } catch (error) {
      console.error('예약 생성 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 생성에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 예약 수정
   */
  static async updateBooking(id: string, data: UpdateBookingRequest): Promise<ApiResponse<BookingResponse>> {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result as ApiResponse<BookingResponse>
    } catch (error) {
      console.error('예약 수정 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 수정에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 예약 삭제
   */
  static async deleteBooking(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<null>
    } catch (error) {
      console.error('예약 삭제 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '예약 삭제에 실패했습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 회의실 사용 가능 여부 확인
   */
  static async checkRoomAvailability(
    roomId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<ApiResponse<{ available: boolean; conflicts?: BookingResponse[] }>> {
    try {
      const searchParams = new URLSearchParams({
        date,
        startTime,
        endTime
      })

      const response = await fetch(`/api/rooms/${roomId}/availability?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<{ available: boolean; conflicts?: BookingResponse[] }>
    } catch (error) {
      console.error('회의실 사용 가능 여부 확인 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '회의실 사용 가능 여부를 확인할 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }
}