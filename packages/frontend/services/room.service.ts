'use client'

import type { 
  ApiResponse
} from '@/packages/shared/types/responses'
import type { 
  MeetingRoomWithGroup,
  RoomListResponse 
} from '@/packages/shared/types/api/room'

/**
 * 회의실 관련 API 서비스
 */
export class RoomService {
  /**
   * 회의실 목록 조회 (사용자가 속한 그룹의 회의실만)
   */
  static async getRooms(params?: {
    page?: number
    pageSize?: number
    groupId?: string
    search?: string
  }): Promise<ApiResponse<RoomListResponse>> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())
      if (params?.groupId) searchParams.set('groupId', params.groupId)
      if (params?.search) searchParams.set('search', params.search)

      const response = await fetch(`/api/rooms?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<RoomListResponse>
    } catch (error) {
      console.error('회의실 목록 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '회의실 목록을 불러올 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 특정 회의실 정보 조회
   */
  static async getRoom(roomId: string): Promise<ApiResponse<MeetingRoomWithGroup>> {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<MeetingRoomWithGroup>
    } catch (error) {
      console.error('회의실 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '회의실 정보를 불러올 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 회의실 가용성 확인
   */
  static async checkAvailability(
    roomId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<ApiResponse<{ available: boolean; conflicts?: any[] }>> {
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
      return result as ApiResponse<{ available: boolean; conflicts?: any[] }>
    } catch (error) {
      console.error('회의실 가용성 확인 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : '회의실 가용성을 확인할 수 없습니다'
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 회의실별 예약 목록 조회
   */
  static async getRoomBookings(
    roomId: string,
    params?: {
      startDate?: string
      endDate?: string
      includeParticipants?: boolean
    }
  ): Promise<ApiResponse<any>> {
    try {
      const searchParams = new URLSearchParams({ roomId })
      
      if (params?.startDate) searchParams.set('startDate', params.startDate)
      if (params?.endDate) searchParams.set('endDate', params.endDate)
      if (params?.includeParticipants) searchParams.set('includeParticipants', 'true')

      const response = await fetch(`/api/bookings?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('회의실 예약 조회 오류:', error)
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
}