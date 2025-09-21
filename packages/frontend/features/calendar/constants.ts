import { CalendarEvent, Calendar } from "./types"

export const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"]
export const WEEK_DATES = [3, 4, 5, 6, 7, 8, 9]
export const TIME_SLOTS = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

export const SAMPLE_EVENTS: CalendarEvent[] = []

export const MY_CALENDARS: Calendar[] = [
  { id: "1", name: "My Calendar", color: "bg-blue-500", isActive: true },
  { id: "2", name: "Work", color: "bg-green-500", isActive: true },
  { id: "3", name: "Personal", color: "bg-purple-500", isActive: true },
  { id: "4", name: "Family", color: "bg-orange-500", isActive: true },
]