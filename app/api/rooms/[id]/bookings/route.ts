import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/auth'
import { errorResponse, paginatedResponse } from '@/packages/backend/utils/api-response'
import { BookingResponse } from '@/packages/shared/types/api/booking'
import { Prisma } from '@prisma/client'

// GET /api/rooms/[id]/bookings - Get bookings for a specific room
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

    // Check if user has access to the room (must be member of the group)
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
      return errorResponse('Room not found or access denied', 404)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeParticipants = searchParams.get('includeParticipants') === 'true'
    const includeRecurring = searchParams.get('includeRecurring') === 'true'

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Prisma.BookingWhereInput = {
      roomId: id
    }

    // Date filtering
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          room: true,
          creator: {
            select: {
              id: true,
              email: true,
              emailVerified: true,
              name: true,
              image: true,
              createdAt: true,
              updatedAt: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  emailVerified: true,
                  name: true,
                  image: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          },
          recurringPattern: includeRecurring ? {
            include: {
              exceptions: true
            }
          } : false
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ]
      }),
      prisma.booking.count({ where })
    ])

    // Add room details to response
    const bookingsWithRoomDetails = bookings.map((booking) => ({
      ...booking,
      room: {
        ...booking.room,
        group: room.group
      }
    }))

    return paginatedResponse<BookingResponse>(
      bookingsWithRoomDetails,
      total,
      page,
      pageSize,
      `Bookings for room "${room.name}" retrieved successfully`
    )
  } catch (error) {
    console.error('Error fetching room bookings:', error)
    return errorResponse('Failed to fetch room bookings', 500)
  }
}