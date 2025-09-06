export const calculateEventStyle = (startTime: string, endTime: string) => {
  const parseTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours + minutes / 60
  }
  
  const start = parseTime(startTime)
  const end = parseTime(endTime)
  const top = (start - 9) * 80 // 80px per hour, starting from 9 AM
  const height = (end - start) * 80
  
  return { 
    top: `${top}px`, 
    height: `${height}px` 
  }
}

export const getEventColorStyle = (colorClass: string) => {
  // Map Tailwind classes to actual colors as a fallback
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#10b981',
    'bg-purple-500': '#a855f7',
    'bg-orange-500': '#f97316',
    'bg-red-500': '#ef4444',
    'bg-yellow-500': '#eab308',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-cyan-500': '#06b6d4',
    'bg-teal-500': '#14b8a6',
  }
  
  return {
    backgroundColor: colorMap[colorClass] || '#3b82f6'
  }
}

export const formatTime = (hour: number): string => {
  if (hour === 12) return '12 PM'
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

export const generateTimeSlots = (startHour: number = 9, endHour: number = 19) => {
  return Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
}