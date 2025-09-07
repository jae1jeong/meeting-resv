/**
 * Central export file for all API types
 * This makes importing types easier and more consistent
 */

// Common types
export * from './common'

// User types
export * from './user'

// Group types
export * from './group'

// Room types
export * from './room'
export * from './room-responses'

// Booking types
export * from './booking'

// Re-export commonly used Prisma enums for convenience
export { Role, RecurringType, ExceptionType } from '@prisma/client'