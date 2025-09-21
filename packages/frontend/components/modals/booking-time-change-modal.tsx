'use client'

import React from 'react'
import { GlassModal } from '@/packages/frontend/components/ui/glass-modal'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { Clock, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/shared/utils/utils'
import { parseKSTDate } from '@/packages/shared/utils/date-utils'

interface BookingTimeChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  bookingTitle: string
  originalTime: {
    date: string
    startTime: string
    endTime: string
  }
  newTime: {
    date: string
    startTime: string
    endTime: string
  }
  isLoading?: boolean
  isChecking?: boolean
}

export function BookingTimeChangeModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  bookingTitle,
  originalTime,
  newTime,
  isLoading = false,
  isChecking = false
}: BookingTimeChangeModalProps) {
  const formatDate = (dateStr: string) => {
    const date = parseKSTDate(dateStr) // KST 날짜로 파싱
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM 형식으로 변환
  }

  if (isChecking) {
    return (
      <GlassModal isOpen={isOpen} onClose={onClose}>
        <div className={cn("w-full max-w-md mx-auto p-6 text-center")}>
          <div className={cn("mb-6")}>
            <div className={cn("w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4")}>
              <Loader2 className={cn("w-8 h-8 text-blue-400 animate-spin")} />
            </div>
            <h3 className={cn("text-xl font-bold text-white mb-2")}>시간 확인 중</h3>
            <p className={cn("text-white/60")}>
              새로운 시간대에 예약 가능한지 확인하고 있습니다...
            </p>
          </div>
        </div>
      </GlassModal>
    )
  }

  return (
    <GlassModal isOpen={isOpen} onClose={onClose}>
      <div className={cn("w-full max-w-md mx-auto p-6")}>
        {/* 헤더 */}
        <div className={cn("mb-6 text-center")}>
          <div className={cn("w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4")}>
            <Clock className={cn("w-8 h-8 text-orange-400")} />
          </div>
          <h3 className={cn("text-xl font-bold text-white mb-2")}>예약 시간 변경</h3>
          <p className={cn("text-white/60 text-sm")}>
            예약 시간을 변경하시겠습니까?
          </p>
        </div>

        {/* 예약 정보 */}
        <div className={cn("mb-6")}>
          <div className={cn("bg-white/5 rounded-xl p-4 mb-4")}>
            <h4 className={cn("text-white font-medium mb-2")}>{bookingTitle}</h4>
            
            {/* 기존 시간 */}
            <div className={cn("mb-3")}>
              <div className={cn("text-white/60 text-xs mb-1")}>기존 시간</div>
              <div className={cn("flex items-center space-x-2 text-white/80 text-sm")}>
                <Calendar className={cn("w-4 h-4")} />
                <span>{formatDate(originalTime.date)}</span>
                <Clock className={cn("w-4 h-4 ml-2")} />
                <span>{formatTime(originalTime.startTime)} - {formatTime(originalTime.endTime)}</span>
              </div>
            </div>

            {/* 화살표 */}
            <div className={cn("text-center mb-3")}>
              <div className={cn("text-white/40")}>↓</div>
            </div>

            {/* 새로운 시간 */}
            <div>
              <div className={cn("text-white/60 text-xs mb-1")}>변경될 시간</div>
              <div className={cn("flex items-center space-x-2 text-white text-sm font-medium")}>
                <Calendar className={cn("w-4 h-4")} />
                <span>{formatDate(newTime.date)}</span>
                <Clock className={cn("w-4 h-4 ml-2")} />
                <span className={cn("text-blue-400")}>
                  {formatTime(newTime.startTime)} - {formatTime(newTime.endTime)}
                </span>
              </div>
            </div>
          </div>

          <div className={cn("bg-blue-500/10 border border-blue-500/20 rounded-lg p-3")}>
            <p className={cn("text-blue-200 text-xs text-center")}>
              해당 시간대에 다른 예약이 없어 변경 가능합니다
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className={cn("flex space-x-3")}>
          <GlassButton
            onClick={onCancel}
            variant="ghost"
            className={cn("flex-1 border-white/20 text-white/80 hover:bg-white/10")}
            radius="xl"
            size="md"
            disabled={isLoading}
          >
            취소
          </GlassButton>
          
          <GlassButton
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white")}
            radius="xl"
            size="md"
          >
            {isLoading ? (
              <div className={cn("flex items-center space-x-2")}>
                <Loader2 className={cn("w-4 h-4 animate-spin")} />
                <span>변경 중...</span>
              </div>
            ) : (
              '변경'
            )}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  )
}