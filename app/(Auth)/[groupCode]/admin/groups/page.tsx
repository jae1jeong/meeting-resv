import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import AdminGroupsClient from './groups-client'

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

export default async function AdminGroupsPage() {
  // 어드민 권한 체크
  await requireAdmin()

  // 서버에서 데이터 패칭
  const groups = await fetchGroups()

  return <AdminGroupsClient initialGroups={groups} />
}