import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { UpdateBookingRequest, BookingResponse } from '@/packages/shared/types/api/booking'
import { checkRoomAvailability, validateTimeSlot } from '@/packages/shared/utils/booking-utils'
import { parseKSTDate } from '@/packages/shared/utils/date-utils'
import { Prisma } from '@prisma/client'

// GET /api/bookings/[id] - Get single booking
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

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        room: {
          group: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      },
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
        recurringPattern: {
          include: {
            exceptions: true
          }
        }
      }
    })

    if (!booking) {
      return errorResponse('Booking not found', 404)
    }

    return successResponse<BookingResponse>(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return errorResponse('Failed to fetch booking', 500)
  }
}

// PUT /api/bookings/[id] - Update booking (creator only)
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

    // Check if user is the creator
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true }
    })

    if (!existingBooking) {
      return errorResponse('Booking not found', 404)
    }

    if (existingBooking.creatorId !== session.user.id) {
      return errorResponse('Only the booking creator can update this booking', 403)
    }

    const body: UpdateBookingRequest = await request.json()
    const { title, description, date, startTime, endTime, participantIds } = body

    // Prepare update data
    const updateData: Prisma.BookingUpdateInput = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description

    // Handle date/time changes
    if (date || startTime || endTime) {
      const newDate = date ? parseKSTDate(date) : new Date(existingBooking.date)
      const newStartTime = startTime || existingBooking.startTime
      const newEndTime = endTime || existingBooking.endTime

      // Validate time slot if changed
      if (startTime || endTime) {
        if (!validateTimeSlot(newStartTime, newEndTime)) {
          return errorResponse('Invalid time slot. Times must be in HH:mm format on 30-minute intervals', 400)
        }
      }

      // Check room availability if date/time changed
      if (date || startTime || endTime) {
        const isAvailable = await checkRoomAvailability(
          existingBooking.roomId,
          newDate,
          newStartTime,
          newEndTime,
          id
        )

        if (!isAvailable) {
          return errorResponse('Room is not available for the selected time slot', 409)
        }
      }

      if (date) {
        updateData.date = newDate
      }
      if (startTime) updateData.startTime = startTime
      if (endTime) updateData.endTime = endTime
    }

    // Handle participant updates
    if (participantIds !== undefined) {
      // Validate participants
      if (participantIds.length > 0) {
        const validParticipants = await prisma.user.findMany({
          where: {
            id: { in: participantIds },
            groupMemberships: {
              some: {
                groupId: existingBooking.room.groupId
              }
            }
          },
          select: { id: true }
        })

        if (validParticipants.length !== participantIds.length) {
          return errorResponse('Some participants are not members of the group', 400)
        }
      }

      // Delete existing participants and create new ones
      await prisma.bookingParticipant.deleteMany({
        where: { bookingId: id }
      })

      if (participantIds.length > 0) {
        await prisma.bookingParticipant.createMany({
          data: participantIds.map((userId: string) => ({
            bookingId: id,
            userId
          }))
        })
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
        }
      }
    })

    return successResponse<BookingResponse>(booking, 'Booking updated successfully')
  } catch (error) {
    console.error('Error updating booking:', error)
    return errorResponse('Failed to update booking', 500)
  }
}

// DELETE /api/bookings/[id] - Delete booking (creator only)
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

    // Check if user is the creator
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return errorResponse('Booking not found', 404)
    }

    if (booking.creatorId !== session.user.id) {
      return errorResponse('Only the booking creator can delete this booking', 403)
    }

    await prisma.booking.delete({
      where: { id }
    })

    return successResponse(null, 'Booking deleted successfully')
  } catch (error) {
    console.error('Error deleting booking:', error)
    return errorResponse('Failed to delete booking', 500)
  }
}