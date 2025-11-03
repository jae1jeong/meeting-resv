import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { UpdateGroupMemberRequest, GroupMemberWithUser } from '@/shared/types/api/group'

// PUT /api/groups/[id]/members/[userId] - Update member role (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if user is admin
    const adminMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      return errorResponse('Only group admins can update member roles', 403)
    }

    // Prevent self-demotion if last admin
    if (userId === session.user.id) {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: id,
          role: 'ADMIN'
        }
      })

      if (adminCount === 1) {
        return errorResponse('Cannot demote the last admin', 400)
      }
    }

    const body: UpdateGroupMemberRequest = await request.json()
    const { role } = body

    if (!role) {
      return errorResponse('Role is required', 400)
    }

    const member = await prisma.groupMember.update({
      where: {
        userId_groupId: {
          userId,
          groupId: id
        }
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            isAdmin: true
          }
        }
      }
    })

    return successResponse<GroupMemberWithUser>(member, 'Member role updated successfully')
  } catch (error) {
    console.error('Error updating member:', error)
    return errorResponse('Failed to update member', 500)
  }
}

// DELETE /api/groups/[id]/members/[userId] - Remove member from group (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    // Check if user is admin or removing themselves
    const adminMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    const isAdmin = adminMembership?.role === 'ADMIN'
    const isSelfRemoval = userId === session.user.id

    if (!isAdmin && !isSelfRemoval) {
      return errorResponse('Only group admins can remove members', 403)
    }

    // Prevent last admin from leaving
    if (isSelfRemoval && isAdmin) {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId: id,
          role: 'ADMIN'
        }
      })

      if (adminCount === 1) {
        return errorResponse('Cannot remove the last admin', 400)
      }
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId: id
        }
      }
    })

    return successResponse(null, isSelfRemoval ? 'Left group successfully' : 'Member removed successfully')
  } catch (error) {
    console.error('Error removing member:', error)
    return errorResponse('Failed to remove member', 500)
  }
}