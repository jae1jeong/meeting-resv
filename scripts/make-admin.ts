import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  try {
    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('\n현재 등록된 사용자 목록:')
    console.log('================================')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || '이름 없음'} (${user.email || 'email 없음'})`)
      console.log(`   ID: ${user.id}`)
      console.log(`   가입일: ${user.createdAt.toLocaleDateString('ko-KR')}`)
      console.log('--------------------------------')
    })

    if (users.length === 0) {
      console.log('등록된 사용자가 없습니다.')
      return
    }

    // 첫 번째 사용자를 admin으로 설정 (보통 테스트 계정)
    const targetUser = users[0] // 첫 번째 사용자 선택

    console.log(`\n${targetUser.name || targetUser.email}님을 Admin으로 승급시킵니다...`)

    // User 테이블에는 isAdmin 필드가 없으므로,
    // 별도의 admin 처리가 필요한 경우 여기에 구현
    // 현재는 session/auth 레벨에서 처리하는 것으로 보임

    // 대안: 특별한 그룹을 만들고 ADMIN 역할 부여
    const adminGroup = await prisma.group.findFirst({
      where: {
        name: 'System Administrators'
      }
    })

    if (adminGroup) {
      // 이미 admin 그룹이 있으면 멤버로 추가
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: targetUser.id,
            groupId: adminGroup.id
          }
        }
      })

      if (!existingMember) {
        await prisma.groupMember.create({
          data: {
            userId: targetUser.id,
            groupId: adminGroup.id,
            role: 'ADMIN'
          }
        })
        console.log('✅ System Administrators 그룹에 ADMIN으로 추가되었습니다.')
      } else {
        // 역할을 ADMIN으로 업데이트
        await prisma.groupMember.update({
          where: {
            id: existingMember.id
          },
          data: {
            role: 'ADMIN'
          }
        })
        console.log('✅ System Administrators 그룹에서 ADMIN 역할로 업데이트되었습니다.')
      }
    } else {
      // admin 그룹이 없으면 생성
      const newAdminGroup = await prisma.group.create({
        data: {
          name: 'System Administrators',
          description: '시스템 관리자 그룹',
          inviteCode: 'ADMIN01',
          members: {
            create: {
              userId: targetUser.id,
              role: 'ADMIN'
            }
          }
        }
      })
      console.log('✅ System Administrators 그룹이 생성되고 ADMIN으로 추가되었습니다.')
    }

    // 환경 변수로 admin 이메일 설정 (선택사항)
    console.log('\n💡 팁: .env 파일에 다음을 추가하여 admin 권한을 영구 설정할 수 있습니다:')
    console.log(`ADMIN_EMAIL="${targetUser.email}"`)

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()