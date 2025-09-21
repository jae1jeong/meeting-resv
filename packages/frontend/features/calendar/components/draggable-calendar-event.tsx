'use client'

import { cn } from '@/shared/utils/utils'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { User } from 'lucide-react'
import { CalendarEvent } from '../types'
import { CalendarEventProps } from './calendar-event/calendar-event.types'
import {
  calculateEventStyle,
  getEventColorStyle,
} from './week-view/weekview.utils'

interface DraggableCalendarEventProps
  extends Omit<CalendarEventProps, 'event'> {
  event: CalendarEvent
  isDragEnabled?: boolean
}

export function DraggableCalendarEvent({
  event,
  onClick,
  variant = 'default',
  isDragEnabled = true,
}: DraggableCalendarEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.bookingData?.id || event.id}`, // 유니크한 ID 보장
      disabled: !isDragEnabled,
      data: {
        type: 'calendar-event',
        event: event,
      },
    })

  const positionStyle = calculateEventStyle(event.startTime, event.endTime)
  const colorStyle = getEventColorStyle(event.color)

  const style = {
    ...positionStyle,
    ...colorStyle,
    left: '4px',
    right: '4px',
    background: `linear-gradient(135deg, ${colorStyle.backgroundColor}ee, ${colorStyle.backgroundColor}dd)`,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    // 드래그 중일 때는 원본은 완전히 숨김
    ...(isDragging
      ? {
          visibility: 'hidden' as const, // visibility로 완전히 숨김
          pointerEvents: 'none' as const, // 포인터 이벤트 차단
        }
      : {
          transform: CSS.Transform.toString(transform), // 드래그 중이 아닐 때만 transform 적용
        }),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'absolute rounded-lg p-2.5 text-white text-xs shadow-lg backdrop-blur-sm',
        event.color,
        // 드래그 중이 아닐 때만 transition 적용
        !isDragging && 'transition-all duration-200 ease-in-out',
        isDragging && 'z-50', // 드래그 중 z-index
        isDragEnabled &&
          !isDragging &&
          'hover:translate-y-[-2px] hover:shadow-xl hover:z-10 cursor-grab',
        isDragEnabled && isDragging && 'cursor-grabbing',
        !isDragEnabled && 'cursor-pointer'
      )}
      onClick={() => onClick && onClick(event)}
    >
      {/* 드래그 중일 때는 내부 콘텐츠 렌더링 안 함 */}
      {!isDragging ? (
        <>
          {/* 드래그 핸들 표시 */}
          {isDragEnabled && (
            <div
              className={cn(
                'absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'
              )}
            >
              <div className={cn('flex space-x-0.5')}>
                <div className={cn('w-1 h-1 bg-white/40 rounded-full')}></div>
                <div className={cn('w-1 h-1 bg-white/40 rounded-full')}></div>
                <div className={cn('w-1 h-1 bg-white/40 rounded-full')}></div>
              </div>
            </div>
          )}

          <div className={cn('font-semibold text-[11px] mb-1')}>
            {event.title}
          </div>

          {/* 주최자 정보 */}
          <div className={cn('flex items-center space-x-1 mb-1 opacity-80')}>
            <User className={cn('w-3 h-3')} />
            <span className={cn('text-[9px] truncate')}>{event.organizer}</span>
          </div>

          {variant !== 'compact' && (
            <div className={cn('opacity-90 text-[10px]')}>
              {`${event.startTime} - ${event.endTime}`}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
