import { NextRequest } from 'next/server'
import { getSession } from '@/packages/backend/auth/auth'
import { prisma } from '@/packages/backend/lib/prisma'
import { regenerateInviteCode, disableInviteCode } from '@/packages/backend/lib/group-utils'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'

// GET /api/groups/[id]/invite-code - 그룹 초대 코드 조회 (관리자만)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('로그인이 필요합니다', 401)
    }

    // 관리자 권한 확인
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('관리자 권한이 필요합니다', 403)
    }

    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        inviteCode: true,
        codeExpiresAt: true
      }
    })

    if (!group) {
      return errorResponse('그룹을 찾을 수 없습니다', 404)
    }

    const isCodeExpired = group.codeExpiresAt && group.codeExpiresAt < new Date()

    return successResponse({
      inviteCode: group.inviteCode,
      expiresAt: group.codeExpiresAt,
      isExpired: isCodeExpired,
      isActive: !!(group.inviteCode && !isCodeExpired)
    })

  } catch (error) {
    console.error('초대 코드 조회 오류:', error)
    return errorResponse('서버 오류가 발생했습니다', 500)
  }
}

// POST /api/groups/[id]/invite-code - 초대 코드 재생성 (관리자만)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('로그인이 필요합니다', 401)
    }

    // 관리자 권한 확인
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('관리자 권한이 필요합니다', 403)
    }

    const body = await request.json()
    const expiresInDays = body.expiresInDays || 30

    const updatedGroup = await regenerateInviteCode(id, expiresInDays)

    return successResponse({
      inviteCode: updatedGroup.inviteCode!,
      expiresAt: updatedGroup.codeExpiresAt
    })

  } catch (error) {
    console.error('초대 코드 재생성 오류:', error)
    return errorResponse('초대 코드 생성에 실패했습니다', 500)
  }
}

// DELETE /api/groups/[id]/invite-code - 초대 코드 비활성화 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('로그인이 필요합니다', 401)
    }

    // 관리자 권한 확인
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: id
        }
      }
    })

    if (!membership || membership.role !== 'ADMIN') {
      return errorResponse('관리자 권한이 필요합니다', 403)
    }

    await disableInviteCode(id)

    return successResponse({
      message: '초대 코드가 비활성화되었습니다'
    })

  } catch (error) {
    console.error('초대 코드 비활성화 오류:', error)
    return errorResponse('서버 오류가 발생했습니다', 500)
  }
}