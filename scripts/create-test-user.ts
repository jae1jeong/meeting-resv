import { prisma } from '../packages/backend/lib/prisma'
import { hashPassword } from '../packages/backend/auth/better-auth'
import { Role } from '@prisma/client'

async function createTestUser() {
  const email = 'dev@ndmarket.co.kr'
  const password = 'Test1234!'
  const name = '테스트 관리자'

  // 기존 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('✅ 이미 존재하는 사용자:', email)
    return
  }

  // 그룹 확인 또는 생성
  let group = await prisma.group.findFirst()
  if (!group) {
    console.log('📁 기본 그룹 생성 중...')
    group = await prisma.group.create({
      data: {
        name: '테스트 그룹',
        description: '테스트용 그룹입니다',
        inviteCode: 'TEST123'
      }
    })
    console.log('✅ 그룹 생성 완료:', group.name)
  }

  // 비밀번호 해싱
  const hashedPassword = await hashPassword(password)

  // 트랜잭션으로 사용자 생성
  const user = await prisma.$transaction(async (tx) => {
    // 사용자 생성
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        isAdmin: true,
        emailVerified: true
      }
    })

    // Account 레코드 생성 (Better Auth용 - 비밀번호 포함)
    await tx.account.create({
      data: {
        userId: newUser.id,
        providerId: 'credential',
        accountId: newUser.id,
        password: hashedPassword
      }
    })

    // 그룹 멤버로 추가
    await tx.groupMember.create({
      data: {
        userId: newUser.id,
        groupId: group!.id,
        role: Role.ADMIN
      }
    })

    return newUser
  })

  console.log('✅ 테스트 사용자 생성 완료!')
  console.log({
    email: user.email,
    name: user.name,
    password: password,
    isAdmin: user.isAdmin,
    group: group.name
  })
}

createTestUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
