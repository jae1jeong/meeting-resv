import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { hashPassword } from '@/packages/backend/auth/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 가입된 이메일입니다' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // 트랜잭션으로 사용자와 Account 동시 생성
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })

      // Credentials 제공자를 위한 Account 레코드 생성
      await tx.account.create({
        data: {
          userId: newUser.id,
          provider: 'credentials',
          providerAccountId: newUser.id,
          type: 'credentials'
        }
      })

      return newUser
    })

    return NextResponse.json({
      message: '회원가입이 완료되었습니다',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}