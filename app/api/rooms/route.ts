import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { CreateMeetingRoomRequest, MeetingRoomWithGroup } from '@/types/api'
import { Prisma } from '@prisma/client'

// GET /api/rooms - List rooms
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const groupId = searchParams.get('groupId')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Prisma.MeetingRoomWhereInput = {}
    
    if (groupId) {
      // Check if user is member of the group
      const membership = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: session.user.id,
            groupId
          }
        }
      })

      if (!membership) {
        return errorResponse('You are not a member of this group', 403)
      }

      where.groupId = groupId
    } else {
      // Get all rooms from user's groups
      where.group = {
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [rooms, total] = await Promise.all([
      prisma.meetingRoom.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          group: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.meetingRoom.count({ where })
    ])

    return paginatedResponse<MeetingRoomWithGroup>(rooms, total, page, pageSize)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return errorResponse('Failed to fetch rooms', 500)
  }
}

// POST /api/rooms - Create new room
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body: CreateMeetingRoomRequest = await request.json()
    const { name, capacity, location, amenities, groupId } = body

    if (!name || !capacity || !groupId) {
      return errorResponse('Name, capacity, and groupId are required', 400)
    }

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('Only group admins can create rooms', 403)
    }

    const room = await prisma.meetingRoom.create({
      data: {
        name,
        capacity,
        location,
        amenities: amenities || [],
        groupId
      },
      include: {
        group: true
      }
    })

    return successResponse<MeetingRoomWithGroup>(room, 'Room created successfully', 201)
  } catch (error) {
    console.error('Error creating room:', error)
    return errorResponse('Failed to create room', 500)
  }
}