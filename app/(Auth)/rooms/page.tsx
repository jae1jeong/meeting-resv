import { redirect } from 'next/navigation'
import { requireAuth } from '@/packages/backend/lib/auth-check'
import { RoomsClient } from './rooms-client'
import { getUserRooms, getUserBookings } from '@/packages/backend/lib/server-fetch'
import { parseDateParams, getWeekRange } from '@/packages/shared/utils/date-utils'

interface RoomsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Server Component - 인증 체크 및 초기 데이터 로드
export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  // 서버 사이드에서 인증 체크
  const user = await requireAuth()

  if (!user) {
    redirect('/login')
  }

  const searchParamsResolved = await searchParams

  // URL 파라미터에서 날짜 정보 파싱
  const urlSearchParams = new URLSearchParams(
    Object.entries(searchParamsResolved).reduce((acc, [key, value]) => {
      if (typeof value === 'string') acc[key] = value
      else if (Array.isArray(value)) acc[key] = value[0]
      return acc
    }, {} as Record<string, string>)
  )
  
  const { date } = parseDateParams(urlSearchParams)
  
  // 날짜가 지정되지 않았으면 현재 날짜로 설정
  const selectedDate = date || new Date()
  const weekRange = getWeekRange(selectedDate)

  // 서버에서 사용자의 회의실과 예약 데이터를 미리 로드
  const [rooms, bookings] = await Promise.all([
    getUserRooms(user.id),
    getUserBookings(user.id, weekRange.start, weekRange.end)
  ])

  return (
    <RoomsClient
      initialRooms={rooms}
      initialBookings={bookings}
      initialSelectedDate={selectedDate}
      userId={user.id}
    />
  )
}