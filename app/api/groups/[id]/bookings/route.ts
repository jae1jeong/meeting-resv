import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { errorResponse, paginatedResponse } from '@/packages/backend/utils/api-response'
import { BookingResponse } from '@/packages/shared/types/api/booking'
import { parseKSTDate, setToKSTEndOfDay } from '@/packages/shared/utils/date-utils'
import { Prisma } from '@prisma/client'

// GET /api/groups/[id]/bookings - Get all bookings for a group's rooms
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
      return errorResponse('You are not a member of this group', 403)
    }

    // Get group details
    const group = await prisma.group.findUnique({
      where: { id },
      select: { name: true }
    })

    if (!group) {
      return errorResponse('Group not found', 404)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const roomId = searchParams.get('roomId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const creatorId = searchParams.get('creatorId')
    const includeParticipants = searchParams.get('includeParticipants') === 'true'
    const includeRecurring = searchParams.get('includeRecurring') === 'true'

    const skip = (page - 1) * pageSize

    // Build where clause - get all bookings from rooms in this group
    const where: Prisma.BookingWhereInput = {
      room: {
        groupId: id
      }
    }

    // Optional room filter
    if (roomId) {
      where.roomId = roomId
    }

    // Optional creator filter
    if (creatorId) {
      where.creatorId = creatorId
    }

    // Date filtering
    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = parseKSTDate(startDate)
      }
      if (endDate) {
        where.date.lte = setToKSTEndOfDay(parseKSTDate(endDate))
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          room: {
            include: {
              group: true
            }
          },
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
          { startTime: 'asc' },
          { room: { name: 'asc' } }
        ]
      }),
      prisma.booking.count({ where })
    ])

    return paginatedResponse<BookingResponse>(
      bookings,
      total,
      page,
      pageSize,
      `Bookings for group "${group.name}" retrieved successfully`
    )
  } catch (error) {
    console.error('Error fetching group bookings:', error)
    return errorResponse('Failed to fetch group bookings', 500)
  }
}