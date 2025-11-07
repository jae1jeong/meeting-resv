import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import AdminRoomsClient from './rooms-client'

async function fetchRooms() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/rooms`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : []
  }
  return []
}

async function fetchRoomStats() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/rooms/stats`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : null
  }
  return null
}

async function fetchGroups() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/groups`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : []
  }
  return []
}

export default async function AdminRoomsPage() {
  // 어드민 권한 체크
  await requireAdmin()

  // 서버에서 데이터 패칭 (병렬 처리)
  const [rooms, stats, groupsData] = await Promise.all([
    fetchRooms(),
    fetchRoomStats(),
    fetchGroups()
  ])

  // 그룹 정보 간소화
  const groups = groupsData.map((g: any) => ({
    id: g.id,
    name: g.name
  }))

  return (
    <AdminRoomsClient
      initialRooms={rooms}
      stats={stats || { totalRooms: 0, totalCapacity: 0, monthlyBookings: 0, averageUtilization: 0 }}
      groups={groups}
    />
  )
}