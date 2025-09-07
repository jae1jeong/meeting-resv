import { z } from 'zod'
import { emailSchema, passwordSchema, nameSchema } from './common'

// Register request validation
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema
})

// Login request validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Update profile validation
export const updateProfileSchema = z.object({
  name: nameSchema
})

// Change password validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
  newPassword: passwordSchema
})

// Export types
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>