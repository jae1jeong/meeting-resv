import { redirect } from 'next/navigation'
import { requireAuth } from '@/packages/backend/lib/auth-check'
import { prisma } from '@/packages/backend/lib/prisma'

// Server Component - 서버에서 초기 데이터 로드
export default async function Home() {
  // 서버 사이드에서 인증 체크 및 사용자 정보 가져오기
  const user = await requireAuth()

  // 사용자의 첫 번째 그룹 찾기
  const firstGroup = await prisma.group.findFirst({
    where: {
      members: {
        some: { userId: user.id }
      }
    },
    select: { inviteCode: true },
    orderBy: { createdAt: 'asc' }
  })

  if (firstGroup?.inviteCode) {
    redirect(`/${firstGroup.inviteCode}/rooms`)
  } else {
    // 그룹이 없는 경우 그룹 가입 페이지로
    redirect('/groups/join')
  }
}