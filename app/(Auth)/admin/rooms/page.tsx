import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { getRooms, getRoomStats } from '@/packages/backend/actions/admin/room-actions'
import { getGroups } from '@/packages/backend/actions/admin/group-actions'
import AdminRoomsClient from './rooms-client'

export default async function AdminRoomsPage() {
  // 어드민 권한 체크
  await requireAdmin()

  // 서버에서 데이터 패칭 (병렬 처리)
  const [rooms, stats, groupsData] = await Promise.all([
    getRooms(),
    getRoomStats(),
    getGroups()
  ])

  // 그룹 정보 간소화
  const groups = groupsData.map(g => ({
    id: g.id,
    name: g.name
  }))

  return (
    <AdminRoomsClient
      initialRooms={rooms}
      stats={stats}
      groups={groups}
    />
  )
}