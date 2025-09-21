"use client"

import { cn } from '@/shared/utils/utils'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import React from 'react'
import { User } from 'lucide-react'
import { DraggableCalendarEvent } from '../draggable-calendar-event'
import { CalendarEvent } from '../../types'
import { WeekViewProps } from './weekview.types'
import { formatTime, generateTimeSlots, getEventColorStyle } from './weekview.utils'

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]

// 드롭 가능한 시간 슬롯 컴포넌트
interface DroppableTimeSlotProps {
  dayIndex: number
  timeSlot: string
  onEmptySlotClick?: (day: number, time: string) => void
  hasConflict?: boolean
}

function DroppableTimeSlot({ dayIndex, timeSlot, onEmptySlotClick, hasConflict = false }: DroppableTimeSlotProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${dayIndex}-${timeSlot}`,
    disabled: hasConflict, // 충돌 시 드롭 비활성화
    data: {
      type: 'time-slot',
      dayIndex: dayIndex,
      timeSlot: timeSlot
    }
  })

  const getSlotStyle = () => {
    if (hasConflict) {
      return 'cursor-not-allowed bg-red-500/10 hover:bg-red-500/15'
    }
    if (isOver) {
      return 'bg-blue-500/20 border-blue-500/30'
    }
    return 'hover:bg-white/5'
  }

  const getSlotTitle = () => {
    if (hasConflict) {
      return "이미 예약이 있어 사용할 수 없습니다"
    }
    if (isOver) {
      return "여기에 예약을 이동하시겠습니까?"
    }
    return "클릭해서 예약 생성"
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-[80px] border-b border-white/10 transition-colors relative',
        getSlotStyle(),
        hasConflict ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      onClick={() => !hasConflict && onEmptySlotClick?.(dayIndex + 1, timeSlot)}
      title={getSlotTitle()}
    >
      {isOver && !hasConflict && (
        <div className={cn("absolute inset-2 border-2 border-dashed border-blue-400/50 rounded-lg flex items-center justify-center")}>
          <span className={cn("text-blue-200 text-xs font-medium")}>
            이동
          </span>
        </div>
      )}
      
      {hasConflict && (
        <div className={cn("absolute inset-0 flex items-center justify-center")}>
          <div className={cn("w-2 h-2 bg-red-400/60 rounded-full")}></div>
        </div>
      )}
    </div>
  )
}

// currentDate를 기준으로 한 주의 날짜들 계산
const getWeekDates = (currentDate: Date) => {
  const start = new Date(currentDate)
  const day = start.getDay() // 0 = 일요일
  start.setDate(start.getDate() - day) // 주의 시작 (일요일)
  
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    dates.push(date.getDate())
  }
  return dates
}

export function WeekView({
  events,
  onEventClick,
  onEmptySlotClick,
  onEventDragEnd,
  currentDate,
  isLoaded = true,
  isDragEnabled = true
}: WeekViewProps) {
  const timeSlots = generateTimeSlots()
  const weekDates = getWeekDates(currentDate)
  const today = new Date().getDate()
  const [activeEvent, setActiveEvent] = React.useState<CalendarEvent | null>(null)

  // 시간 슬롯 충돌 체크 함수
  const hasTimeSlotConflict = (dayIndex: number, timeSlot: string): boolean => {
    const targetDay = dayIndex + 1 // 1-7 형식으로 변환
    const slotHour = parseInt(timeSlot)
    
    return events.some(event => {
      if (event.day !== targetDay) return false
      
      const eventStartHour = parseInt(event.startTime.split(':')[0])
      const eventEndHour = parseInt(event.endTime.split(':')[0])
      const eventEndMinutes = parseInt(event.endTime.split(':')[1])
      
      // 시간이 겹치는지 확인 (종료 시간이 00분이면 그 시간은 제외)
      const eventActualEndHour = eventEndMinutes === 0 ? eventEndHour : eventEndHour + 1
      
      return slotHour >= eventStartHour && slotHour < eventActualEndHour
    })
  }

  // 드래그 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // 4px 이상 움직여야 드래그 시작 (반응성 향상)
      },
    })
  )

  const handleDragStart = (event: any) => {
    const draggedEvent = event.active.data.current?.event
    if (draggedEvent) {
      setActiveEvent(draggedEvent)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEvent(null)
    
    const { active, over } = event
    
    if (!over || !active.data.current?.event) {
      return
    }

    const draggedEvent = active.data.current.event as CalendarEvent
    const dropData = over.data.current
    
    if (dropData?.type === 'time-slot') {
      const newDay = dropData.dayIndex // 0-based 인덱스 그대로 사용
      const newTimeSlot = dropData.timeSlot

      // 같은 위치에 드롭한 경우 무시 (draggedEvent.day는 1-based이므로 비교 시 조정)
      if (draggedEvent.day === newDay + 1 && draggedEvent.startTime === newTimeSlot) {
        return
      }

      onEventDragEnd?.(draggedEvent, newDay, newTimeSlot)
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col p-4")}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={cn("glass-card flex flex-col h-full")}>
        {/* Week Header - Fixed at top */}
        <div className={cn(
          "grid grid-cols-8",
          "liquid-glass border-b border-white/30",
          "shadow-lg flex-shrink-0"
        )}>
          <div className={cn("p-3 text-center")}></div>
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className={cn(
              "p-3 text-center border-l border-white/20",
              "transition-all duration-300 hover:bg-white/5"
            )}>
              <div className={cn("text-xs text-white/80 font-semibold mb-1")}>{day}</div>
              <div
                className={cn(
                  "text-lg font-bold transition-all duration-300",
                  weekDates[i] === today
                    ? "bg-blue-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30"
                    : "text-white/90 hover:text-white"
                )}
              >
                {weekDates[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid - Scrollable */}
        <div className={cn("flex-1 overflow-auto relative")}>
          <div className={cn("grid grid-cols-8")}>
            {/* Time Labels - Fixed Left */}
            <div className={cn(
              "text-white/70",
              "bg-black/50 backdrop-blur-sm border-r border-white/20"
            )}>
              {timeSlots.map((time, i) => (
                <div key={i} className={cn(
                  "h-[80px] border-b border-white/10 px-3",
                  "text-right text-xs flex items-start justify-end pt-2",
                  "font-semibold text-white/80"
                )}>
                  {formatTime(time)}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div key={dayIndex} className={cn("border-l border-white/20 relative")}>
                {timeSlots.map((timeSlot, timeIndex) => (
                  <DroppableTimeSlot
                    key={timeIndex}
                    dayIndex={dayIndex}
                    timeSlot={timeSlot.toString()}
                    onEmptySlotClick={onEmptySlotClick}
                    hasConflict={hasTimeSlotConflict(dayIndex, timeSlot.toString())}
                  />
                ))}

                {/* Events */}
                {events
                  .filter((event) => event.day === dayIndex + 1)
                  .map((event) => (
                    <DraggableCalendarEvent
                      key={event.id}
                      event={event}
                      onClick={onEventClick}
                      isDragEnabled={isDragEnabled}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* DragOverlay for drag preview */}
        <DragOverlay
          dropAnimation={null} // 드롭 애니메이션 제거로 즉각 반응
        >
          {activeEvent ? (
            <div
              className="cursor-grabbing pointer-events-none rounded-lg p-2.5 text-white text-xs shadow-2xl backdrop-blur-sm"
              style={{
                backgroundColor: getEventColorStyle(activeEvent.color).backgroundColor + 'ee',
                background: `linear-gradient(135deg, ${getEventColorStyle(activeEvent.color).backgroundColor}ee, ${getEventColorStyle(activeEvent.color).backgroundColor}dd)`,
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                minWidth: '120px',
              }}
            >
              <div className="font-semibold text-[11px] mb-1">{activeEvent.title}</div>

              {/* 주최자 정보 추가 */}
              <div className="flex items-center space-x-1 mb-1 opacity-80">
                <User className="w-3 h-3" />
                <span className="text-[9px] truncate">{activeEvent.organizer}</span>
              </div>

              <div className="opacity-90 text-[10px]">
                {`${activeEvent.startTime} - ${activeEvent.endTime}`}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}


