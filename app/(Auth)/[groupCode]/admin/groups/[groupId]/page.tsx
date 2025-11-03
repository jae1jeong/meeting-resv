import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { getGroupDetail, getGroupMembers } from '@/packages/backend/actions/admin/member-actions'
import GroupDetailClient from './group-detail-client'

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
    getGroupDetail(groupId),
    getGroupMembers(groupId)
  ])

  return (
    <GroupDetailClient
      group={group}
      members={members}
      groupId={groupId}
    />
  )
}