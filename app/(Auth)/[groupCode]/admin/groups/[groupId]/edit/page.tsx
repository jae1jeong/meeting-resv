import { notFound } from 'next/navigation'
import { requireAuth, requireAdmin } from '@/packages/backend/lib/auth-check'
import { prisma } from '@/packages/backend/lib/prisma'
import GroupEditClient from './group-edit-client'

interface GroupEditPageProps {
  params: Promise<{
    groupId: string
  }>
}

export default async function GroupEditPage({ params }: GroupEditPageProps) {
  // 인증 및 어드민 권한 체크
  const user = await requireAuth()
  await requireAdmin()

  const { groupId } = await params

  // 그룹 정보 조회
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      description: true,
      backgroundImage: true,
      backgroundBlur: true,
      backgroundOpacity: true,
      backgroundPosition: true,
      _count: {
        select: {
          members: true,
          rooms: true
        }
      }
    }
  })

  if (!group) {
    notFound()
  }

  return <GroupEditClient group={group} />
}