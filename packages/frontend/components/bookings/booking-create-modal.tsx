'use client'

import { useState, useEffect } from 'react'
import { GlassModal } from '@/packages/frontend/components/ui/glass-modal'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { cn } from '@/packages/shared/utils/utils'
import { createBookingAction } from '@/packages/backend/actions/booking-actions'
import { RoomService } from '@/packages/frontend/services/room.service'
import type { CreateBookingRequest, BookingResponse } from '@/packages/shared/types/api/booking'
import type { MeetingRoomWithGroup } from '@/packages/shared/types/api/room'
import { X, Clock, MapPin, Users, Calendar } from 'lucide-react'
import { toKSTDateString } from '@/packages/shared/utils/date-utils'

interface BookingCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onBookingCreated: (newBooking?: BookingResponse) => void
  initialDate?: Date
  initialStartTime?: string
  initialEndTime?: string
  fixedRoomId?: string // 특정 회의실이 지정된 경우
  roomInfo?: MeetingRoomWithGroup // 회의실 정보
  className?: string
}

interface BookingFormData extends Omit<CreateBookingRequest, 'participantIds'> {
  participantEmails: string
}

// 30분 단위 시간 슬롯 생성 (08:00 ~ 18:00)
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    slots.push(`${hour.toString().padStart(2, '0')}:30`)
  }
  slots.push('18:00') // 마지막 슬롯
  return slots
}

const TIME_SLOTS = generateTimeSlots()

export function BookingCreateModal({
  isOpen,
  onClose,
  onBookingCreated,
  initialDate,
  initialStartTime,
  initialEndTime,
  fixedRoomId,
  roomInfo,
  className = ''
}: BookingCreateModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    title: '',
    description: '',
    roomId: '',
    date: initialDate ? toKSTDateString(initialDate) : toKSTDateString(new Date()),
    startTime: initialStartTime || '09:00',
    endTime: initialEndTime || '10:00',
    participantEmails: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [rooms, setRooms] = useState<MeetingRoomWithGroup[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [availabilityChecking, setAvailabilityChecking] = useState(false)
  const [conflictWarning, setConflictWarning] = useState('')
  
  // 회의실 목록 로드
  const loadRooms = async () => {
    if (fixedRoomId || roomsLoading || rooms.length > 0) return
    
    setRoomsLoading(true)
    try {
      const result = await RoomService.getRooms({ pageSize: 100 })
      if (result.success && result.data) {
        setRooms(result.data.items || [])
      }
    } catch (error) {
      console.error('회의실 목록 로드 오류:', error)
    } finally {
      setRoomsLoading(false)
    }
  }

  // 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        roomId: fixedRoomId || '',
        date: initialDate ? toKSTDateString(initialDate) : toKSTDateString(new Date()),
        startTime: initialStartTime || '09:00',
        endTime: initialEndTime || '10:00',
        participantEmails: ''
      })
      setError('')
      setFieldErrors({})
      
      // 회의실 목록 로드 (fixedRoomId가 없는 경우에만)
      if (!fixedRoomId) {
        loadRooms()
      }
    }
  }, [isOpen, initialDate, initialStartTime, initialEndTime, fixedRoomId])

  // 시간 유효성 검사
  const validateTimeSlots = (start: string, end: string): string | null => {
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1])
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1])

    if (endMinutes <= startMinutes) {
      return '종료 시간은 시작 시간보다 늦어야 합니다'
    }

    if ((endMinutes - startMinutes) < 30) {
      return '최소 30분 이상 예약해야 합니다'
    }

    return null
  }

  // 가용성 확인 함수
  const checkAvailability = async (roomId: string, date: string, startTime: string, endTime: string) => {
    if (!roomId || !date || !startTime || !endTime) {
      setConflictWarning('')
      return
    }

    setAvailabilityChecking(true)
    setConflictWarning('')

    try {
      const result = await RoomService.checkAvailability(roomId, date, startTime, endTime)
      
      if (result.success && result.data) {
        if (!result.data.available) {
          setConflictWarning('선택한 시간에 다른 예약이 있습니다. 다른 시간을 선택해 주세요.')
        } else {
          setConflictWarning('')
        }
      }
    } catch (error) {
      console.error('가용성 확인 오류:', error)
    } finally {
      setAvailabilityChecking(false)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 실시간 유효성 검사
    if (field === 'title' && value.trim() === '') {
      setFieldErrors(prev => ({ ...prev, title: '제목을 입력해주세요' }))
    } else if (field === 'title') {
      setFieldErrors(prev => ({ ...prev, title: '' }))
    }

    // 시간 검증
    if (field === 'startTime' || field === 'endTime') {
      const startTime = field === 'startTime' ? value : formData.startTime
      const endTime = field === 'endTime' ? value : formData.endTime
      const timeError = validateTimeSlots(startTime, endTime)
      
      if (timeError) {
        setFieldErrors(prev => ({ ...prev, time: timeError }))
        setConflictWarning('')
      } else {
        setFieldErrors(prev => ({ ...prev, time: '' }))
        
        // 시간이 유효하면 가용성 확인
        const currentRoomId = fixedRoomId || formData.roomId
        if (currentRoomId && formData.date) {
          checkAvailability(currentRoomId, formData.date, startTime, endTime)
        }
      }
    }

    // 회의실이나 날짜가 변경되면 가용성 확인
    if ((field === 'roomId' || field === 'date') && !fieldErrors.time) {
      const roomId = field === 'roomId' ? value : (fixedRoomId || formData.roomId)
      const date = field === 'date' ? value : formData.date
      
      if (roomId && date && formData.startTime && formData.endTime) {
        checkAvailability(roomId, date, formData.startTime, formData.endTime)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // 폼 유효성 검사
    const newFieldErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newFieldErrors.title = '제목을 입력해주세요'
    }

    if (!formData.roomId) {
      newFieldErrors.roomId = '회의실을 선택해주세요'
    }

    if (!formData.date) {
      newFieldErrors.date = '날짜를 선택해주세요'
    }

    const timeError = validateTimeSlots(formData.startTime, formData.endTime)
    if (timeError) {
      newFieldErrors.time = timeError
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      setIsLoading(false)
      return
    }

    // 참여자 이메일 파싱 (향후 구현)
    const participantIds: string[] = []

    const bookingData: CreateBookingRequest = {
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      roomId: formData.roomId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      participantIds: participantIds.length > 0 ? participantIds : undefined
    }

    try {
      const result = await createBookingAction(bookingData)

      if (result.success && result.data) {
        onBookingCreated(result.data)
        onClose()
      } else {
        setError(result.error?.message || '예약 생성에 실패했습니다')
      }
    } catch (error: unknown) {
      console.error('예약 생성 오류:', error)
      setError('예약 생성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.roomId &&
      formData.date &&
      formData.startTime &&
      formData.endTime &&
      !Object.values(fieldErrors).some(error => error) &&
      !conflictWarning &&
      !availabilityChecking
    )
  }

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="w-full max-w-md mx-auto p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-white/80" />
            <h2 className="text-2xl font-bold text-white">새 예약</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              제목 *
            </label>
            <GlassInput
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="회의 제목을 입력해주세요"
              required
              className={cn(fieldErrors.title ? 'border-red-500/50' : '')}
              radius="xl"
              inputSize="sm"
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.title}</p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              설명
            </label>
            <GlassInput
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="회의 내용을 간단히 설명해주세요"
              radius="xl"
              inputSize="sm"
            />
          </div>

          {/* 회의실 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              회의실 *
            </label>
            
            {fixedRoomId && roomInfo ? (
              // 고정된 회의실인 경우 읽기 전용으로 표시
              <div className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-white/60" />
                  <span className="font-medium">{roomInfo.name}</span>
                  <span className="text-white/60">
                    ({roomInfo.location && `${roomInfo.location}, `}최대 {roomInfo.capacity}명)
                  </span>
                </div>
              </div>
            ) : (
              // 회의실 선택 드롭다운
              <select
                value={formData.roomId}
                onChange={(e) => handleInputChange('roomId', e.target.value)}
                required
                disabled={roomsLoading}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 backdrop-blur-lg",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20",
                  "hover:border-white/20 transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  fieldErrors.roomId ? 'border-red-500/50' : ''
                )}
              >
                <option value="" className="bg-gray-800 text-white">
                  {roomsLoading ? '회의실 목록 로딩 중...' : '회의실을 선택해주세요'}
                </option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id} className="bg-gray-800 text-white">
                    {room.name} ({room.location && `${room.location}, `}최대 {room.capacity}명)
                  </option>
                ))}
              </select>
            )}
            
            {fieldErrors.roomId && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.roomId}</p>
            )}
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              날짜 *
            </label>
            <GlassInput
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={toKSTDateString(new Date())}
              max={toKSTDateString(new Date(new Date().setFullYear(new Date().getFullYear() + 1)))}
              required
              className={cn(fieldErrors.date ? 'border-red-500/50' : '')}
              radius="xl"
              inputSize="sm"
            />
            {fieldErrors.date && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.date}</p>
            )}
          </div>

          {/* 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                시작 시간 *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
                className={cn(
                  "w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-lg",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20",
                  "hover:border-white/20 transition-all duration-200"
                )}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time} className="bg-gray-800 text-white">
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                종료 시간 *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
                className={cn(
                  "w-full px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white backdrop-blur-lg",
                  "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20",
                  "hover:border-white/20 transition-all duration-200"
                )}
              >
                {TIME_SLOTS.map(time => (
                  <option key={time} value={time} className="bg-gray-800 text-white">
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {fieldErrors.time && (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.time}</p>
          )}

          {/* 가용성 확인 */}
          {availabilityChecking && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-white/60">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
              <span>가용성 확인 중...</span>
            </div>
          )}

          {/* 충돌 경고 */}
          {conflictWarning && (
            <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{conflictWarning}</span>
              </div>
            </div>
          )}

          {!conflictWarning && !availabilityChecking && formData.roomId && formData.date && formData.startTime && formData.endTime && !fieldErrors.time && (
            <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>선택한 시간에 예약 가능합니다</span>
              </div>
            </div>
          )}

          {/* 참여자 */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              참여자 (추후 구현)
            </label>
            <GlassInput
              type="text"
              value={formData.participantEmails}
              onChange={(e) => handleInputChange('participantEmails', e.target.value)}
              placeholder="이메일을 쉼표로 구분해서 입력 (선택사항)"
              disabled
              radius="xl"
              inputSize="sm"
              className="opacity-50"
            />
            <p className="mt-1 text-xs text-white/40">참여자 기능은 추후 구현 예정입니다</p>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <GlassButton
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 border-white/20 text-white/80 hover:bg-white/10"
              radius="xl"
              size="md"
            >
              취소
            </GlassButton>
            
            <GlassButton
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              radius="xl"
              size="md"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                '예약 생성'
              )}
            </GlassButton>
          </div>
        </form>
      </div>
    </GlassModal>
  )
}