import { prisma } from '../packages/backend/lib/prisma'

async function migratePasswordToAccount() {
  console.log('🔄 User 비밀번호를 Account로 마이그레이션 시작...')

  // User의 password가 있고 credential Account가 있는 모든 사용자 조회
  const users = await prisma.user.findMany({
    where: {
      password: {
        not: null
      }
    },
    include: {
      accounts: {
        where: {
          providerId: 'credential'
        }
      }
    }
  })

  console.log(`📋 마이그레이션 대상 사용자: ${users.length}명`)

  let updatedCount = 0
  let skippedCount = 0

  for (const user of users) {
    const credentialAccount = user.accounts[0]

    if (!credentialAccount) {
      console.log(`⚠️  ${user.email}: credential Account 없음 - 건너뜀`)
      skippedCount++
      continue
    }

    if (credentialAccount.password) {
      console.log(`✓ ${user.email}: Account에 이미 비밀번호 있음 - 건너뜀`)
      skippedCount++
      continue
    }

    // User의 password를 Account로 복사
    await prisma.account.update({
      where: {
        id: credentialAccount.id
      },
      data: {
        password: user.password
      }
    })

    console.log(`✅ ${user.email}: 비밀번호 마이그레이션 완료`)
    updatedCount++
  }

  console.log('\n📊 마이그레이션 결과:')
  console.log(`  ✅ 업데이트: ${updatedCount}명`)
  console.log(`  ⏭️  건너뜀: ${skippedCount}명`)
  console.log('✨ 완료!')
}

migratePasswordToAccount()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
