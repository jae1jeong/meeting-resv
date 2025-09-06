import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { UpdateMeetingRoomRequest, MeetingRoomWithGroup } from '@/types/api'

// GET /api/rooms/[id] - Get single room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const room = await prisma.meetingRoom.findFirst({
      where: {
        id,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        group: true
      }
    })

    if (!room) {
      return errorResponse('Room not found', 404)
    }

    return successResponse<MeetingRoomWithGroup>(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return errorResponse('Failed to fetch room', 500)
  }
}

// PUT /api/rooms/[id] - Update room (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    // Get room with group info
    const existingRoom = await prisma.meetingRoom.findUnique({
      where: { id },
      include: { group: true }
    })

    if (!existingRoom) {
      return errorResponse('Room not found', 404)
    }

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: existingRoom.groupId
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('Only group admins can update rooms', 403)
    }

    const body: UpdateMeetingRoomRequest = await request.json()
    const { name, capacity, location, amenities } = body

    const room = await prisma.meetingRoom.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(capacity !== undefined && { capacity }),
        ...(location !== undefined && { location }),
        ...(amenities !== undefined && { amenities })
      },
      include: {
        group: true
      }
    })

    return successResponse<MeetingRoomWithGroup>(room, 'Room updated successfully')
  } catch (error) {
    console.error('Error updating room:', error)
    return errorResponse('Failed to update room', 500)
  }
}

// DELETE /api/rooms/[id] - Delete room (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    // Get room with group info
    const room = await prisma.meetingRoom.findUnique({
      where: { id },
      include: { 
        group: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!room) {
      return errorResponse('Room not found', 404)
    }

    // Check if user is admin of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: room.groupId
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('Only group admins can delete rooms', 403)
    }

    // Check for existing bookings
    if (room._count.bookings > 0) {
      return errorResponse('Cannot delete room with existing bookings', 400)
    }

    await prisma.meetingRoom.delete({
      where: { id }
    })

    return successResponse(null, 'Room deleted successfully')
  } catch (error) {
    console.error('Error deleting room:', error)
    return errorResponse('Failed to delete room', 500)
  }
}