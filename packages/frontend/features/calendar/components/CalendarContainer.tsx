"use client"

import { WeekView } from "./WeekView"
import { useCalendar } from "../hooks/useCalendar"
import CalendarControls from "./CalendarControls/CalendarControls"
import EventDetails from "./event-details/EventDetails"
import { CalendarEvent } from "../types"

interface CalendarContainerProps {
  initialEvents: CalendarEvent[]
}

export function CalendarContainer({ initialEvents }: CalendarContainerProps) {
  const {
    currentView,
    currentMonth,
    currentDate,
    selectedEvent,
    handleEventClick,
    closeEventDetails,
    changeView,
  } = useCalendar()

  return (
    <>
      {/* Calendar Controls */}
      <CalendarControls
        currentDate={currentDate}
      />

      {/* Week View */}
      <WeekView
        events={initialEvents}
        onEventClick={handleEventClick}
        currentDate={new Date()}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          currentMonth={currentMonth}
          onClose={closeEventDetails}
        />
      )}
    </>
  )
}