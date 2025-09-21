import { Group, GroupMember, Role } from '@prisma/client'
import { UserResponse } from './user'

export interface GroupWithMembers extends Group {
  members: GroupMemberWithUser[]
  _count?: {
    members: number
    rooms: number
  }
}

export interface GroupMemberWithUser extends GroupMember {
  user: UserResponse
}

export interface GroupMemberWithGroup extends GroupMember {
  group: Group
}

export interface CreateGroupRequest {
  name: string
  description?: string
  backgroundImage?: string
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundPosition?: string
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
  backgroundImage?: string
  backgroundBlur?: number
  backgroundOpacity?: number
  backgroundPosition?: string
}

export interface AddGroupMemberRequest {
  userId: string
  role?: Role
}

export interface UpdateGroupMemberRequest {
  role: Role
}

export interface GroupQueryParams {
  page?: number
  pageSize?: number
  search?: string
  includeMembers?: boolean
  includeRooms?: boolean
}