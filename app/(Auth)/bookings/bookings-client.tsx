'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiquidContainer } from '@/packages/frontend/components/ui/liquid-container'
import { GlassCard } from '@/packages/frontend/components/ui/glass-card'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { ArrowLeft, Calendar, MapPin, Users, Clock, Edit3, Trash2, MoreVertical } from 'lucide-react'
import { cn } from '@/packages/frontend/lib/utils'

interface BookingsClientProps {
  initialBookings: BookingResponse[]
  userId: string
}

// 예약 상태별 색상 매핑
const getStatusColor = (date: string | Date, startTime: string) => {
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
  const bookingDateTime = new Date(`${dateStr}T${startTime}`)
  const now = new Date()
  
  if (bookingDateTime < now) {
    return 'bg-gray-500/20 border-gray-400/30 text-gray-300' // 과거
  } else if (bookingDateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'bg-orange-500/20 border-orange-400/30 text-orange-300' // 오늘/내일
  } else {
    return 'bg-green-500/20 border-green-400/30 text-green-300' // 미래
  }
}

// 예약 카드 컴포넌트
function BookingCard({ booking, onEdit, onDelete }: { 
  booking: BookingResponse
  onEdit: (booking: BookingResponse) => void
  onDelete: (booking: BookingResponse) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const statusColor = getStatusColor(booking.date, booking.startTime)
  
  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? '오후' : '오전'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${ampm} ${displayHour}:${minutes}`
  }

  return (
    <GlassCard className="p-6 relative">
      <div className="space-y-4">
        {/* 헤더: 제목과 액션 버튼 */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{booking.title}</h3>
            {booking.description && (
              <p className="text-white/60 text-sm">{booking.description}</p>
            )}
          </div>
          
          {/* 상태 및 액션 */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              statusColor
            )}>
              {getStatusColor(booking.date, booking.startTime).includes('gray') ? '완료됨' : 
               getStatusColor(booking.date, booking.startTime).includes('orange') ? '임박' : '예정'}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white/60" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-12 w-32 py-2 bg-gray-800 rounded-lg border border-white/20 backdrop-blur-xl z-10">
                  <button
                    onClick={() => {
                      onEdit(booking)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(booking)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-red-300 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 예약 세부 정보 */}
        <div className="space-y-3">
          {/* 날짜 및 시간 */}
          <div className="flex items-center space-x-4 text-white/70">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
            </div>
          </div>

          {/* 회의실 정보 */}
          {booking.room && (
            <div className="flex items-center space-x-2 text-white/70">
              <MapPin className="w-4 h-4" />
              <span>{booking.room.name}</span>
              {booking.room.location && (
                <span className="text-white/50">({booking.room.location})</span>
              )}
            </div>
          )}

          {/* 참가자 정보 */}
          {booking.participants && booking.participants.length > 0 && (
            <div className="flex items-center space-x-2 text-white/70">
              <Users className="w-4 h-4" />
              <span>
                {booking.participants.length}명 참가 
                {booking.participants.length <= 3 && (
                  <span className="ml-1">
                    ({booking.participants.map(p => p.user.name).join(', ')})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* 생성자 정보 */}
        <div className="pt-3 border-t border-white/10 text-sm text-white/40">
          {booking.creator?.name ? `${booking.creator.name}님이 생성` : '시스템 생성'}
        </div>
      </div>
    </GlassCard>
  )
}

export function BookingsClient({ initialBookings, userId }: BookingsClientProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingResponse[]>(initialBookings)
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 필터링된 예약 목록
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.room?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (filterStatus === 'all') return true
    
    const dateStr = typeof booking.date === 'string' ? booking.date : booking.date.toISOString().split('T')[0]
    const bookingDateTime = new Date(`${dateStr}T${booking.startTime}`)
    const now = new Date()
    
    if (filterStatus === 'upcoming') {
      return bookingDateTime >= now
    } else {
      return bookingDateTime < now
    }
  })

  // 날짜순 정렬
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateStrA = typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0]
    const dateStrB = typeof b.date === 'string' ? b.date : b.date.toISOString().split('T')[0]
    const dateA = new Date(`${dateStrA}T${a.startTime}`)
    const dateB = new Date(`${dateStrB}T${b.startTime}`)
    return dateB.getTime() - dateA.getTime() // 최신순
  })

  // 예약 수정 핸들러
  const handleEdit = (booking: BookingResponse) => {
    // TODO: 예약 수정 모달 열기
    console.log('예약 수정:', booking)
  }

  // 예약 삭제 핸들러
  const handleDelete = (booking: BookingResponse) => {
    // TODO: 예약 삭제 확인 모달 열기
    console.log('예약 삭제:', booking)
  }

  return (
    <LiquidContainer className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
              <span className="text-white">예약 관리</span>
            </div>
          </div>
          
          {/* 통계 정보 */}
          <div className="text-white/60 text-sm">
            총 {bookings.length}개의 예약
          </div>
        </div>

        {/* 페이지 헤더 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">예약 관리</h1>
          <p className="text-white/60 text-lg">내 예약을 확인하고 관리하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="예약명, 회의실명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
                  "text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "backdrop-blur-sm transition-all duration-200"
                )}
              />
            </div>
            
            {/* 상태 필터 */}
            <div className="md:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20",
                  "text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                  "backdrop-blur-sm transition-all duration-200"
                )}
              >
                <option value="all" className="bg-gray-800">모든 예약</option>
                <option value="upcoming" className="bg-gray-800">예정된 예약</option>
                <option value="past" className="bg-gray-800">지난 예약</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* 예약 목록 */}
        <div className="space-y-4">
          {sortedBookings.length > 0 ? (
            sortedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <GlassCard className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-xl font-semibold text-white">예약이 없습니다</h3>
                <p className="text-white/60">
                  {filterStatus === 'all' ? '아직 예약이 없습니다. 새로운 예약을 만들어보세요.' :
                   filterStatus === 'upcoming' ? '예정된 예약이 없습니다.' :
                   '지난 예약이 없습니다.'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className={cn(
                    "px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600",
                    "hover:from-blue-700 hover:to-purple-700 text-white font-medium",
                    "transition-all duration-200"
                  )}
                >
                  새 예약 만들기
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </LiquidContainer>
  )
}