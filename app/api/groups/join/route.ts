import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/packages/backend/auth/auth'
import { validateInviteCode } from '@/packages/backend/lib/group-utils'
import { prisma } from '@/packages/backend/lib/prisma'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { Role } from '@prisma/client'

// 요청 스키마
const joinGroupSchema = z.object({
  inviteCode: z.string().length(6, '초대 코드는 6자리여야 합니다')
})

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('로그인이 필요합니다', 401)
    }

    // 요청 본문 파싱 및 검증
    const body = await request.json()
    const validation = joinGroupSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse('입력값이 올바르지 않습니다', 400)
    }

    const { inviteCode } = validation.data

    // 초대 코드 유효성 검증
    const group = await validateInviteCode(inviteCode)
    if (!group) {
      return errorResponse('유효하지 않은 초대 코드입니다', 400)
    }

    // 이미 그룹 멤버인지 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: group.id
        }
      }
    })

    if (existingMember) {
      return errorResponse('이미 해당 그룹의 멤버입니다', 400)
    }

    // 그룹에 멤버로 추가
    const newMember = await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId: group.id,
        role: Role.MEMBER
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    })

    return successResponse({
      member: newMember,
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group._count.members + 1 // 새로 추가된 멤버 포함
      }
    })

  } catch (error) {
    console.error('그룹 참여 오류:', error)
    return errorResponse('서버 오류가 발생했습니다', 500)
  }
}

// 초대 코드로 그룹 정보 미리보기 (참여하기 전에 그룹명 확인용)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('로그인이 필요합니다', 401)
    }

    const { searchParams } = new URL(request.url)
    const inviteCode = searchParams.get('code')

    if (!inviteCode || inviteCode.length !== 6) {
      return errorResponse('유효한 초대 코드를 입력해주세요', 400)
    }

    // 초대 코드 유효성 검증
    const group = await validateInviteCode(inviteCode)
    if (!group) {
      return errorResponse('유효하지 않은 초대 코드입니다', 400)
    }

    // 이미 멤버인지 확인
    const isMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: group.id
        }
      }
    })

    return successResponse({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group._count.members,
        isMember: !!isMember
      }
    })

  } catch (error) {
    console.error('그룹 정보 조회 오류:', error)
    return errorResponse('서버 오류가 발생했습니다', 500)
  }
}