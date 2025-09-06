"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface MiniCalendarProps {
  currentMonth: string
  daysInMonth: number
  firstDayOffset: number
  selectedDay?: number
}

export default function MiniCalendar({
  currentMonth,
  daysInMonth,
  firstDayOffset,
  selectedDay = 5,
}: MiniCalendarProps) {
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1
  )

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">{currentMonth}</h3>
        <div className="flex gap-1">
          <button className="p-1 rounded-full hover:bg-white/20">
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button className="p-1 rounded-full hover:bg-white/20">
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, i) => (
          <div key={i} className="text-xs text-white/70 font-medium py-1">
            {day}
          </div>
        ))}

        {miniCalendarDays.map((day, i) => (
          <div
            key={i}
            className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
              day === selectedDay ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"
            } ${!day ? "invisible" : ""}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}