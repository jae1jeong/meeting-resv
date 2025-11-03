import Image from "next/image"
import { redirect } from 'next/navigation'
import { requireAuth } from '@/packages/backend/lib/auth-check'
import { prisma } from '@/packages/backend/lib/prisma'
import { GroupProvider } from '@/packages/frontend/contexts/group-context'

interface GroupLayoutProps {
  children: React.ReactNode
  params: Promise<{ groupCode: string }>
}

export default async function GroupLayout({ children, params }: GroupLayoutProps) {
  // 인증 확인
  const user = await requireAuth()

  // params 해결
  const { groupCode } = await params

  // groupCode로 그룹 조회 및 멤버십 확인
  const group = await prisma.group.findFirst({
    where: {
      slug: groupCode,
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
    }
  })

  // 그룹이 없거나 사용자가 멤버가 아닌 경우
  if (!group || group.members.length === 0) {
    // 사용자의 첫 번째 그룹으로 리다이렉트
    const firstGroup = await prisma.group.findFirst({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
      select: { slug: true }
    })

    if (firstGroup?.slug) {
      redirect(`/${firstGroup.slug}/rooms`)
    } else {
      // 그룹이 없는 경우 그룹 생성/가입 페이지로
      redirect('/groups/join')
    }
  }

  // 사용자의 모든 그룹 목록 조회
  const userGroups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: user.id }
      }
    },
    include: {
      members: {
        where: { userId: user.id },
        select: { role: true }
      }
    }
  })

  const currentGroup = {
    id: group.id,
    slug: group.slug!,
    name: group.name,
    description: group.description,
    role: group.members[0].role
  }

  const allUserGroups = userGroups.map(g => ({
    id: g.id,
    slug: g.slug!,
    name: g.name,
    description: g.description,
    role: g.members[0].role
  }))

  return (
    <GroupProvider initialGroup={currentGroup} initialUserGroups={allUserGroups}>
      <div className="flex">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
        {children}
      </div>
    </GroupProvider>
  )
}