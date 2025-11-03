import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { UpdateGroupRequest, GroupWithMembers } from '@/shared/types/api/group'

// GET /api/groups/[id] - Get single group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const group = await prisma.group.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        members: {
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
        },
        _count: {
          select: {
            members: true,
            rooms: true
          }
        }
      }
    })

    if (!group) {
      return errorResponse('그룹을 찾을 수 없습니다', 404)
    }

    return successResponse<GroupWithMembers>(group)
  } catch (error) {
    console.error('Error fetching group:', error)
    return errorResponse('Failed to fetch group', 500)
  }
}

// PUT /api/groups/[id] - Update group (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    // Check if user is admin
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('그룹 관리자만 수정할 수 있습니다', 403)
    }

    const body: UpdateGroupRequest = await request.json()
    const { name, description } = body

    const group = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      },
      include: {
        members: {
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
        },
        _count: {
          select: {
            members: true,
            rooms: true
          }
        }
      }
    })

    return successResponse<GroupWithMembers>(group, '그룹이 수정되었습니다')
  } catch (error) {
    console.error('Error updating group:', error)
    return errorResponse('Failed to update group', 500)
  }
}

// DELETE /api/groups/[id] - Delete group (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    // Check if user is admin
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('그룹 관리자만 삭제할 수 있습니다', 403)
    }

    await prisma.group.delete({
      where: { id }
    })

    return successResponse(null, '그룹이 삭제되었습니다')
  } catch (error) {
    console.error('Error deleting group:', error)
    return errorResponse('Failed to delete group', 500)
  }
}