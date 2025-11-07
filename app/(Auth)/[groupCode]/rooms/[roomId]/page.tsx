import { notFound } from 'next/navigation'
import { requireAuth } from '@/packages/backend/lib/auth-check'
import { MainPageClient } from '@/packages/frontend/components/auth/main-page-client'
import { getRoomWithAuth, getRoomBookings } from '@/packages/backend/lib/server-fetch'
import { parseDateParams, getWeekRange } from '@/packages/shared/utils/date-utils'

interface RoomPageProps {
  params: Promise<{
    roomId: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Server Component - 인증 체크 및 초기 데이터 로드
export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  // 서버 사이드에서 인증 체크
  const user = await requireAuth()

  const { roomId } = await params
  const searchParamsResolved = await searchParams

  // URL 파라미터에서 날짜 정보 파싱
  const urlSearchParams = new URLSearchParams(
    Object.entries(searchParamsResolved).reduce((acc, [key, value]) => {
      if (typeof value === 'string') acc[key] = value
      else if (Array.isArray(value)) acc[key] = value[0]
      return acc
    }, {} as Record<string, string>)
  )
  
  const { startDate, endDate } = parseDateParams(urlSearchParams)
  
  // 날짜가 지정되지 않았으면 현재 주로 설정
  let queryStartDate = startDate
  let queryEndDate = endDate
  
  if (!queryStartDate || !queryEndDate) {
    const weekRange = getWeekRange(new Date())
    queryStartDate = weekRange.start
    queryEndDate = weekRange.end
  }

  // 서버에서 회의실 정보와 예약 데이터를 미리 로드
  const [roomInfo, bookings, groupBackground] = await Promise.all([
    getRoomWithAuth(roomId, user.id),
    getRoomBookings(roomId, user.id, queryStartDate, queryEndDate),
    (async () => {
      try {
        // 서버 사이드에서 API 호출
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/rooms/${roomId}/group-background`, {
          cache: 'no-store'
        })
        if (response.ok) {
          const result = await response.json()
          return result.success ? result.data : null
        }
        return null
      } catch {
        return null
      }
    })()
  ])

  // 회의실이 존재하지 않거나 접근 권한이 없으면 404
  if (!roomInfo) {
    notFound()
  }

  return (
    <MainPageClient
      roomId={roomId}
      initialRoomInfo={roomInfo}
      initialBookings={bookings}
      initialStartDate={queryStartDate}
      initialEndDate={queryEndDate}
      groupBackground={groupBackground?.group}
    />
  )
}