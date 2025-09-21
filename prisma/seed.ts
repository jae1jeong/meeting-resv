import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 초대 코드 생성 함수 (기존 generateUniqueInviteCode와 동일)
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateUniqueInviteCode(): Promise<string> {
  let code: string
  let isUnique = false
  
  while (!isUnique) {
    code = generateInviteCode()
    const existingGroup = await prisma.group.findUnique({
      where: { inviteCode: code }
    })
    isUnique = !existingGroup
  }
  
  return code!
}

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')
  
  try {
    // 1. 테스트 사용자 생성 또는 조회
    console.log('👤 테스트 사용자 생성 중...')
    const hashedPassword = await bcrypt.hash('Test1234!', 12)
    
    const user = await prisma.user.upsert({
      where: { email: 'nd@ndmarket.co.kr' },
      update: {},
      create: {
        email: 'nd@ndmarket.co.kr',
        password: hashedPassword,
        name: '남도마켓 관리자',
      },
    })
    console.log(`✅ 사용자 생성됨: ${user.email} (ID: ${user.id})`)

    // 2. 남도마켓 그룹 생성
    console.log('🏢 남도마켓 그룹 생성 중...')
    
    // 기존 그룹 확인
    let group = await prisma.group.findFirst({
      where: { name: '남도마켓' },
      include: { members: true }
    })
    
    if (!group) {
      const inviteCode = await generateUniqueInviteCode()
      group = await prisma.group.create({
        data: {
          name: '남도마켓',
          description: '남도마켓 팀 회의실 예약 그룹',
          inviteCode: inviteCode,
          codeExpiresAt: null, // 무제한 유효
          members: {
            create: {
              userId: user.id,
              role: 'ADMIN'
            }
          }
        },
        include: {
          members: true
        }
      })
    }
    console.log(`✅ 그룹 생성됨: ${group.name} (초대 코드: ${group.inviteCode})`)

    // 3. 회의실 2개 생성
    console.log('🏛️ 회의실 생성 중...')
    
    // 1회의실
    let room1 = await prisma.meetingRoom.findFirst({
      where: { 
        groupId: group.id,
        name: '1회의실'
      }
    })
    
    if (!room1) {
      room1 = await prisma.meetingRoom.create({
        data: {
          name: '1회의실',
          capacity: 10,
          location: '1층',
          groupId: group.id,
        },
      })
    }
    console.log(`✅ 회의실 생성됨: ${room1.name} (수용 인원: ${room1.capacity}명)`)

    // 2회의실
    let room2 = await prisma.meetingRoom.findFirst({
      where: { 
        groupId: group.id,
        name: '2회의실'
      }
    })
    
    if (!room2) {
      room2 = await prisma.meetingRoom.create({
        data: {
          name: '2회의실',
          capacity: 6,
          location: '2층',
          groupId: group.id,
        },
      })
    }
    console.log(`✅ 회의실 생성됨: ${room2.name} (수용 인원: ${room2.capacity}명)`)

    console.log('\n🎉 시드 데이터 생성 완료!')
    console.log('='.repeat(50))
    console.log('📋 생성된 데이터:')
    console.log(`👤 사용자: ${user.email} / 비밀번호: Test1234!`)
    console.log(`🏢 그룹: ${group.name}`)
    console.log(`🔑 초대 코드: ${group.inviteCode} (무제한 유효)`)
    console.log(`🏛️ 회의실: ${room1.name} (${room1.capacity}명), ${room2.name} (${room2.capacity}명)`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })