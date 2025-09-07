import { z } from 'zod'
import { 
  idSchema, 
  titleSchema, 
  capacitySchema, 
  locationSchema, 
  amenitiesSchema,
  paginationSchema,
  searchSchema,
  booleanQuerySchema
} from './common'

// Create room validation
export const createRoomSchema = z.object({
  name: titleSchema,
  capacity: capacitySchema,
  location: locationSchema,
  amenities: amenitiesSchema,
  groupId: idSchema
})

// Update room validation
export const updateRoomSchema = z.object({
  name: titleSchema.optional(),
  capacity: capacitySchema.optional(),
  location: locationSchema.optional(),
  amenities: amenitiesSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
)

// Room query params validation
export const roomQuerySchema = z.object({
  page: paginationSchema.shape.page,
  pageSize: paginationSchema.shape.pageSize,
  groupId: idSchema.optional(),
  search: searchSchema,
  includeBookings: booleanQuerySchema
})

// Room ID param validation
export const roomIdParamSchema = z.object({
  id: idSchema
})

// Room availability query validation
export const roomAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
})

// Export types
export type CreateRoomInput = z.infer<typeof createRoomSchema>
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>
export type RoomQueryParams = z.infer<typeof roomQuerySchema>
export type RoomAvailabilityParams = z.infer<typeof roomAvailabilitySchema>