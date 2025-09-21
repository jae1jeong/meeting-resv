import { requireAuth } from '@/packages/backend/lib/auth-check'
import { BookingsClient } from './bookings-client'
import { getUserBookings } from '@/packages/backend/lib/server-fetch'

// Server Component - 인증 체크 및 초기 데이터 로드
export default async function BookingsPage() {
  // 서버 사이드에서 인증 체크
  const user = await requireAuth()

  // 서버에서 사용자의 모든 예약 데이터를 로드 (더 넓은 범위)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1) // 지난달부터
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0) // 다다음달까지
  
  const bookings = await getUserBookings(user.id, monthStart, monthEnd)

  return (
    <BookingsClient 
      initialBookings={bookings}
      userId={user.id}
    />
  )
}