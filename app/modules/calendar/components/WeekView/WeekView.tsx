"use client"

import { CalendarEvent } from '../CalendarEvent'
import { WeekViewProps } from './WeekView.types'
import { formatTime, generateTimeSlots } from './WeekView.utils'

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]
const WEEK_DATES = [3, 4, 5, 6, 7, 8, 9] // Temporary, should be calculated dynamically

export function WeekView({ events, onEventClick, isLoaded = true }: WeekViewProps) {
  const timeSlots = generateTimeSlots()

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="glass-card h-full">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-b border-white/20">
          <div className="p-2 text-center text-white/50 text-xs"></div>
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className="p-2 text-center border-l border-white/20">
              <div className="text-xs text-white/70 font-medium">{day}</div>
              <div
                className={`text-lg font-medium mt-1 text-white ${
                  WEEK_DATES[i] === 5
                    ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {WEEK_DATES[i]}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-8">
          {/* Time Labels */}
          <div className="text-white/70">
            {timeSlots.map((time, i) => (
              <div key={i} className="h-[80px] border-b border-white/10 pr-2 text-right text-xs flex items-start justify-end pt-1">
                {formatTime(time)}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className="border-l border-white/20 relative">
              {timeSlots.map((_, timeIndex) => (
                <div key={timeIndex} className="h-[80px] border-b border-white/10"></div>
              ))}

              {/* Events */}
              {events
                .filter((event) => event.day === dayIndex + 1)
                .map((event) => (
                  <CalendarEvent key={event.id} event={event} onClick={onEventClick} />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}