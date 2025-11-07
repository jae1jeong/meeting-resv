'use client'

import type { ApiResponse } from '@/packages/shared/types/responses'
import type {
  AdminUserResponse,
  AdminRoomResponse,
  AdminRoomStatsResponse,
  AdminGroupResponse,
  AdminGroupDetailResponse,
  AdminGroupMemberResponse,
  AdminToggleUserResponse,
} from '@/packages/shared/types/api/admin'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import type { GroupMemberWithUser } from '@/packages/shared/types/api/group'

export class AdminService {
  /**
   * 사용자 목록 조회
   */
  static async getUsers(): Promise<ApiResponse<AdminUserResponse[]>> {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminUserResponse[]>
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '사용자 목록을 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 관리자 권한 토글
   */
  static async toggleAdminStatus(
    userId: string
  ): Promise<ApiResponse<AdminToggleUserResponse>> {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminToggleUserResponse>
    } catch (error) {
      console.error('권한 변경 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '권한 변경에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 회의실 목록 조회
   */
  static async getRooms(): Promise<ApiResponse<AdminRoomResponse[]>> {
    try {
      const response = await fetch('/api/admin/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminRoomResponse[]>
    } catch (error) {
      console.error('회의실 목록 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '회의실 목록을 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 회의실 통계 조회
   */
  static async getRoomStats(): Promise<ApiResponse<AdminRoomStatsResponse>> {
    try {
      const response = await fetch('/api/admin/rooms/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminRoomStatsResponse>
    } catch (error) {
      console.error('회의실 통계 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '회의실 통계를 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 회의실 삭제
   */
  static async deleteRoom(roomId: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<null>
    } catch (error) {
      console.error('회의실 삭제 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '회의실 삭제에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 목록 조회
   */
  static async getGroups(): Promise<ApiResponse<AdminGroupResponse[]>> {
    try {
      const response = await fetch('/api/admin/groups', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminGroupResponse[]>
    } catch (error) {
      console.error('그룹 목록 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '그룹 목록을 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 상세 조회
   */
  static async getGroupDetail(
    groupId: string
  ): Promise<ApiResponse<AdminGroupDetailResponse>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/detail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminGroupDetailResponse>
    } catch (error) {
      console.error('그룹 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '그룹을 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 멤버 조회
   */
  static async getGroupMembers(
    groupId: string
  ): Promise<ApiResponse<AdminGroupMemberResponse[]>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<AdminGroupMemberResponse[]>
    } catch (error) {
      console.error('그룹 멤버 조회 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error
              ? error.message
              : '그룹 멤버를 불러올 수 없습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 수정
   */
  static async updateGroup(
    groupId: string,
    data: {
      name?: string
      description?: string | null
      backgroundImage?: string | null
      backgroundBlur?: number
      backgroundOpacity?: number
      backgroundPosition?: string
    }
  ): Promise<ApiResponse<AdminGroupDetailResponse>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result as ApiResponse<AdminGroupDetailResponse>
    } catch (error) {
      console.error('그룹 수정 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '그룹 수정에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 삭제
   */
  static async deleteGroup(groupId: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      return result as ApiResponse<null>
    } catch (error) {
      console.error('그룹 삭제 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '그룹 삭제에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 멤버 추가
   */
  static async addGroupMember(
    groupId: string,
    userEmail: string,
    role: 'ADMIN' | 'MEMBER'
  ): Promise<ApiResponse<GroupMemberWithUser>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail, role }),
      })

      const result = await response.json()
      return result as ApiResponse<GroupMemberWithUser>
    } catch (error) {
      console.error('멤버 추가 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '멤버 추가에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 멤버 제거
   */
  static async removeGroupMember(
    groupId: string,
    memberId: string
  ): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(
        `/api/admin/groups/${groupId}/members?memberId=${memberId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()
      return result as ApiResponse<null>
    } catch (error) {
      console.error('멤버 제거 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '멤버 제거에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * 그룹 멤버 역할 변경
   */
  static async changeGroupMemberRole(
    groupId: string,
    memberId: string,
    newRole: 'ADMIN' | 'MEMBER'
  ): Promise<ApiResponse<GroupMemberWithUser>> {
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId, newRole }),
      })

      const result = await response.json()
      return result as ApiResponse<GroupMemberWithUser>
    } catch (error) {
      console.error('역할 변경 오류:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message:
            error instanceof Error ? error.message : '역할 변경에 실패했습니다',
        },
        timestamp: new Date().toISOString(),
      }
    }
  }
}
