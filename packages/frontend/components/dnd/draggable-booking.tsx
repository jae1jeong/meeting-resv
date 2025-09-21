'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/shared/utils/utils'
import { Clock, MapPin, Users } from 'lucide-react'

interface DraggableBookingProps {
  id: string
  title: string
  startTime: string
  endTime: string
  location?: string
  attendees?: number
  color?: string
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function DraggableBooking({
  id,
  title,
  startTime,
  endTime,
  location,
  attendees,
  color = 'bg-blue-500/20 border-blue-500/40',
  disabled = false,
  className,
  onClick
}: DraggableBookingProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    disabled
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'relative p-3 rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer select-none',
        color,
        isDragging && 'z-50 scale-105 shadow-2xl bg-white/20',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:scale-[1.02] hover:shadow-lg',
        className
      )}
    >
      {/* 드래그 인디케이터 */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-white/50 rounded-xl pointer-events-none animate-pulse" />
      )}

      <div className="space-y-2">
        {/* 제목 */}
        <h4 className="font-medium text-white text-sm truncate">
          {title}
        </h4>

        {/* 시간 */}
        <div className="flex items-center space-x-1 text-xs text-white/70">
          <Clock className="w-3 h-3" />
          <span>{startTime} - {endTime}</span>
        </div>

        {/* 추가 정보 */}
        <div className="flex items-center justify-between text-xs text-white/60">
          {location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          )}
          
          {attendees && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{attendees}명</span>
            </div>
          )}
        </div>
      </div>

      {/* 드래그 가능 상태 표시 */}
      {!disabled && !isDragging && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-white/40 rounded-full"></div>
        </div>
      )}
    </div>
  )
}