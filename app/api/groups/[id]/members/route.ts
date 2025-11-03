import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse, paginatedResponse } from '@/packages/backend/utils/api-response'
import { AddGroupMemberRequest, GroupMemberWithUser } from '@/packages/shared/types/api/group'

// GET /api/groups/[id]/members - Get group members list
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

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership) {
      return errorResponse('그룹 멤버만 조회할 수 있습니다', 403)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const role = searchParams.get('role') as 'ADMIN' | 'MEMBER' | null
    
    const skip = (page - 1) * pageSize

    const where = {
      groupId: id,
      ...(role && { role })
    }

    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where,
        skip,
        take: pageSize,
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
        },
        orderBy: [
          { role: 'asc' }, // ADMIN first
          { joinedAt: 'desc' }
        ]
      }),
      prisma.groupMember.count({ where })
    ])

    return paginatedResponse<GroupMemberWithUser>(
      members,
      total,
      page,
      pageSize,
      '그룹 멤버 목록을 불러왔습니다'
    )
  } catch (error) {
    console.error('Error fetching group members:', error)
    return errorResponse('그룹 멤버 목록을 불러오는데 실패했습니다', 500)
  }
}

// POST /api/groups/[id]/members - Add member to group (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      return errorResponse('Only group admins can add members', 403)
    }

    const body: AddGroupMemberRequest = await request.json()
    const { userId, role = 'MEMBER' } = body

    if (!userId) {
      return errorResponse('User ID is required', 400)
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      return errorResponse('User not found', 404)
    }

    // Check if already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: id
        }
      }
    })

    if (existingMembership) {
      return errorResponse('User is already a member of this group', 409)
    }

    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId: id,
        role
      },
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

    return successResponse<GroupMemberWithUser>(member, 'Member added successfully', 201)
  } catch (error) {
    console.error('Error adding member:', error)
    return errorResponse('Failed to add member', 500)
  }
}