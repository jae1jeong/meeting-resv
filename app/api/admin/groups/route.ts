import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            members: true,
            rooms: true
          }
        },
        members: {
          where: {
            role: 'ADMIN'
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const result = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      inviteCode: group.inviteCode,
      memberCount: group._count.members,
      adminCount: group.members.length,
      roomCount: group._count.rooms,
      createdAt: group.createdAt
    }))

    return successResponse(result, '조회 완료')
  } catch (error) {
    console.error('그룹 목록 조회 오류:', error)
    return errorResponse('그룹 목록을 불러올 수 없습니다', 500)
  }
}



