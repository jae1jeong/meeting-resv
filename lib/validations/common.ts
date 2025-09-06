import { z } from 'zod'

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'가-힣]+$/, 'Name contains invalid characters')

// Date validation (ISO string)
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }, 'Invalid date')

// Time validation (HH:mm format, 30-minute intervals)
export const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format')
  .refine((time) => {
    const minutes = parseInt(time.split(':')[1])
    return minutes % 30 === 0
  }, 'Time must be on 30-minute intervals (00 or 30)')

// ID validation (CUID format)
export const idSchema = z
  .string()
  .min(1, 'ID is required')
  .max(30, 'Invalid ID format')

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
})

// Search validation
export const searchSchema = z
  .string()
  .max(100, 'Search query too long')
  .optional()

// Description validation
export const descriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional()

// Title validation
export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')

// Capacity validation
export const capacitySchema = z
  .number()
  .int()
  .min(1, 'Capacity must be at least 1')
  .max(500, 'Capacity must be less than 500')

// Location validation
export const locationSchema = z
  .string()
  .max(200, 'Location must be less than 200 characters')
  .optional()

// Amenities validation
export const amenitiesSchema = z
  .array(z.string().max(50))
  .max(20, 'Maximum 20 amenities allowed')
  .optional()

// Boolean query parameter
export const booleanQuerySchema = z
  .enum(['true', 'false'])
  .transform(val => val === 'true')
  .optional()

// Date range validation
export const dateRangeSchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional()
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: 'End date must be after or equal to start date'
    }
  )

// Time slot validation
export const timeSlotSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema
  })
  .refine(
    (data) => {
      const start = data.startTime.split(':').map(Number)
      const end = data.endTime.split(':').map(Number)
      const startMinutes = start[0] * 60 + start[1]
      const endMinutes = end[0] * 60 + end[1]
      return startMinutes < endMinutes
    },
    {
      message: 'End time must be after start time'
    }
  )

// Future date validation
export const futureDateSchema = dateStringSchema.refine(
  (date) => {
    const inputDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return inputDate >= today
  },
  'Date must be today or in the future'
)

// Max future date validation (3 months)
export const maxFutureDateSchema = futureDateSchema.refine(
  (date) => {
    const inputDate = new Date(date)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return inputDate <= maxDate
  },
  'Date cannot be more than 3 months in the future'
)