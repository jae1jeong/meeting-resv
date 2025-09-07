import { z } from 'zod'
import { RecurringType, ExceptionType } from '@prisma/client'
import {
  idSchema,
  titleSchema,
  descriptionSchema,
  maxFutureDateSchema,
  timeSlotSchema,
  paginationSchema,
  dateRangeSchema,
  booleanQuerySchema
} from './common'

// Recurring pattern validation
export const createRecurringPatternSchema = z.object({
  type: z.nativeEnum(RecurringType),
  interval: z.number().int().min(1).max(12).optional().default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  endDate: maxFutureDateSchema.optional(),
  occurrences: z.number().int().min(1).max(52).optional()
}).refine(
  (data) => {
    // Validate based on recurring type
    if (data.type === RecurringType.WEEKLY || data.type === RecurringType.BIWEEKLY) {
      return data.daysOfWeek && data.daysOfWeek.length > 0
    }
    if (data.type === RecurringType.MONTHLY) {
      return data.dayOfMonth !== undefined
    }
    return true
  },
  {
    message: 'Invalid recurring pattern configuration'
  }
).refine(
  (data) => {
    // Must have either endDate or occurrences
    return data.endDate || data.occurrences
  },
  {
    message: 'Either end date or number of occurrences must be specified'
  }
)

// Create booking validation
export const createBookingSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  roomId: idSchema,
  date: maxFutureDateSchema,
  startTime: timeSlotSchema.shape.startTime,
  endTime: timeSlotSchema.shape.endTime,
  participantIds: z.array(idSchema).optional(),
  recurringPattern: createRecurringPatternSchema.optional()
}).refine(
  (data) => {
    // Validate time slot
    const start = data.startTime.split(':').map(Number)
    const end = data.endTime.split(':').map(Number)
    const startMinutes = start[0] * 60 + start[1]
    const endMinutes = end[0] * 60 + end[1]
    return startMinutes < endMinutes
  },
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

// Update booking validation
export const updateBookingSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema.optional(),
  date: maxFutureDateSchema.optional(),
  startTime: timeSlotSchema.shape.startTime.optional(),
  endTime: timeSlotSchema.shape.endTime.optional(),
  participantIds: z.array(idSchema).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
).refine(
  (data) => {
    // If both times are provided, validate the slot
    if (data.startTime && data.endTime) {
      const start = data.startTime.split(':').map(Number)
      const end = data.endTime.split(':').map(Number)
      const startMinutes = start[0] * 60 + start[1]
      const endMinutes = end[0] * 60 + end[1]
      return startMinutes < endMinutes
    }
    return true
  },
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

// Recurring exception validation
export const createRecurringExceptionSchema = z.object({
  date: maxFutureDateSchema,
  type: z.nativeEnum(ExceptionType),
  newStartTime: timeSlotSchema.shape.startTime.optional(),
  newEndTime: timeSlotSchema.shape.endTime.optional(),
  reason: z.string().max(200).optional()
}).refine(
  (data) => {
    // If type is MODIFY, new times must be provided
    if (data.type === ExceptionType.MODIFY) {
      return data.newStartTime && data.newEndTime
    }
    return true
  },
  {
    message: 'New times must be provided when modifying a recurring booking'
  }
)

// Booking query params validation
export const bookingQuerySchema = z.object({
  page: paginationSchema.shape.page,
  pageSize: paginationSchema.shape.pageSize,
  roomId: idSchema.optional(),
  groupId: idSchema.optional(),
  creatorId: idSchema.optional(),
  startDate: dateRangeSchema.shape.startDate,
  endDate: dateRangeSchema.shape.endDate,
  includeParticipants: booleanQuerySchema,
  includeRecurring: booleanQuerySchema,
  includeParticipating: booleanQuerySchema,
  includeDetails: booleanQuerySchema
})

// Booking ID param validation
export const bookingIdParamSchema = z.object({
  id: idSchema
})

// Participant params validation
export const participantParamsSchema = z.object({
  id: idSchema,
  userId: idSchema
})

// Export types
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type CreateRecurringPatternInput = z.infer<typeof createRecurringPatternSchema>
export type CreateRecurringExceptionInput = z.infer<typeof createRecurringExceptionSchema>
export type BookingQueryParams = z.infer<typeof bookingQuerySchema>