import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { userEmail, role } = body

    if (!userEmail || !role) {
      return errorResponse('userEmail과 role이 필요합니다', 400)
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      }
    })

    if (!user) {
      return errorResponse('사용자를 찾을 수 없습니다', 404)
    }

    // 이미 멤버인지 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: id
        }
      }
    })

    if (existingMember) {
      return errorResponse('이미 그룹의 멤버입니다', 400)
    }

    // 멤버 추가
    const member = await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: id,
        role: role
      },
      include: {
        user: true
      }
    })

    revalidatePath(`/admin/groups/${id}`)
    return successResponse(member, '멤버가 추가되었습니다')
  } catch (error) {
    console.error('멤버 추가 오류:', error)
    return errorResponse('멤버 추가 중 오류가 발생했습니다', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return errorResponse('memberId가 필요합니다', 400)
    }

    await prisma.groupMember.delete({
      where: {
        id: memberId
      }
    })

    revalidatePath(`/admin/groups/${id}`)
    return successResponse({ success: true }, '멤버가 제거되었습니다')
  } catch (error) {
    console.error('멤버 제거 오류:', error)
    return errorResponse('멤버 제거 중 오류가 발생했습니다', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const { memberId, newRole } = body

    if (!memberId || !newRole) {
      return errorResponse('memberId와 newRole이 필요합니다', 400)
    }

    const member = await prisma.groupMember.update({
      where: {
        id: memberId
      },
      data: {
        role: newRole
      }
    })

    revalidatePath(`/admin/groups/${id}`)
    return successResponse(member, '역할이 변경되었습니다')
  } catch (error) {
    console.error('역할 변경 오류:', error)
    return errorResponse('역할 변경 중 오류가 발생했습니다', 500)
  }
}
