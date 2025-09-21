import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'

// GET /api/bookings/[id]/participants - Get booking participants
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

    // 예약이 존재하고 사용자가 접근 권한이 있는지 확인
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
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return errorResponse('예약을 찾을 수 없거나 접근 권한이 없습니다', 404)
    }

    return successResponse(booking.participants, '참여자 목록을 성공적으로 조회했습니다')
  } catch (error) {
    console.error('참여자 목록 조회 오류:', error)
    return errorResponse('참여자 목록 조회에 실패했습니다', 500)
  }
}

// POST /api/bookings/[id]/participants - Add participants to booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    const { userIds } = body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse('사용자 ID 배열이 필요합니다', 400)
    }

    // 예약이 존재하고 사용자가 생성자인지 확인
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        creatorId: session.user.id
      }
    })

    if (!booking) {
      return errorResponse('예약을 찾을 수 없거나 수정 권한이 없습니다', 404)
    }

    // 이미 참여 중인 사용자 제외
    const existingParticipants = await prisma.bookingParticipant.findMany({
      where: {
        bookingId: id,
        userId: { in: userIds }
      }
    })

    const existingUserIds = existingParticipants.map(p => p.userId)
    const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId))

    if (newUserIds.length === 0) {
      return errorResponse('모든 사용자가 이미 참여 중입니다', 400)
    }

    // 새 참여자 추가
    const newParticipants = await prisma.bookingParticipant.createMany({
      data: newUserIds.map(userId => ({
        bookingId: id,
        userId
      }))
    })

    // 추가된 참여자 정보 반환
    const participants = await prisma.bookingParticipant.findMany({
      where: {
        bookingId: id,
        userId: { in: newUserIds }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    return successResponse(participants, '참여자를 성공적으로 추가했습니다')
  } catch (error) {
    console.error('참여자 추가 오류:', error)
    return errorResponse('참여자 추가에 실패했습니다', 500)
  }
}