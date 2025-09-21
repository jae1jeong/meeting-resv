'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarContainer } from '@/packages/frontend/features/calendar/components/calendar-container'
import { GlassCard } from '@/packages/frontend/components/ui/glass-card'
import { LiquidContainer } from '@/packages/frontend/components/ui/liquid-container'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { ArrowLeft, MapPin, Users, Wifi, Camera, Coffee, Monitor } from 'lucide-react'

interface RoomCalendarClientProps {
  roomId: string
  initialRoomInfo: MeetingRoomWithGroup
  initialBookings: BookingResponse[]
}

// 편의시설 아이콘 매핑
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Projector': <Monitor className="w-4 h-4" />,
  'Video Conference': <Camera className="w-4 h-4" />,
  'Coffee Machine': <Coffee className="w-4 h-4" />,
}

export function RoomCalendarClient({ 
  roomId, 
  initialRoomInfo, 
  initialBookings 
}: RoomCalendarClientProps) {
  const router = useRouter()

  // 메인 UI - 서버에서 데이터를 전달받으므로 즉시 렌더링
  return (
    <LiquidContainer className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
        <CalendarContainer 
          roomId={roomId}
          roomInfo={initialRoomInfo}
          initialBookings={initialBookings}
        />
      </div>
    </LiquidContainer>
  )
}