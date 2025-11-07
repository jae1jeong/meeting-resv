import { redirect } from 'next/navigation'
import { requireAuth } from '@/packages/backend/lib/auth-check'
import { RoomsClient } from './rooms-client'
import { getUserRooms, getUserBookings } from '@/packages/backend/lib/server-fetch'
import { parseDateParams, getWeekRange } from '@/packages/shared/utils/date-utils'
import { prisma } from '@/packages/backend/lib/prisma'

interface RoomsPageProps {
  params: Promise<{ groupCode: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Server Component - 인증 체크 및 초기 데이터 로드
export default async function RoomsPage({ params, searchParams }: RoomsPageProps) {
  // 서버 사이드에서 인증 체크
  const user = await requireAuth()

  if (!user) {
    redirect('/login')
  }

  const { groupCode } = await params
  const searchParamsResolved = await searchParams

  // groupCode로 그룹 조회
  const group = await prisma.group.findFirst({
    where: {
      inviteCode: groupCode.toUpperCase(),
      members: {
        some: {
          userId: user.id
        }
      }
    }
  })

  if (!group) {
    // 그룹이 없거나 멤버가 아닌 경우 첫 번째 그룹으로 리다이렉트
    const firstGroup = await prisma.group.findFirst({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
      select: { inviteCode: true }
    })

    if (firstGroup?.inviteCode) {
      redirect(`/${firstGroup.inviteCode}/rooms`)
    } else {
      redirect('/groups/join')
    }
  }

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

  // 서버에서 현재 그룹의 회의실과 예약 데이터를 미리 로드
  const [rooms, bookings] = await Promise.all([
    getUserRooms(user.id),
    getUserBookings(user.id, weekRange.start, weekRange.end)
  ])

  // 현재 그룹의 회의실만 필터링
  const groupRooms = rooms.filter(room => room.groupId === group.id)

  return (
    <RoomsClient
      initialRooms={groupRooms}
      initialBookings={bookings}
      initialSelectedDate={selectedDate}
      userId={user.id}
      groupCode={groupCode}
    />
  )
}