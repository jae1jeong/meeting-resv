import { prisma } from '@/packages/backend/lib/prisma'

export interface TimeSlot {
  date: Date
  startTime: string
  endTime: string
}

export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

export function compareTime(time1: string, time2: string): number {
  const t1 = parseTime(time1)
  const t2 = parseTime(time2)
  
  if (t1.hours !== t2.hours) {
    return t1.hours - t2.hours
  }
  return t1.minutes - t2.minutes
}

export function isTimeSlotOverlapping(
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean {
  // Check if slot1 starts before slot2 ends AND slot1 ends after slot2 starts
  return compareTime(slot1.startTime, slot2.endTime) < 0 && 
         compareTime(slot1.endTime, slot2.startTime) > 0
}

export async function checkRoomAvailability(
  roomId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const existingBookings = await prisma.booking.findMany({
    where: {
      roomId,
      date,
      ...(excludeBookingId && { id: { not: excludeBookingId } })
    },
    select: {
      startTime: true,
      endTime: true
    }
  })

  for (const booking of existingBookings) {
    if (isTimeSlotOverlapping(
      { startTime, endTime },
      { startTime: booking.startTime, endTime: booking.endTime }
    )) {
      return false
    }
  }

  return true
}

export function validateTimeSlot(startTime: string, endTime: string): boolean {
  // Check format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false
  }

  // Check if end time is after start time
  if (compareTime(endTime, startTime) <= 0) {
    return false
  }

  // Check if times are on 30-minute intervals
  const startMinutes = parseTime(startTime).minutes
  const endMinutes = parseTime(endTime).minutes
  if (startMinutes % 30 !== 0 || endMinutes % 30 !== 0) {
    return false
  }

  return true
}