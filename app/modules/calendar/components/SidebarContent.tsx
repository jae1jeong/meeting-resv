"use client"

import MiniCalendar from "./MiniCalendar/MiniCalendar"

interface SidebarContentProps {
  currentMonth: string
}

export function SidebarContent({ currentMonth }: SidebarContentProps) {
  return (
    <>
      <MiniCalendar 
        currentMonth={currentMonth}
        daysInMonth={31}
        firstDayOffset={5}
        selectedDay={5}
      />
    </>
  )
}