'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LiquidContainer } from '@/packages/frontend/components/ui/liquid-container'
import { GlassCard } from '@/packages/frontend/components/ui/glass-card'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { ArrowLeft, MapPin, Users, Wifi, Camera, Coffee, Monitor, Clock, Calendar } from 'lucide-react'
import { cn } from '@/packages/frontend/lib/utils'

interface RoomsClientProps {
  initialRooms: MeetingRoomWithGroup[]
  initialBookings?: BookingResponse[]
  initialSelectedDate?: Date
  userId: string
  groupCode: string
}

// 편의시설 아이콘 매핑
const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Projector': <Monitor className="w-4 h-4" />,
  'Video Conference': <Camera className="w-4 h-4" />,
  'Coffee Machine': <Coffee className="w-4 h-4" />,
}

// 회의실 카드 컴포넌트
function RoomCard({ room, onClick }: { 
  room: MeetingRoomWithGroup
  onClick: () => void 
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-xl"
      )}
    >
      <GlassCard 
        className={cn(
          "p-6 border border-white/20 backdrop-blur-xl hover:bg-white/10"
        )}
      >
      <div className="space-y-4">
        {/* 회의실 기본 정보 */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{room.name}</h3>
            <div className="flex items-center space-x-4 text-white/60 text-sm">
              {room.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{room.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>최대 {room.capacity}명</span>
              </div>
            </div>
          </div>
          
          {/* 상태 표시 */}
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">사용 가능</span>
          </div>
        </div>

        {/* 그룹 정보 */}
        <div className="text-sm text-white/40">
          {room.group.name} 그룹
        </div>

        {/* 편의시설 */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80"
                >
                  {amenityIcons[amenity] || <div className="w-3 h-3 rounded bg-white/20" />}
                  <span>{amenity}</span>
                </div>
              ))}
              {room.amenities.length > 4 && (
                <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                  +{room.amenities.length - 4}개 더
                </div>
              )}
            </div>
          </div>
        )}

        {/* 빠른 액션 버튼들 */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-4 text-white/60 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>예약 보기</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>빠른 예약</span>
            </div>
          </div>
          <div className="text-white/40 text-xs">
            클릭하여 상세보기
          </div>
        </div>
      </div>
      </GlassCard>
    </div>
  )
}

export function RoomsClient({ 
  initialRooms, 
  initialBookings = [],
  initialSelectedDate,
  userId,
  groupCode
}: RoomsClientProps) {
  const router = useRouter()
  const [rooms, setRooms] = useState<MeetingRoomWithGroup[]>(initialRooms)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')

  // 그룹 목록 추출
  const groups = Array.from(new Set(rooms.map(room => room.group.name)))

  // 필터링된 회의실 목록
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroup === 'all' || room.group.name === selectedGroup
    
    return matchesSearch && matchesGroup
  })

  // 회의실 클릭 핸들러
  const handleRoomClick = (roomId: string) => {
    router.push(`/${groupCode}/rooms/${roomId}`)
  }

  return (
    <LiquidContainer className={cn("min-h-screen p-6")}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className={cn(
                "p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10",
                "backdrop-blur-sm transition-all duration-200 text-white/80 hover:text-white"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-white/60">
              <span>홈</span>
              <span>/</span>
              <span className="text-white">회의실</span>
            </div>
          </div>
          
          {/* 통계 정보 */}
          <div className="text-white/60 text-sm">
            총 {rooms.length}개의 회의실
          </div>
        </div>

        {/* 페이지 헤더 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">회의실 목록</h1>
          <p className="text-white/60 text-lg">사용 가능한 회의실을 찾아보세요</p>
        </div>

        {/* 검색 및 필터 */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="회의실 이름이나 위치로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
                  "text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "backdrop-blur-sm transition-all duration-200"
                )}
              />
            </div>
            
            {/* 그룹 필터 */}
            <div className="md:w-48">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
                  "text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "backdrop-blur-sm transition-all duration-200"
                )}
              >
                <option value="all">모든 그룹</option>
                {groups.map(group => (
                  <option key={group} value={group} className="bg-gray-800">
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* 회의실 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={() => handleRoomClick(room.id)}
              />
            ))
          ) : (
            <div className="col-span-full">
              <GlassCard className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-white/40" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">회의실을 찾을 수 없습니다</h3>
                  <p className="text-white/60">
                    검색 조건을 변경하거나 관리자에게 회의실 추가를 요청해보세요.
                  </p>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* 푸터 정보 */}
        <div className="text-center text-white/40 text-sm pt-8">
          회의실 예약은 30분 단위로 가능합니다
        </div>
      </div>
    </LiquidContainer>
  )
}