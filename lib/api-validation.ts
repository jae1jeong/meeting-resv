/**
 * API Validation utilities
 * Common validation functions for API routes
 */

import { ValidationError } from '@/types/api/common'

export class ValidationException extends Error {
  public errors: ValidationError[]
  
  constructor(errors: ValidationError[]) {
    super('Validation failed')
    this.name = 'ValidationException'
    this.errors = errors
  }
}

/**
 * Validate room creation/update data
 */
export function validateRoomData(data: unknown): ValidationError[] {
  const room = data as {
    name?: unknown
    capacity?: unknown
    location?: unknown
    amenities?: unknown
    groupId?: unknown
  }
  const errors: ValidationError[] = []

  // Validate name
  if (room.name !== undefined) {
    if (typeof room.name !== 'string') {
      errors.push({ field: 'name', message: 'Name must be a string' })
    } else if (room.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' })
    } else if (room.name.length > 100) {
      errors.push({ field: 'name', message: 'Name cannot exceed 100 characters' })
    }
  }

  // Validate capacity
  if (room.capacity !== undefined) {
    if (typeof room.capacity !== 'number') {
      errors.push({ field: 'capacity', message: 'Capacity must be a number' })
    } else if (!Number.isInteger(room.capacity)) {
      errors.push({ field: 'capacity', message: 'Capacity must be an integer' })
    } else if (room.capacity < 1) {
      errors.push({ field: 'capacity', message: 'Capacity must be at least 1' })
    } else if (room.capacity > 1000) {
      errors.push({ field: 'capacity', message: 'Capacity cannot exceed 1000' })
    }
  }

  // Validate location
  if (room.location !== undefined && room.location !== null) {
    if (typeof room.location !== 'string') {
      errors.push({ field: 'location', message: 'Location must be a string' })
    } else if (room.location.length > 200) {
      errors.push({ field: 'location', message: 'Location cannot exceed 200 characters' })
    }
  }

  // Validate amenities
  if (room.amenities !== undefined) {
    if (!Array.isArray(room.amenities)) {
      errors.push({ field: 'amenities', message: 'Amenities must be an array' })
    } else {
      const validAmenities = [
        'projector',
        'whiteboard',
        'video_conference',
        'phone_conference',
        'tv',
        'coffee_machine',
        'water_dispenser',
        'printer',
        'scanner',
        'flipchart',
        'microphone',
        'speaker',
        'webcam',
        'air_conditioning',
        'heating',
        'natural_light',
        'standing_desk',
        'wheelchair_accessible'
      ]

      const amenitiesArray = room.amenities as unknown[]
      for (let index = 0; index < amenitiesArray.length; index += 1) {
        const amenity: unknown = amenitiesArray[index]
        if (typeof amenity !== 'string') {
          errors.push({
            field: `amenities[${index}]`,
            message: 'Each amenity must be a string'
          })
        } else if (!validAmenities.includes(amenity)) {
          errors.push({
            field: `amenities[${index}]`,
            message: `Invalid amenity: ${amenity}. Valid options: ${validAmenities.join(', ')}`
          })
        }
      }

      if ((room.amenities as unknown[]).length > 20) {
        errors.push({ field: 'amenities', message: 'Cannot have more than 20 amenities' })
      }
    }
  }

  // Validate groupId
  if (room.groupId !== undefined) {
    if (typeof room.groupId !== 'string') {
      errors.push({ field: 'groupId', message: 'Group ID must be a string' })
    } else if (room.groupId.trim().length === 0) {
      errors.push({ field: 'groupId', message: 'Group ID cannot be empty' })
    }
  }

  return errors
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(
  page: unknown,
  pageSize: unknown
): { page: number; pageSize: number } | ValidationError[] {
  const errors: ValidationError[] = []
  
  let validPage = 1
  let validPageSize = 10

  // Validate page
  if (page !== undefined && page !== null) {
    const pageNum = Number(page)
    if (isNaN(pageNum)) {
      errors.push({ field: 'page', message: 'Page must be a number' })
    } else if (!Number.isInteger(pageNum)) {
      errors.push({ field: 'page', message: 'Page must be an integer' })
    } else if (pageNum < 1) {
      errors.push({ field: 'page', message: 'Page must be at least 1' })
    } else {
      validPage = pageNum
    }
  }

  // Validate pageSize
  if (pageSize !== undefined && pageSize !== null) {
    const size = Number(pageSize)
    if (isNaN(size)) {
      errors.push({ field: 'pageSize', message: 'Page size must be a number' })
    } else if (!Number.isInteger(size)) {
      errors.push({ field: 'pageSize', message: 'Page size must be an integer' })
    } else if (size < 1) {
      errors.push({ field: 'pageSize', message: 'Page size must be at least 1' })
    } else if (size > 100) {
      errors.push({ field: 'pageSize', message: 'Page size cannot exceed 100' })
    } else {
      validPageSize = size
    }
  }

  if (errors.length > 0) {
    return errors
  }

  return { page: validPage, pageSize: validPageSize }
}

/**
 * Validate ISO date string
 */
export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return regex.test(time)
}

/**
 * Validate that time is on 30-minute intervals
 */
export function isValid30MinInterval(time: string): boolean {
  if (!isValidTimeFormat(time)) {
    return false
  }
  
  const [, minutes] = time.split(':')
  return minutes === '00' || minutes === '30'
}

/**
 * Check if end time is after start time
 */
export function isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes > startMinutes
}