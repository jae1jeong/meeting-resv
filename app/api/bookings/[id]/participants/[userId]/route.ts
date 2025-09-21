import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/better-auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'

// DELETE /api/bookings/[id]/participants/[userId] - Remove participant from booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    // 예약이 존재하고 사용자가 생성자인지 확인
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        creatorId: session.user.id
      }
    })

    if (!booking) {
      return errorResponse('예약을 찾을 수 없거나 삭제 권한이 없습니다', 404)
    }

    // 참여자가 존재하는지 확인
    const participant = await prisma.bookingParticipant.findUnique({
      where: {
        bookingId_userId: {
          bookingId: id,
          userId: userId
        }
      }
    })

    if (!participant) {
      return errorResponse('참여자를 찾을 수 없습니다', 404)
    }

    // 참여자 제거
    await prisma.bookingParticipant.delete({
      where: {
        bookingId_userId: {
          bookingId: id,
          userId: userId
        }
      }
    })

    return successResponse(null, '참여자를 성공적으로 제거했습니다')
  } catch (error) {
    console.error('참여자 제거 오류:', error)
    return errorResponse('참여자 제거에 실패했습니다', 500)
  }
}