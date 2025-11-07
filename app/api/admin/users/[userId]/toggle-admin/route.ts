import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireAdmin()
    const { userId } = await params

    // 자기 자신의 권한은 변경할 수 없음
    if (session.id === userId) {
      return errorResponse('자신의 권한은 변경할 수 없습니다', 400)
    }

    // 현재 상태 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    if (!user) {
      return errorResponse('사용자를 찾을 수 없습니다', 404)
    }

    // 상태 토글
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: !user.isAdmin
      }
    })

    revalidatePath('/admin/users')
    return successResponse(updatedUser, '권한이 변경되었습니다')
  } catch (error) {
    console.error('권한 변경 오류:', error)
    return errorResponse('권한 변경 중 오류가 발생했습니다', 500)
  }
}

