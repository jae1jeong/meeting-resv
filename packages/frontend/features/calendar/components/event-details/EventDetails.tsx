"use client"

import { Clock, MapPin, Calendar, Users } from "lucide-react"
import { CalendarEvent } from '../../types'

interface EventDetailsProps {
  event: CalendarEvent
  currentMonth: string
  onClose: () => void
}

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const WEEK_DATES = [3, 4, 5, 6, 7, 8, 9]

export default function EventDetails({ event, currentMonth, onClose }: EventDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${event.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
        <h3 className="text-2xl font-bold mb-4 text-white">{event.title}</h3>
        <div className="space-y-3 text-white">
          <p className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            {`${event.startTime} - ${event.endTime}`}
          </p>
          <p className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {event.location}
          </p>
          <p className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            {`${WEEK_DAYS[event.day - 1]}, ${WEEK_DATES[event.day - 1]} ${currentMonth}`}
          </p>
          <p className="flex items-start">
            <Users className="mr-2 h-5 w-5 mt-1" />
            <span>
              <strong>Attendees:</strong>
              <br />
              {event.attendees.join(", ") || "No attendees"}
            </span>
          </p>
          <p>
            <strong>Organizer:</strong> {event.organizer}
          </p>
          <p>
            <strong>Description:</strong> {event.description}
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}