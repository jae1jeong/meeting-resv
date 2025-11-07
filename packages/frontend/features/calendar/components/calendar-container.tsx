'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WeekView } from './week-view'
import { useCalendar } from '../hooks/useCalendar'
import CalendarControls from './calendar-controls/calendar-controls'
import EventDetails from './event-details/event-details'
import { BookingCreateModal } from '@/packages/frontend/components/bookings/booking-create-modal'
import { BookingTimeChangeModal } from '@/packages/frontend/components/modals/booking-time-change-modal'
import { BookingService } from '@/packages/frontend/services/booking.service'
import { CalendarEvent } from '../types'
import type { BookingResponse } from '@/packages/shared/types/api/booking'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import {
  formatDateForURL,
  getWeekRange,
  toKSTDateString,
  parseKSTDate,
  isSameDay,
  getWeekDates,
} from '@/packages/shared/utils/date-utils'
import { Plus } from 'lucide-react'

interface CalendarContainerProps {
  initialEvents?: CalendarEvent[]
  roomId?: string
  roomInfo?: MeetingRoomWithGroup
  initialBookings?: BookingResponse[]
  initialStartDate?: Date
  initialEndDate?: Date
}

// BookingResponse를 CalendarEvent로 변환
const convertBookingToCalendarEvent = (
  booking: BookingResponse,
  dayIndex: number
): CalendarEvent => {
  return {
    id: booking.id, // UUID 문자열 그대로 사용
    title: booking.title,
    startTime: booking.startTime, // "HH:mm" 형식
    endTime: booking.endTime,
    color: booking.color, // DB에서 저장된 색상 사용
    day: dayIndex + 1, // 1-7 (일-토)
    description: booking.description || '',
    location: booking.room?.name || '',
    attendees: booking.participants?.map((p) => p.user.name || '') || [],
    organizer: booking.creator?.name || '',
    bookingData: booking, // 원본 데이터 보관
  }
}

// getWeekDates 함수는 date-utils.ts에서 import하여 사용

export function CalendarContainer({
  initialEvents = [],
  roomId,
  roomInfo,
  initialBookings = [],
  initialStartDate,
  initialEndDate,
}: CalendarContainerProps) {
  const router = useRouter()

  // 초기 날짜 설정: props로 받은 날짜가 있으면 사용, 없으면 현재 날짜
  const initialCurrentDate = initialStartDate || new Date()

  const {
    currentView,
    currentMonth,
    currentDate,
    selectedEvent,
    handleEventClick,
    closeEventDetails,
    changeView,
    navigateToToday,
    navigateToPreviousWeek,
    navigateToNextWeek,
  } = useCalendar(initialCurrentDate)

  // 로컬 예약 상태 관리 (Optimistic UI를 위함)
  const [localBookings, setLocalBookings] =
    useState<BookingResponse[]>(initialBookings)

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    // 서버에서 전달받은 예약 데이터가 있으면 변환해서 초기값으로 설정
    if (initialBookings.length > 0) {
      const weekDates = getWeekDates(currentDate) // currentDate 사용
      const calendarEvents: CalendarEvent[] = []

      initialBookings.forEach((booking) => {
        const bookingDate =
          typeof booking.date === 'string'
            ? parseKSTDate(booking.date as string)
            : new Date(booking.date)
        const dayIndex = weekDates.findIndex(
          (date) => isSameDay(date, bookingDate) // isSameDay 함수 사용
        )

        if (dayIndex !== -1) {
          calendarEvents.push(convertBookingToCalendarEvent(booking, dayIndex))
        }
      })

      return calendarEvents
    }

    return initialEvents
  })
  const [isLoading, setIsLoading] = useState(() => {
    // 초기 데이터가 없고, roomId가 있을 때만 로딩 상태로 시작
    // 메인 페이지에서는 서버 데이터를 그대로 사용하므로 로딩하지 않음
    return initialBookings.length === 0 && !!roomId
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createModalInitialData, setCreateModalInitialData] = useState<{
    date?: Date
    startTime?: string
    endTime?: string
  }>({})

  // DnD 관련 상태
  const [isTimeChangeModalOpen, setIsTimeChangeModalOpen] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [newTimeSlot, setNewTimeSlot] = useState<{
    day: number
    timeSlot: string
    date: string
  } | null>(null)
  const [originalEventPosition, setOriginalEventPosition] = useState<{
    day: number
    startTime: string
    endTime: string
  } | null>(null)

  // 예약 데이터를 이벤트로 변환하는 헬퍼 함수
  const convertBookingsToEvents = (
    bookings: BookingResponse[],
    weekDates: Date[]
  ): CalendarEvent[] => {
    const calendarEvents: CalendarEvent[] = []

    bookings.forEach((booking) => {
      const bookingDate =
        typeof booking.date === 'string'
          ? parseKSTDate(booking.date as string)
          : new Date(booking.date)
      console.log(`📅 [CONVERT] ${booking.title}:`)
      console.log('  - booking.date:', booking.date)
      console.log('  - bookingDate:', bookingDate)
      console.log(
        '  - weekDates:',
        weekDates.map((d) => toKSTDateString(d))
      )

      const dayIndex = weekDates.findIndex((date) =>
        isSameDay(date, bookingDate)
      )
      console.log('  - dayIndex:', dayIndex)

      if (dayIndex !== -1) {
        calendarEvents.push(convertBookingToCalendarEvent(booking, dayIndex))
      }
    })

    return calendarEvents
  }

  // 로컬 상태 업데이트 함수 (Optimistic UI)
  const updateLocalBooking = (updatedBooking: BookingResponse) => {
    // 함수형 업데이트 사용 (클로저 문제 방지)
    setLocalBookings((prev) => {
      const updatedBookings = prev.map((booking) =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      )

      // 이벤트도 즉시 업데이트 (최신 상태 사용)
      const weekDates = getWeekDates(currentDate)
      const calendarEvents = convertBookingsToEvents(updatedBookings, weekDates)
      setEvents(calendarEvents)

      return updatedBookings
    })
  }

  // 로컬 상태 추가 함수 (Optimistic UI)
  const addLocalBooking = (newBooking: BookingResponse) => {
    // 함수형 업데이트 사용 (클로저 문제 방지)
    setLocalBookings((prevBookings) => {
      // 중복 방지
      if (prevBookings.some((b) => b.id === newBooking.id)) {
        return prevBookings
      }
      const updatedBookings = [...prevBookings, newBooking]

      // 이벤트도 즉시 업데이트 (로딩 없이)
      const weekDates = getWeekDates(currentDate)
      const calendarEvents = convertBookingsToEvents(updatedBookings, weekDates)
      setEvents(calendarEvents)

      return updatedBookings
    })
  }

  // 예약 데이터 로드 (날짜 변경 시에만 호출)
  const loadBookings = async (forceReload = false, silent = false) => {
    // 초기 데이터가 있고 강제 리로드가 아니면 API 호출하지 않음
    if (!forceReload && localBookings.length > 0) {
      return
    }

    // silent 모드가 아니면 로딩 표시
    if (!silent) {
      setIsLoading(true)
    }

    try {
      const weekDates = getWeekDates(currentDate) // currentDate 사용
      const startDate = weekDates[0]
      const endDate = weekDates[6]

      let response
      if (roomId) {
        // 특정 회의실의 예약만 조회
        response = await BookingService.getRoomBookings(
          roomId,
          toKSTDateString(startDate),
          toKSTDateString(endDate)
        )
      } else {
        // 모든 예약 조회
        response = await BookingService.getBookingsForDateRange(
          startDate,
          endDate
        )
      }

      if (response.success && response.data) {
        const bookings = response.data // 서버 액션은 직접 배열을 반환

        // 로컬 상태 업데이트
        setLocalBookings(bookings)

        // 이벤트 변환 및 설정
        const calendarEvents = convertBookingsToEvents(bookings, weekDates)
        setEvents(calendarEvents)
      }
    } catch (error) {
      console.error('예약 데이터 로드 오류:', error)
      // 에러 시 초기 이벤트 사용
      setEvents(initialEvents)
    } finally {
      // silent 모드가 아니면 로딩 해제
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  // 로컬 상태가 변경되면 이벤트 업데이트
  useEffect(() => {
    const weekDates = getWeekDates(currentDate)
    const calendarEvents = convertBookingsToEvents(localBookings, weekDates)
    setEvents(calendarEvents)
  }, [localBookings, currentDate])

  // 날짜 변경 시 URL 업데이트 및 데이터 리로드
  useEffect(() => {
    console.log('📅 [CALENDAR] 현재 날짜:', currentDate)
    console.log('📅 [CALENDAR] 주간 날짜들:', getWeekDates(currentDate))

    // URL 업데이트
    const updateURL = () => {
      const weekRange = getWeekRange(currentDate)
      const currentPath = window.location.pathname

      if (roomId) {
        // rooms/[roomId] 페이지의 경우 startDate, endDate로 업데이트
        const params = new URLSearchParams()
        params.set('startDate', formatDateForURL(weekRange.start))
        params.set('endDate', formatDateForURL(weekRange.end))
        router.replace(`${currentPath}?${params.toString()}`, { scroll: false })
      } else {
        // rooms 페이지의 경우 date로 업데이트
        const params = new URLSearchParams()
        params.set('date', formatDateForURL(currentDate))
        router.replace(`${currentPath}?${params.toString()}`, { scroll: false })
      }
    }

    // 초기 로드 체크: initialStartDate가 있고 현재 날짜와 동일한 경우만 초기 로드로 판단
    const isInitialLoad =
      initialStartDate &&
      Math.abs(currentDate.getTime() - initialStartDate.getTime()) <
        24 * 60 * 60 * 1000 // 24시간 이내

    // 초기 로드가 아니거나 initialStartDate가 없는 경우 URL 업데이트
    if (!isInitialLoad || !initialStartDate) {
      updateURL()
    }

    // 초기 데이터가 없거나 날짜가 변경된 경우 데이터 리로드
    if (localBookings.length === 0 || !isInitialLoad || !initialStartDate) {
      loadBookings(true)
    }
  }, [currentDate, roomId]) // dependencies 최소화

  // 예약 생성 완료 후 콜백 (Optimistic UI)
  const handleBookingCreated = (newBooking?: BookingResponse) => {
    if (newBooking) {
      // 항상 즉시 로컬 상태에 추가 (Optimistic Update) - 로딩 없이
      addLocalBooking(newBooking)

      // 현재 주의 날짜 범위 확인
      const weekDates = getWeekDates(currentDate)
      const bookingDate =
        typeof newBooking.date === 'string'
          ? parseKSTDate(newBooking.date)
          : new Date(newBooking.date)

      // 현재 주에 포함되지 않은 경우에만 백그라운드에서 서버 데이터 동기화 (로딩 없이)
      const isInCurrentWeek = weekDates.some((date) =>
        isSameDay(date, bookingDate)
      )
      if (!isInCurrentWeek) {
        // silent 모드로 백그라운드 동기화
        loadBookings(true, true).catch((error) => {
          console.error('예약 데이터 동기화 오류:', error)
        })
      }
    } else {
      // newBooking이 없는 경우에만 로딩 표시하며 데이터 로드
      loadBookings(true)
    }
  }

  // 빈 시간 슬롯 클릭 처리
  const handleEmptySlotClick = (day: number, timeSlot: string) => {
    const weekDates = getWeekDates(currentDate) // 현재 보고 있는 주의 날짜 사용
    const selectedDate = weekDates[day - 1] // day는 1-7

    // 시작 시간과 종료 시간 설정 (1시간 기본)
    const startTime = `${timeSlot.toString().padStart(2, '0')}:00`
    const endHour = parseInt(timeSlot) + 1
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    setCreateModalInitialData({
      date: selectedDate,
      startTime,
      endTime,
    })
    setIsCreateModalOpen(true)
  }

  // FAB 버튼 클릭 처리 - 현재 보고 있는 날짜 전달
  const handleFabClick = () => {
    setCreateModalInitialData({
      date: currentDate, // 현재 캘린더에서 보고 있는 날짜
      startTime: undefined,
      endTime: undefined,
    })
    setIsCreateModalOpen(true)
  }

  // 이벤트 드래그 엔드 처리
  const handleEventDragEnd = async (
    event: CalendarEvent,
    newDayIndex: number,
    newTimeSlot: string
  ) => {
    if (!event.bookingData || !roomId) {
      return
    }

    // 원본 위치 저장
    setOriginalEventPosition({
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
    })

    // 새로운 날짜 계산 (newDayIndex는 0-based)
    const weekDates = getWeekDates(currentDate)
    const newDate = weekDates[newDayIndex] // 0-based 인덱스 그대로 사용
    const newDateStr = toKSTDateString(newDate) // KST 날짜 문자열로 변환
    const newDay = newDayIndex + 1 // UI 표시용 1-based day

    // 드래그된 이벤트와 새로운 시간 정보 저장
    setDraggedEvent(event)

    // 예약 시간 계산 (기존 예약의 duration을 유지)
    const originalStart = event.startTime
    const originalEnd = event.endTime
    const [startHour, startMin] = originalStart.split(':').map(Number)
    const [endHour, endMin] = originalEnd.split(':').map(Number)

    const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin)
    const newStartHour = parseInt(newTimeSlot)
    const newEndMinutes = newStartHour * 60 + durationMinutes
    const newEndHour = Math.floor(newEndMinutes / 60)
    const newEndMin = newEndMinutes % 60

    const newStartTime = `${newStartHour.toString().padStart(2, '0')}:00` // 새 시간 슬롯은 항상 00분에 시작
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMin
      .toString()
      .padStart(2, '0')}`

    setNewTimeSlot({
      day: newDay,
      timeSlot: newStartTime,
      date: newDateStr,
    })

    // 임시로 UI 업데이트 (드래그 피드백)
    setEvents((prevEvents) =>
      prevEvents.map((e) =>
        e.id === event.id
          ? { ...e, day: newDay, startTime: newStartTime, endTime: newEndTime }
          : e
      )
    )

    // 시간대 충돌 검사 시작
    setIsCheckingAvailability(true)

    try {
      const availability = await BookingService.checkTimeSlotAvailability(
        roomId,
        newDateStr,
        newStartTime,
        newEndTime,
        event.bookingData.id
      )

      // 가용성 확인 완료
      setIsCheckingAvailability(false)

      if (!availability.success || !availability.data?.available) {
        // 충돌이 있으면 원래 위치로 복원
        restoreEventPosition()
        alert('해당 시간대에 다른 예약이 있어 이동할 수 없습니다.')
        return
      }

      // 충돌이 없으면 확인 모달 표시
      setIsTimeChangeModalOpen(true)
    } catch (error) {
      setIsCheckingAvailability(false)
      restoreEventPosition()
      alert('시간 확인 중 오류가 발생했습니다.')
    }
  }

  // 원래 위치로 복원
  const restoreEventPosition = () => {
    if (draggedEvent && originalEventPosition) {
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e.id === draggedEvent.id
            ? {
                ...e,
                day: originalEventPosition.day,
                startTime: originalEventPosition.startTime,
                endTime: originalEventPosition.endTime,
              }
            : e
        )
      )
    }
    resetDragState()
  }

  // 드래그 상태 초기화
  const resetDragState = () => {
    setDraggedEvent(null)
    setNewTimeSlot(null)
    setOriginalEventPosition(null)
    setIsTimeChangeModalOpen(false)
    setIsCheckingAvailability(false)
    setIsUpdatingBooking(false)
  }

  // 시간 변경 확인 (Optimistic UI)
  const handleTimeChangeConfirm = async () => {
    if (!draggedEvent?.bookingData || !newTimeSlot) {
      return
    }

    setIsUpdatingBooking(true)

    // Optimistic Update: 로컬 상태를 즉시 업데이트
    const optimisticBooking: BookingResponse = {
      ...draggedEvent.bookingData,
      date: newTimeSlot.date, // KST 날짜 문자열로 유지
      startTime: newTimeSlot.timeSlot,
      endTime: (() => {
        const originalStart = draggedEvent.startTime
        const originalEnd = draggedEvent.endTime
        const [startHour, startMin] = originalStart.split(':').map(Number)
        const [endHour, endMin] = originalEnd.split(':').map(Number)

        const durationMinutes =
          endHour * 60 + endMin - (startHour * 60 + startMin)
        const [newStartHour, newStartMin] = newTimeSlot.timeSlot
          .split(':')
          .map(Number)
        const newEndMinutes = newStartHour * 60 + newStartMin + durationMinutes
        const newEndHour = Math.floor(newEndMinutes / 60)
        const newEndMin = newEndMinutes % 60

        return `${newEndHour.toString().padStart(2, '0')}:${newEndMin
          .toString()
          .padStart(2, '0')}`
      })(),
    }

    // UI를 즉시 업데이트
    updateLocalBooking(optimisticBooking)
    setIsTimeChangeModalOpen(false)

    try {
      // 새로운 종료시간 계산
      const originalStart = draggedEvent.startTime
      const originalEnd = draggedEvent.endTime
      const [startHour, startMin] = originalStart.split(':').map(Number)
      const [endHour, endMin] = originalEnd.split(':').map(Number)

      const durationMinutes =
        endHour * 60 + endMin - (startHour * 60 + startMin)
      const [newStartHour, newStartMin] = newTimeSlot.timeSlot
        .split(':')
        .map(Number)
      const newEndMinutes = newStartHour * 60 + newStartMin + durationMinutes
      const newEndHour = Math.floor(newEndMinutes / 60)
      const newEndMin = newEndMinutes % 60

      const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMin
        .toString()
        .padStart(2, '0')}`

      const result = await BookingService.updateBookingTime(
        draggedEvent.bookingData.id,
        newTimeSlot.date,
        newTimeSlot.timeSlot,
        newEndTime
      )

      if (result.success && result.data) {
        // 서버 응답으로 로컬 상태 업데이트
        updateLocalBooking(result.data)
        resetDragState()
      } else {
        // 실패 시 원래 상태로 롤백
        if (draggedEvent.bookingData) {
          setLocalBookings((prev) =>
            prev.map((booking) =>
              booking.id === draggedEvent.bookingData!.id
                ? draggedEvent.bookingData!
                : booking
            )
          )
        }
        restoreEventPosition()
        alert(result.error?.message || '예약 시간 변경에 실패했습니다.')
      }
    } catch (error) {
      // 에러 시 원래 상태로 롤백
      if (draggedEvent.bookingData) {
        setLocalBookings((prev) =>
          prev.map((booking) =>
            booking.id === draggedEvent.bookingData!.id
              ? draggedEvent.bookingData!
              : booking
          )
        )
      }
      restoreEventPosition()
      alert('예약 시간 변경 중 오류가 발생했습니다.')
    } finally {
      setIsUpdatingBooking(false)
    }
  }

  // 시간 변경 취소
  const handleTimeChangeCancel = () => {
    restoreEventPosition()
  }

  return (
    <>
      {/* Calendar Controls */}
      <CalendarControls
        currentDate={currentDate}
        onNavigateToToday={navigateToToday}
        onNavigateToPreviousWeek={navigateToPreviousWeek}
        onNavigateToNextWeek={navigateToNextWeek}
      />

      {/* Week View */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/60 text-lg">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-2"></div>
            예약 정보를 불러오는 중...
          </div>
        </div>
      ) : (
        <WeekView
          events={events}
          onEventClick={handleEventClick}
          onEmptySlotClick={handleEmptySlotClick}
          onEventDragEnd={handleEventDragEnd}
          currentDate={currentDate}
          isDragEnabled={!!roomId} // 회의실 페이지에서만 드래그 활성화
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          currentMonth={currentMonth}
          onClose={closeEventDetails}
          onEventUpdated={(updatedBooking) => {
            if (updatedBooking) {
              // Optimistic update
              updateLocalBooking(updatedBooking)
            } else {
              // Fallback to reload
              loadBookings(true)
            }
          }}
        />
      )}

      {/* Booking Create Modal */}
      <BookingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookingCreated={handleBookingCreated}
        initialDate={createModalInitialData.date}
        initialStartTime={createModalInitialData.startTime}
        initialEndTime={createModalInitialData.endTime}
        fixedRoomId={roomId}
        roomInfo={roomInfo}
      />

      {/* FAB 버튼 - Liquid Glass 스타일 */}
      {/* 시간 변경 확인 모달 */}
      {draggedEvent && newTimeSlot && originalEventPosition && (
        <BookingTimeChangeModal
          isOpen={isTimeChangeModalOpen}
          onClose={() => setIsTimeChangeModalOpen(false)}
          onConfirm={handleTimeChangeConfirm}
          onCancel={handleTimeChangeCancel}
          bookingTitle={draggedEvent.title}
          originalTime={{
            date: toKSTDateString(
              getWeekDates(currentDate)[originalEventPosition.day - 1]
            ), // KST 날짜 문자열로 변환
            startTime: originalEventPosition.startTime,
            endTime: draggedEvent.endTime,
          }}
          newTime={{
            date: newTimeSlot.date,
            startTime: newTimeSlot.timeSlot,
            endTime: (() => {
              // 새로운 종료시간 계산
              const [startHour, startMin] = originalEventPosition.startTime
                .split(':')
                .map(Number)
              const [endHour, endMin] = draggedEvent.endTime
                .split(':')
                .map(Number)
              const durationMinutes =
                endHour * 60 + endMin - (startHour * 60 + startMin)
              const [newStartHour, newStartMin] = newTimeSlot.timeSlot
                .split(':')
                .map(Number)
              const newEndMinutes =
                newStartHour * 60 + newStartMin + durationMinutes
              const newEndHour = Math.floor(newEndMinutes / 60)
              const newEndMin = newEndMinutes % 60
              return `${newEndHour.toString().padStart(2, '0')}:${newEndMin
                .toString()
                .padStart(2, '0')}`
            })(),
          }}
          isLoading={isUpdatingBooking}
          isChecking={isCheckingAvailability}
        />
      )}

      <button
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 hover:scale-105 text-white transition-all duration-300 shadow-lg hover:shadow-white/10 hover:shadow-2xl flex items-center justify-center group"
      >
        <Plus className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" />
      </button>
    </>
  )
}
