import { UserResponse } from './user'
import { MeetingRoomWithGroup } from './room'
import { GroupWithMembers, GroupMemberWithUser } from './group'

/**
 * Admin 사용자 목록 응답 타입
 */
export interface AdminUserResponse {
  id: string
  email: string | null
  name: string | null
  isAdmin: boolean
  createdAt: Date
  _count: {
    groupMemberships: number
    bookings: number
  }
}

/**
 * Admin 회의실 목록 응답 타입
 */
export interface AdminRoomResponse {
  id: string
  name: string
  capacity: number
  location: string | null
  amenities: string[]
  groupId: string
  groupName: string
  bookingCount: number
}

/**
 * Admin 회의실 통계 응답 타입
 */
export interface AdminRoomStatsResponse {
  totalRooms: number
  totalCapacity: number
  monthlyBookings: number
  averageUtilization: number
}

/**
 * Admin 그룹 목록 응답 타입
 */
export interface AdminGroupResponse {
  id: string
  name: string
  description: string | null
  inviteCode: string | null
  memberCount: number
  adminCount: number
  roomCount: number
  createdAt: Date
}

/**
 * Admin 그룹 상세 응답 타입
 */
export interface AdminGroupDetailResponse {
  id: string
  name: string
  description: string | null
  backgroundImage: string | null
  backgroundBlur: number
  backgroundOpacity: number
  backgroundPosition: string
  inviteCode: string | null
  createdAt: Date
  updatedAt: Date
  _count?: {
    members: number
    rooms: number
  }
}

/**
 * Admin 그룹 멤버 응답 타입
 */
export interface AdminGroupMemberResponse {
  id: string
  userId: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
}

/**
 * Admin 사용자 권한 토글 응답 타입
 */
export interface AdminToggleUserResponse {
  id: string
  email: string | null
  name: string | null
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}



