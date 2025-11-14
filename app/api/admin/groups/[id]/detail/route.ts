import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const group = await prisma.group.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    if (!group) {
      return errorResponse('그룹을 찾을 수 없습니다', 404)
    }

    return successResponse(group, '조회 완료')
  } catch (error) {
    console.error('그룹 조회 오류:', error)
    return errorResponse('그룹을 불러올 수 없습니다', 500)
  }
}




