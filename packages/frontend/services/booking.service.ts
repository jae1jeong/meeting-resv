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
import { createBookingAction, updateBookingAction, deleteBookingAction } from '@/packages/backend/actions/booking-actions'

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
  ): Promise<ApiResponse<BookingListResponse>> {
    return this.getBookings({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupId,
      includeParticipants: true,
      pageSize: 100 // 캘린더 뷰에서는 모든 예약을 보여줌
    })
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
    return await updateBookingAction(id, data)
  }

  /**
   * 예약 삭제
   */
  static async deleteBooking(id: string): Promise<ApiResponse<null>> {
    return await deleteBookingAction(id)
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