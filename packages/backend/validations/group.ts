import { z } from 'zod'
import { idSchema, titleSchema, descriptionSchema, paginationSchema, searchSchema, booleanQuerySchema } from './common'
import { Role } from '@prisma/client'

// Create group validation
export const createGroupSchema = z.object({
  name: titleSchema,
  description: descriptionSchema
})

// Update group validation
export const updateGroupSchema = z.object({
  name: titleSchema.optional(),
  description: descriptionSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
)

// Add group member validation
export const addGroupMemberSchema = z.object({
  userId: idSchema,
  role: z.nativeEnum(Role).optional().default(Role.MEMBER)
})

// Update group member role validation
export const updateGroupMemberSchema = z.object({
  role: z.nativeEnum(Role)
})

// Group query params validation
export const groupQuerySchema = z.object({
  page: paginationSchema.shape.page,
  pageSize: paginationSchema.shape.pageSize,
  search: searchSchema,
  includeMembers: booleanQuerySchema,
  includeRooms: booleanQuerySchema
})

// Group ID param validation
export const groupIdParamSchema = z.object({
  id: idSchema
})

// Member ID params validation
export const memberIdParamsSchema = z.object({
  id: idSchema,
  userId: idSchema
})

// Export types
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>
export type UpdateGroupMemberInput = z.infer<typeof updateGroupMemberSchema>
export type GroupQueryParams = z.infer<typeof groupQuerySchema>