import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { getGroupDetail, getGroupMembers } from '@/packages/backend/actions/admin/member-actions'
import GroupDetailClient from './group-detail-client'

interface PageProps {
  params: {
    groupId: string
  }
}

export default async function GroupDetailPage({ params }: PageProps) {
  // 어드민 권한 체크
  await requireAdmin()

  // 서버에서 데이터 패칭 (병렬 처리)
  const [group, members] = await Promise.all([
    getGroupDetail(params.groupId),
    getGroupMembers(params.groupId)
  ])

  return (
    <GroupDetailClient
      group={group}
      members={members}
      groupId={params.groupId}
    />
  )
}