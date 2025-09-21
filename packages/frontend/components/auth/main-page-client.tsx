'use client'

import Image from "next/image"
import { useRouter } from 'next/navigation'
import { Header } from "@/frontend/components/layout/MainLayout"
import { Sidebar } from "@/frontend/components/layout/MainLayout"
import { CalendarContainer } from "@/frontend/features/calendar/components/calendar-container"
import { SidebarContent } from "@/frontend/features/calendar/components/sidebar-content"
import { GlassCard } from "@/packages/frontend/components/ui/glass-card"
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import { ArrowLeft, MapPin, Users, Wifi, Camera, Coffee, Monitor } from 'lucide-react'

interface GroupBackground {
  id: string
  name: string
  backgroundImage: string | null
  backgroundBlur: number
  backgroundOpacity: number
  backgroundPosition: string
}

interface MainPageClientProps {
  initialBookings?: BookingResponse[]
  initialRooms?: MeetingRoomWithGroup[]
  roomId?: string
  initialRoomInfo?: MeetingRoomWithGroup
  initialStartDate?: Date
  initialEndDate?: Date
  groupBackground?: GroupBackground | null
}

// 편의시설 아이콘 매핑
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Projector': <Monitor className="w-4 h-4" />,
  'Video Conference': <Camera className="w-4 h-4" />,
  'Coffee Machine': <Coffee className="w-4 h-4" />,
}

export function MainPageClient({
  initialBookings = [],
  initialRooms = [],
  roomId,
  initialRoomInfo,
  initialStartDate,
  initialEndDate,
  groupBackground
}: MainPageClientProps) {
  const router = useRouter()
  const currentMonth = "March 2025"
  const isRoomView = !!roomId && !!initialRoomInfo

  // 기본 배경이미지 또는 그룹 배경이미지 사용
  const backgroundImage = groupBackground?.backgroundImage ||
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
  const backgroundBlur = groupBackground?.backgroundBlur ?? 10
  const backgroundOpacity = groupBackground?.backgroundOpacity ?? 0.5
  const backgroundPosition = groupBackground?.backgroundPosition || "center"

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Group Settings */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="object-cover"
          style={{
            objectPosition: backgroundPosition,
            filter: `blur(${backgroundBlur}px)`,
            opacity: backgroundOpacity
          }}
          priority
        />
        {/* 추가 오버레이 */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main className="relative min-h-screen w-full pt-20">
        {isRoomView ? (
          // 회의실 전용 레이아웃
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
            {/* 상단 네비게이션 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-200 text-white/80 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-white/60">
                <span>홈</span>
                <span>/</span>
                <span className="text-white">회의실</span>
              </div>
            </div>

            {/* 회의실 정보 헤더 */}
            <GlassCard className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* 왼쪽: 회의실 기본 정보 */}
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {initialRoomInfo.name}
                    </h1>
                    <div className="flex items-center space-x-4 text-white/60">
                      {initialRoomInfo.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{initialRoomInfo.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>최대 {initialRoomInfo.capacity}명</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 소속 그룹 */}
                  <div className="text-sm text-white/40">
                    {initialRoomInfo.group.name} 그룹
                  </div>
                </div>

                {/* 오른쪽: 편의시설 */}
                {initialRoomInfo.amenities && initialRoomInfo.amenities.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-white/60">편의시설</h3>
                    <div className="flex flex-wrap gap-2">
                      {initialRoomInfo.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/80"
                        >
                          {amenityIcons[amenity] || <div className="w-4 h-4 rounded bg-white/20" />}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* 캘린더 컨테이너 */}
            <div className="flex-1 min-h-0">
              <CalendarContainer 
                roomId={roomId}
                roomInfo={initialRoomInfo}
                initialBookings={initialBookings}
                initialStartDate={initialStartDate}
                initialEndDate={initialEndDate}
              />
            </div>
          </div>
        ) : (
          // 기존 메인 페이지 레이아웃
          <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
            {/* Sidebar */}
            <Sidebar>
              <SidebarContent 
                currentMonth={currentMonth}
                initialRooms={initialRooms}
              />
            </Sidebar>

            {/* Calendar View - Client Component for interactivity */}
            <div className="flex-1 flex flex-col">
              <CalendarContainer 
                initialBookings={initialBookings}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}