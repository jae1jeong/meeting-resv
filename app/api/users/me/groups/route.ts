import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/packages/backend/auth/better-auth'
import { prisma } from '@/packages/backend/lib/prisma'

/**
 * 현재 사용자의 그룹 목록 조회
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 사용자가 속한 그룹 목록 조회
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        members: {
          where: { userId: user.id },
          select: { role: true }
        }
      },
      orderBy: {
        createdAt: 'asc' // 첫 번째로 가입한 그룹이 먼저 오도록
      }
    })

    const result = groups.map(group => ({
      id: group.id,
      inviteCode: group.inviteCode,
      name: group.name,
      description: group.description,
      role: group.members[0]?.role
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('그룹 목록 조회 실패:', error)
    return NextResponse.json(
      { error: '그룹 목록을 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
