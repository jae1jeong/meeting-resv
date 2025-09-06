export interface Group {
  id: string
  name: string
  description?: string
  members: GroupMember[]
  rooms: Room[]
  createdAt: Date
  updatedAt: Date
}

export interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: GroupRole
  user?: User
  joinedAt: Date
}

export type GroupRole = 'ADMIN' | 'MEMBER'

export interface Room {
  id: string
  groupId: string
  name: string
  capacity?: number
  amenities?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateGroupDto {
  name: string
  description?: string
  memberEmails?: string[]
}

export interface CreateRoomDto {
  groupId: string
  name: string
  capacity?: number
  amenities?: string[]
}

export interface InviteMemberDto {
  groupId: string
  email: string
  role?: GroupRole
}

// Simplified User type to avoid circular dependency
interface User {
  id: string
  email: string
  name: string
}