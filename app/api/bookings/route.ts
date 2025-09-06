import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { CreateBookingRequest, BookingResponse } from '@/types/api'
import { checkRoomAvailability, validateTimeSlot } from '@/lib/booking-utils'
import { Prisma } from '@prisma/client'

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const roomId = searchParams.get('roomId')
    const groupId = searchParams.get('groupId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeParticipants = searchParams.get('includeParticipants') === 'true'
    const includeRecurring = searchParams.get('includeRecurring') === 'true'

    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Prisma.BookingWhereInput = {}

    // User must be member of the group that owns the room
    where.room = {
      group: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    }

    if (roomId) {
      where.roomId = roomId
    }

    if (groupId) {
      where.room.groupId = groupId
    }

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
              name: true,
              createdAt: true,
              updatedAt: true
            }
          },
          participants: includeParticipants ? {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          } : false,
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

    return paginatedResponse<BookingResponse>(bookings, total, page, pageSize)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return errorResponse('Failed to fetch bookings', 500)
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body: CreateBookingRequest = await request.json()
    const { 
      title, 
      description, 
      roomId, 
      date, 
      startTime, 
      endTime, 
      participantIds,
      recurringPattern 
    } = body

    // Validate required fields
    if (!title || !roomId || !date || !startTime || !endTime) {
      return errorResponse('필수 항목을 모두 입력해주세요', 400)
    }

    // Validate time slot
    if (!validateTimeSlot(startTime, endTime)) {
      return errorResponse('시간은 30분 단위로 설정해주세요', 400)
    }

    // Check if user has access to the room
    const room = await prisma.meetingRoom.findFirst({
      where: {
        id: roomId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      }
    })

    if (!room) {
      return errorResponse('회의실을 찾을 수 없거나 접근 권한이 없습니다', 404)
    }

    // Parse date
    const bookingDate = new Date(date)
    bookingDate.setHours(0, 0, 0, 0)

    // Check room availability
    const isAvailable = await checkRoomAvailability(roomId, bookingDate, startTime, endTime)
    if (!isAvailable) {
      return errorResponse('해당 시간에 회의실을 사용할 수 없습니다', 409)
    }

    // Validate participants
    if (participantIds && participantIds.length > 0) {
      const validParticipants = await prisma.user.findMany({
        where: {
          id: { in: participantIds },
          groupMemberships: {
            some: {
              groupId: room.groupId
            }
          }
        },
        select: { id: true }
      })

      if (validParticipants.length !== participantIds.length) {
        return errorResponse('Some participants are not members of the group', 400)
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        title,
        description,
        roomId,
        creatorId: session.user.id,
        date: bookingDate,
        startTime,
        endTime,
        participants: participantIds ? {
          create: participantIds.map((userId: string) => ({
            userId
          }))
        } : undefined
      },
      include: {
        room: true,
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
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
                name: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    })

    return successResponse<BookingResponse>(booking, '예약이 생성되었습니다', 201)
  } catch (error) {
    console.error('Error creating booking:', error)
    return errorResponse('Failed to create booking', 500)
  }
}