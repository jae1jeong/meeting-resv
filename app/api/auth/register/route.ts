import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { hashPassword } from '@/packages/backend/auth/better-auth'
import { validateInviteCode } from '@/packages/backend/lib/group-utils'
import { validateRegisterData } from '@/packages/backend/lib/validation'
import { Role } from '@prisma/client'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Zod를 통한 런타임 타입 검증
    const validatedData = validateRegisterData(body)
    const { email, password, name, groupCode, termsAccepted, privacyAccepted } = validatedData

    // 약관 동의 추가 검증
    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: '서비스 이용약관에 동의해주세요', message: '' },
        { status: 400 }
      )
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { success: false, error: '개인정보 처리방침에 동의해주세요', message: '' },
        { status: 400 }
      )
    }

    // 그룹 초대 코드 검증
    const group = await validateInviteCode(groupCode)
    if (!group) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 초대 코드입니다', message: '' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 가입된 이메일입니다', message: '' },
        { status: 409 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // 트랜잭션으로 사용자, Account, 그룹 멤버 동시 생성
    const user = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const newUser = await tx.user.create({
        data: {
          email,
          name
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      })

      // Credentials 제공자를 위한 Account 레코드 생성 (비밀번호 포함)
      await tx.account.create({
        data: {
          userId: newUser.id,
          providerId: 'credential',
          accountId: newUser.id,
          password: hashedPassword
        }
      })

      // 그룹 멤버로 자동 추가
      await tx.groupMember.create({
        data: {
          userId: newUser.id,
          groupId: group.id,
          role: Role.MEMBER
        }
      })

      return newUser
    })

    return NextResponse.json({
      success: true,
      message: `회원가입이 완료되었습니다. ${group.name} 그룹에 자동으로 참여되었습니다.`,
      data: {
        user,
        group: {
          id: group.id,
          name: group.name,
          description: group.description
        }
      }
    }, { status: 201 })

  } catch (error: unknown) {
    console.error('Registration error:', error)
    
    // Zod 검증 오류 처리
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0]?.message || '입력 데이터가 유효하지 않습니다'
      return NextResponse.json(
        { success: false, error: errorMessage, message: '' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다', message: '' },
      { status: 500 }
    )
  }
}