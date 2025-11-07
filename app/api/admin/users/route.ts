import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            groupMemberships: true,
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return successResponse(users, '조회 완료')
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    return errorResponse('사용자 목록을 불러올 수 없습니다', 500)
  }
}



