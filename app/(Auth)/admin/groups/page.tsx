import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { getGroups } from '@/packages/backend/actions/admin/group-actions'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import AdminGroupsClient from './groups-client'

export default async function AdminGroupsPage() {
  // 어드민 권한 체크
  await requireAdmin()

  // 서버에서 데이터 패칭
  const groups = await getGroups()

  return <AdminGroupsClient initialGroups={groups} />
}