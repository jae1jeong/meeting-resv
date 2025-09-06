"use client"

import { useState, useCallback } from 'react'
import { CalendarEvent, CalendarViewType } from '../types'

export function useCalendar() {
  const [currentView, setCurrentView] = useState<CalendarViewType>('week')
  const [currentMonth, setCurrentMonth] = useState('March 2025')
  const [currentDate, setCurrentDate] = useState('March 5')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  const closeEventDetails = useCallback(() => {
    setSelectedEvent(null)
  }, [])

  const changeView = useCallback((view: CalendarViewType) => {
    setCurrentView(view)
  }, [])

  const navigateToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    }))
    setCurrentMonth(today.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }))
  }, [])

  return {
    currentView,
    currentMonth,
    currentDate,
    selectedEvent,
    handleEventClick,
    closeEventDetails,
    changeView,
    navigateToToday,
    setCurrentMonth,
    setCurrentDate,
  }
}