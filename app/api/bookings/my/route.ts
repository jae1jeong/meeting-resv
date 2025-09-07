import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/auth'
import { errorResponse, paginatedResponse } from '@/packages/backend/utils/api-response'
import { BookingResponse } from '@/packages/shared/types/api/booking'
import { Prisma } from '@prisma/client'

// GET /api/bookings/my - Get current user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeParticipating = searchParams.get('includeParticipating') === 'true'
    const includeDetails = searchParams.get('includeDetails') === 'true'

    const skip = (page - 1) * pageSize

    // Build where clause for user's own bookings
    const whereCreator: Prisma.BookingWhereInput = {
      creatorId: session.user.id
    }

    // Date filtering
    if (startDate || endDate) {
      whereCreator.date = {}
      if (startDate) {
        whereCreator.date.gte = new Date(startDate)
      }
      if (endDate) {
        whereCreator.date.lte = new Date(endDate)
      }
    }

    // Get bookings created by user
    const createdBookingsPromise = prisma.booking.findMany({
      where: whereCreator,
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
        recurringPattern: includeDetails ? {
          include: {
            exceptions: true
          }
        } : false
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const createdCountPromise = prisma.booking.count({ where: whereCreator })

    // Optionally include bookings where user is a participant
    let participatingBookings: BookingResponse[] = []
    let participatingCount = 0

    if (includeParticipating) {
      const whereParticipant: Prisma.BookingWhereInput = {
        participants: {
          some: {
            userId: session.user.id
          }
        },
        creatorId: {
          not: session.user.id // Exclude bookings created by the user
        }
      }

      // Apply same date filtering
      if (startDate || endDate) {
        whereParticipant.date = {}
        if (startDate) {
          whereParticipant.date.gte = new Date(startDate)
        }
        if (endDate) {
          whereParticipant.date.lte = new Date(endDate)
        }
      }

      const participatingBookingsPromise = prisma.booking.findMany({
        where: whereParticipant,
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
          recurringPattern: includeDetails ? {
            include: {
              exceptions: true
            }
          } : false
        },
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' }
        ]
      })

      const participatingCountPromise = prisma.booking.count({ where: whereParticipant })

      ;[participatingBookings, participatingCount] = await Promise.all([
        participatingBookingsPromise,
        participatingCountPromise
      ])
    }

    const [createdBookings, createdCount] = await Promise.all([
      createdBookingsPromise,
      createdCountPromise
    ])

    // Combine and sort all bookings
    const allBookings = [...createdBookings, ...participatingBookings].sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime()
      if (dateCompare !== 0) return dateCompare
      
      const timeCompare = a.startTime.localeCompare(b.startTime)
      return timeCompare
    })

    // Apply pagination to combined results
    const paginatedBookings = allBookings.slice(0, pageSize)
    const totalCount = createdCount + participatingCount

    return paginatedResponse<BookingResponse>(
      paginatedBookings,
      totalCount,
      page,
      pageSize,
      'User bookings retrieved successfully'
    )
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return errorResponse('Failed to fetch user bookings', 500)
  }
}