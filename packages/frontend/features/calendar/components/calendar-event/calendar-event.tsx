"use client"

import { CalendarEventProps } from './calendar-event.types'
import { calculateEventStyle, getEventColorStyle } from '../week-view/weekview.utils'

export function CalendarEvent({ event, onClick, variant = 'default' }: CalendarEventProps) {
  const positionStyle = calculateEventStyle(event.startTime, event.endTime)
  const colorStyle = getEventColorStyle(event.color)

  return (
    <div
      className={`absolute rounded-lg p-2.5 text-white text-xs shadow-lg cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-xl hover:z-10 backdrop-blur-sm ${event.color}`}
      style={{
        ...positionStyle,
        ...colorStyle,
        left: "4px",
        right: "4px",
        background: `linear-gradient(135deg, ${colorStyle.backgroundColor}ee, ${colorStyle.backgroundColor}dd)`,
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
      onClick={() => onClick(event)}
    >
      <div className="font-semibold text-[11px] mb-0.5">{event.title}</div>
      {variant !== 'compact' && (
        <div className="opacity-90 text-[10px]">
          {`${event.startTime} - ${event.endTime}`}
        </div>
      )}
    </div>
  )
}