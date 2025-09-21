"use client"

import { useState, useCallback } from 'react'
import { CalendarEvent, CalendarViewType } from '../types'

export function useCalendar(initialDate?: Date) {
  const [currentView, setCurrentView] = useState<CalendarViewType>('week')
  
  // 초기 날짜 설정
  const initDate = initialDate || new Date()
  const [currentMonth, setCurrentMonth] = useState(initDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }))
  const [currentDate, setCurrentDate] = useState(initDate)
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
    setCurrentDate(today)
    setCurrentMonth(today.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long' 
    }))
  }, [])

  const navigateToPreviousWeek = useCallback(() => {
    const previousWeek = new Date(currentDate)
    previousWeek.setDate(previousWeek.getDate() - 7)
    setCurrentDate(previousWeek)
    setCurrentMonth(previousWeek.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long' 
    }))
  }, [currentDate])

  const navigateToNextWeek = useCallback(() => {
    const nextWeek = new Date(currentDate)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setCurrentDate(nextWeek)
    setCurrentMonth(nextWeek.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long' 
    }))
  }, [currentDate])

  return {
    currentView,
    currentMonth,
    currentDate,
    selectedEvent,
    handleEventClick,
    closeEventDetails,
    changeView,
    navigateToToday,
    navigateToPreviousWeek,
    navigateToNextWeek,
    setCurrentMonth,
    setCurrentDate,
  }
}