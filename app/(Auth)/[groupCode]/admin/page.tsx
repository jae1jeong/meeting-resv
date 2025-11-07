import React from 'react'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import AdminDashboardClient from './admin-dashboard-client'

export default async function AdminDashboard() {
  // 어드민 권한 체크
  await requireAdmin()
  // TODO: 실제 데이터는 서버에서 가져오기
  const stats = {
    totalUsers: 156,
    totalGroups: 12,
    totalRooms: 24,
    totalBookings: 342,
    activeBookings: 18,
    todayBookings: 7,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3
  }

  return <AdminDashboardClient stats={stats} />
}