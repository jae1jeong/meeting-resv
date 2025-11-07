import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import GroupDetailClient from './group-detail-client'

async function fetchGroupDetail(groupId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/groups/${groupId}/detail`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : null
  }
  return null
}

async function fetchGroupMembers(groupId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/groups/${groupId}/members`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : []
  }
  return []
}

interface PageProps {
  params: Promise<{
    groupId: string
  }>
}

export default async function GroupDetailPage({ params }: PageProps) {
  // 어드민 권한 체크
  await requireAdmin()

  // Next.js 15에서 params는 Promise
  const { groupId } = await params

  // 서버에서 데이터 패칭 (병렬 처리)
  const [group, members] = await Promise.all([
    fetchGroupDetail(groupId),
    fetchGroupMembers(groupId)
  ])

  if (!group) {
    return <div>그룹을 찾을 수 없습니다</div>
  }

  return (
    <GroupDetailClient
      group={group}
      members={members}
      groupId={groupId}
    />
  )
}