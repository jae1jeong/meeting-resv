import { prisma } from '../packages/backend/lib/prisma'

async function checkUser() {
  const email = 'dev@ndmarket.co.kr'

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true,
      groupMemberships: true
    }
  })

  if (!user) {
    console.log(`❌ 사용자를 찾을 수 없습니다: ${email}`)
    return
  }

  console.log('✅ 사용자 발견:')
  console.log({
    id: user.id,
    email: user.email,
    name: user.name,
    hasPassword: !!user.password,
    passwordLength: user.password?.length,
    isAdmin: user.isAdmin,
    emailVerified: user.emailVerified,
    accountsCount: user.accounts.length,
    accounts: user.accounts.map(a => ({
      provider: a.providerId,
      accountId: a.accountId
    })),
    groupsCount: user.groupMemberships.length
  })
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
