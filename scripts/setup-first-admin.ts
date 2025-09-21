import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupFirstAdmin() {
  try {
    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('\n🔍 현재 등록된 사용자 목록:')
    console.log('================================')

    if (users.length === 0) {
      console.log('❌ 등록된 사용자가 없습니다.')
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || '이름 없음'} (${user.email || 'email 없음'})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Admin: ${user.isAdmin ? '✅ Yes' : '❌ No'}`)
      console.log(`   가입일: ${user.createdAt.toLocaleDateString('ko-KR')}`)
      console.log('--------------------------------')
    })

    // 이미 admin이 있는지 확인
    const existingAdmins = users.filter(u => u.isAdmin)
    if (existingAdmins.length > 0) {
      console.log(`\n✅ 이미 ${existingAdmins.length}명의 Admin이 있습니다.`)
      return
    }

    // 첫 번째 사용자를 admin으로 설정
    const firstUser = users[0]
    console.log(`\n🎯 ${firstUser.name || firstUser.email}님을 Admin으로 승급시킵니다...`)

    const updatedUser = await prisma.user.update({
      where: {
        id: firstUser.id
      },
      data: {
        isAdmin: true
      }
    })

    console.log(`✅ ${updatedUser.name || updatedUser.email}님이 Admin으로 설정되었습니다!`)
    console.log('\n이제 /admin 페이지에 접근할 수 있습니다.')

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupFirstAdmin()