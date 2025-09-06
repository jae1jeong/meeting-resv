import { User } from '@prisma/client'
import { GroupMemberWithGroup } from './group'

export type UserResponse = Omit<User, 'password'>

export interface UserWithGroups extends UserResponse {
  groupMemberships: GroupMemberWithGroup[]
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}