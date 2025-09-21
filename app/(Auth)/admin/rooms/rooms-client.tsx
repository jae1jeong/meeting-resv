'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { RoomList } from '@/packages/frontend/components/admin/rooms/room-list'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { Plus, Search, Filter, DoorOpen, Users, Calendar, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteRoom } from '@/packages/backend/actions/admin/room-actions'

interface Room {
  id: string
  name: string
  capacity: number
  location: string | null
  amenities: string[]
  groupId: string
  groupName: string
  bookingCount: number
}

interface Stats {
  totalRooms: number
  totalCapacity: number
  monthlyBookings: number
  averageUtilization: number
}

interface Group {
  id: string
  name: string
}

interface AdminRoomsClientProps {
  initialRooms: Room[]
  stats: Stats
  groups: Group[]
}

export default function AdminRoomsClient({
  initialRooms,
  stats,
  groups
}: AdminRoomsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState('')
  const [rooms, setRooms] = React.useState(initialRooms)

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = !selectedGroup || room.groupId === selectedGroup
    return matchesSearch && matchesGroup
  })

  const handleCreateRoom = () => {
    router.push('/admin/rooms/new')
  }

  const handleEditRoom = (roomId: string) => {
    router.push(`/admin/rooms/${roomId}/edit`)
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('정말로 이 회의실을 삭제하시겠습니까? 관련된 모든 예약도 삭제됩니다.')) {
      try {
        await deleteRoom(roomId)
        // 로컬 상태 업데이트
        setRooms(rooms.filter(r => r.id !== roomId))
      } catch (error) {
        console.error('회의실 삭제 실패:', error)
        alert('회의실 삭제에 실패했습니다.')
      }
    }
  }

  return (
    <div className={cn("space-y-8")}>
      {/* 페이지 헤더 */}
      <div className={cn("flex items-center justify-between")}>
        <div>
          <h1 className={cn(
            "text-3xl font-bold text-white mb-2",
            "bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
          )}>
            회의실 관리
          </h1>
          <p className={cn("text-white/60")}>
            모든 회의실을 관리하고 편의시설을 설정합니다
          </p>
        </div>

        <GlassButton
          onClick={handleCreateRoom}
          className={cn(
            "bg-gradient-to-r from-green-500 to-emerald-500",
            "hover:from-green-600 hover:to-emerald-600"
          )}
          size="md"
          radius="xl"
        >
          <Plus className={cn("w-5 h-5 mr-2")} />
          회의실 추가
        </GlassButton>
      </div>

      {/* 통계 카드 */}
      <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4")}>
        <div className={cn(
          "p-4 rounded-xl",
          "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
          "backdrop-blur-2xl",
          "border border-blue-500/20"
        )}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <DoorOpen className={cn("w-5 h-5 text-blue-400")} />
            <span className={cn("text-2xl font-bold text-white")}>
              {stats.totalRooms}
            </span>
          </div>
          <p className={cn("text-white/60 text-sm")}>전체 회의실</p>
        </div>

        <div className={cn(
          "p-4 rounded-xl",
          "bg-gradient-to-br from-green-500/10 to-emerald-500/10",
          "backdrop-blur-2xl",
          "border border-green-500/20"
        )}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <Users className={cn("w-5 h-5 text-green-400")} />
            <span className={cn("text-2xl font-bold text-white")}>
              {stats.totalCapacity}
            </span>
          </div>
          <p className={cn("text-white/60 text-sm")}>총 수용 인원</p>
        </div>

        <div className={cn(
          "p-4 rounded-xl",
          "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
          "backdrop-blur-2xl",
          "border border-purple-500/20"
        )}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <Calendar className={cn("w-5 h-5 text-purple-400")} />
            <span className={cn("text-2xl font-bold text-white")}>
              {stats.monthlyBookings}
            </span>
          </div>
          <p className={cn("text-white/60 text-sm")}>이번 달 예약</p>
        </div>

        <div className={cn(
          "p-4 rounded-xl",
          "bg-gradient-to-br from-orange-500/10 to-yellow-500/10",
          "backdrop-blur-2xl",
          "border border-orange-500/20"
        )}>
          <div className={cn("flex items-center justify-between mb-2")}>
            <TrendingUp className={cn("w-5 h-5 text-orange-400")} />
            <span className={cn("text-2xl font-bold text-white")}>
              {stats.averageUtilization}%
            </span>
          </div>
          <p className={cn("text-white/60 text-sm")}>평균 이용률</p>
        </div>
      </div>

      {/* 검색 및 필터 바 */}
      <div className={cn(
        "flex items-center space-x-4",
        "p-4 rounded-2xl",
        "bg-white/5 backdrop-blur-2xl",
        "border border-white/10"
      )}>
        <div className={cn("flex-1 relative")}>
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2",
            "w-5 h-5 text-white/40"
          )} />
          <input
            type="text"
            placeholder="회의실 이름 또는 위치로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-12 pr-4 py-3",
              "bg-white/5 backdrop-blur-xl",
              "border border-white/10 rounded-xl",
              "text-white placeholder-white/40",
              "focus:outline-none focus:border-green-500/50",
              "transition-colors duration-200"
            )}
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className={cn(
            "px-4 py-3 rounded-xl",
            "bg-white/5 backdrop-blur-xl",
            "border border-white/10",
            "text-white",
            "focus:outline-none focus:border-green-500/50",
            "transition-colors duration-200"
          )}
        >
          <option value="">모든 그룹</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={cn(
            "p-3 rounded-xl",
            "bg-white/5 backdrop-blur-xl",
            "border border-white/10",
            "hover:bg-white/10 hover:border-white/20",
            "transition-all duration-200"
          )}
        >
          <Filter className={cn("w-5 h-5 text-white/60")} />
        </button>
      </div>

      {/* 필터 옵션 (토글) */}
      {filterOpen && (
        <div className={cn(
          "p-4 rounded-2xl",
          "bg-white/5 backdrop-blur-2xl",
          "border border-white/10",
          "animate-slide-down"
        )}>
          <div className={cn("grid grid-cols-3 gap-4")}>
            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                수용 인원
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-green-500/50"
              )}>
                <option value="">전체</option>
                <option value="1-5">1-5명</option>
                <option value="6-10">6-10명</option>
                <option value="11-20">11-20명</option>
                <option value="20+">20명 이상</option>
              </select>
            </div>

            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                편의시설
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-green-500/50"
              )}>
                <option value="">전체</option>
                <option value="wifi">Wi-Fi</option>
                <option value="monitor">모니터</option>
                <option value="projector">프로젝터</option>
                <option value="video">화상회의</option>
                <option value="coffee">커피머신</option>
              </select>
            </div>

            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                정렬
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-green-500/50"
              )}>
                <option value="name">이름순</option>
                <option value="capacity">수용 인원</option>
                <option value="bookings">예약 수</option>
                <option value="location">위치</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 회의실 목록 */}
      <RoomList
        rooms={filteredRooms}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
      />
    </div>
  )
}