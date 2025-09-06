/**
 * API Authorization utilities
 * Common authorization checks for API routes
 */

import { prisma } from '@/lib/prisma'

type GroupRole = 'ADMIN' | 'MEMBER'


export interface AuthorizationResult {
  authorized: boolean
  role?: GroupRole
  message?: string
}

/**
 * Check if a user is a member of a group
 */
export async function isGroupMember(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    }
  })

  return !!membership
}

/**
 * Check if a user is an admin of a group
 */
export async function isGroupAdmin(
  userId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    }
  })

  return membership?.role === 'ADMIN'
}

/**
 * Get user's role in a group
 */
export async function getUserGroupRole(
  userId: string,
  groupId: string
): Promise<GroupRole | null> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    }
  })

  return membership?.role || null
}

/**
 * Check if a user can access a room
 */
export async function canAccessRoom(
  userId: string,
  roomId: string
): Promise<AuthorizationResult> {
  const room = await prisma.meetingRoom.findUnique({
    where: { id: roomId },
    select: { groupId: true }
  })

  if (!room) {
    return {
      authorized: false,
      message: 'Room not found'
    }
  }

  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId: room.groupId
      }
    }
  })

  if (!membership) {
    return {
      authorized: false,
      message: 'You are not a member of the group that owns this room'
    }
  }

  return {
    authorized: true,
    role: membership.role
  }
}

/**
 * Check if a user can modify a room
 */
export async function canModifyRoom(
  userId: string,
  roomId: string
): Promise<AuthorizationResult> {
  const result = await canAccessRoom(userId, roomId)
  
  if (!result.authorized) {
    return result
  }

  if (result.role !== 'ADMIN') {
    return {
      authorized: false,
      message: 'Only group admins can modify rooms'
    }
  }

  return {
    authorized: true,
    role: result.role
  }
}

/**
 * Get all group IDs where user is a member
 */
export async function getUserGroupIds(userId: string): Promise<string[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    select: { groupId: true }
  })

  return memberships.map((membership: { groupId: string }) => membership.groupId)
}

/**
 * Get all group IDs where user is an admin
 */
export async function getUserAdminGroupIds(userId: string): Promise<string[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { 
      userId,
      role: 'ADMIN'
    },
    select: { groupId: true }
  })

  return memberships.map((membership: { groupId: string }) => membership.groupId)
}