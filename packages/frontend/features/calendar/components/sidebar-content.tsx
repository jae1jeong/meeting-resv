"use client"

import MiniCalendar from "./mini-calendar/mini-calendar"
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'

interface SidebarContentProps {
  currentMonth: string
  initialRooms?: MeetingRoomWithGroup[]
}

export function SidebarContent({ currentMonth, initialRooms = [] }: SidebarContentProps) {
  return (
    <>
      <MiniCalendar 
        currentMonth={currentMonth}
        daysInMonth={31}
        firstDayOffset={5}
        selectedDay={5}
      />
      {/* TODO: 향후 initialRooms를 사용하여 회의실 목록 표시 */}
    </>
  )
}