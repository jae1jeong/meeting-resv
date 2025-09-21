'use client'

import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { GlassModal } from '@/packages/frontend/components/ui/glass-modal'
import { BookingService } from '@/packages/frontend/services/booking.service'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import { cn } from '@/packages/shared/utils/utils'
import {
  Calendar,
  Clock,
  Edit2,
  Loader2,
  MapPin,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/packages/frontend/contexts/auth-context'
import { CalendarEvent } from '../../types'

interface EventDetailsProps {
  event: CalendarEvent
  currentMonth: string
  onClose: () => void
  onEventUpdated?: (updatedBooking?: BookingResponse) => void
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

// 날짜 계산 함수가 필요하면 UTC 기반 헬퍼를 사용할 수 있습니다

export default function EventDetails({
  event,
  currentMonth,
  onClose,
  onEventUpdated,
}: EventDetailsProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

  // 현재 사용자가 예약 생성자인지 확인
  const isOwner =
    event.bookingData && user?.id === event.bookingData.creator.id

  const handleDelete = async () => {
    if (!event.bookingData) return

    setIsDeleting(true)
    try {
      const result = await BookingService.deleteBooking(event.bookingData.id)

      if (result.success) {
        setIsConfirmDeleteOpen(false)
        onClose()
        onEventUpdated?.() // 캘린더 새로고침
      } else {
        alert(result.error?.message || '예약 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('예약 삭제 오류:', error)
      alert('예약 삭제 중 오류가 발생했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    // TODO: 예약 수정 모달 구현
    alert('예약 수정 기능은 추후 구현 예정입니다')
  }

  return (
    <>
      <GlassModal isOpen={true} onClose={onClose}>
        <div className={cn('w-full max-w-md mx-auto p-6')}>
          {/* 헤더 */}
          <div className={cn('mb-6 text-center')}>
            <div
              className={cn(
                'w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4'
              )}
            >
              <Calendar className={cn('w-8 h-8 text-blue-400')} />
            </div>
            <h3 className={cn('text-xl font-bold text-white mb-2')}>
              {event.title}
            </h3>
            <p className={cn('text-white/60 text-sm')}>예약 상세 정보</p>
          </div>

          {/* 예약 정보 */}
          <div className={cn('mb-6')}>
            <div className={cn('bg-white/5 rounded-xl p-4 space-y-3')}>
              <div
                className={cn(
                  'flex items-center space-x-2 text-white/80 text-sm'
                )}
              >
                <Clock className={cn('w-4 h-4 text-white/60')} />
                <span>{`${event.startTime} - ${event.endTime}`}</span>
              </div>

              <div
                className={cn(
                  'flex items-center space-x-2 text-white/80 text-sm'
                )}
              >
                <MapPin className={cn('w-4 h-4 text-white/60')} />
                <span>{event.location}</span>
              </div>

              <div
                className={cn(
                  'flex items-center space-x-2 text-white/80 text-sm'
                )}
              >
                <Calendar className={cn('w-4 h-4 text-white/60')} />
                <span>
                  {(() => {
                    // bookingData가 있으면 실제 날짜 사용, 없으면 기존 로직 사용
                    if (event.bookingData?.date) {
                      // BookingResponse의 date는 항상 string ('YYYY-MM-DD')
                      const [year, month, day] = event.bookingData.date
                        .split('-')
                        .map(Number)
                      // 로컬 타임존 영향을 제거하기 위해 UTC 기준으로 요일 계산
                      const utcDate = new Date(Date.UTC(year, month - 1, day))
                      const dayOfWeek = utcDate.getUTCDay()
                      return `${WEEK_DAYS[dayOfWeek]}요일, ${currentMonth}`
                    }
                    return `${WEEK_DAYS[event.day - 1]}요일, ${currentMonth}`
                  })()}
                </span>
              </div>

              {event.attendees && event.attendees.length > 0 && (
                <div className={cn('flex items-start space-x-2')}>
                  <Users className={cn('w-4 h-4 text-white/60 mt-0.5')} />
                  <div>
                    <div className={cn('text-white/60 text-xs mb-1')}>
                      참여자
                    </div>
                    <div className={cn('text-white/80 text-sm')}>
                      {event.attendees.join(', ')}
                    </div>
                  </div>
                </div>
              )}

              <div className={cn('flex items-start space-x-2')}>
                <Users className={cn('w-4 h-4 text-white/60 mt-0.5')} />
                <div>
                  <div className={cn('text-white/60 text-xs mb-1')}>주최자</div>
                  <div className={cn('text-white/80 text-sm')}>
                    {event.organizer}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className={cn('pt-2 border-t border-white/10')}>
                  <div className={cn('text-white/60 text-xs mb-1')}>설명</div>
                  <div className={cn('text-white/80 text-sm')}>
                    {event.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className={cn('flex space-x-3')}>
            {isOwner && (
              <>
                <GlassButton
                  onClick={handleEdit}
                  variant="ghost"
                  className={cn(
                    'flex-1 border-white/20 text-white/80 hover:bg-white/10'
                  )}
                  radius="xl"
                  size="md"
                >
                  <Edit2 className={cn('w-4 h-4 mr-2')} />
                  수정
                </GlassButton>

                <GlassButton
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  variant="ghost"
                  className={cn(
                    'flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10'
                  )}
                  radius="xl"
                  size="md"
                >
                  <Trash2 className={cn('w-4 h-4 mr-2')} />
                  삭제
                </GlassButton>
              </>
            )}

            <GlassButton
              onClick={onClose}
              className={cn(
                isOwner ? 'flex-1' : 'w-full',
                'bg-blue-600 hover:bg-blue-700 text-white'
              )}
              radius="xl"
              size="md"
            >
              닫기
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* 삭제 확인 모달 */}
      <GlassModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
      >
        <div className={cn('w-full max-w-md mx-auto p-6 text-center')}>
          <div className={cn('mb-6')}>
            <div
              className={cn(
                'w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4'
              )}
            >
              <Trash2 className={cn('w-8 h-8 text-red-400')} />
            </div>
            <h3 className={cn('text-xl font-bold text-white mb-2')}>
              예약 삭제
            </h3>
            <p className={cn('text-white/60')}>
              {event.title} 예약을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <div className={cn('flex space-x-3')}>
            <GlassButton
              onClick={() => setIsConfirmDeleteOpen(false)}
              variant="ghost"
              className={cn(
                'flex-1 border-white/20 text-white/80 hover:bg-white/10'
              )}
              radius="xl"
              size="md"
              disabled={isDeleting}
            >
              취소
            </GlassButton>

            <GlassButton
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                'flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white'
              )}
              radius="xl"
              size="md"
            >
              {isDeleting ? (
                <div className={cn('flex items-center space-x-2')}>
                  <Loader2 className={cn('w-4 h-4 animate-spin')} />
                  <span>삭제 중...</span>
                </div>
              ) : (
                '삭제'
              )}
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </>
  )
}
