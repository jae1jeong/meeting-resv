// Re-export all validation schemas and types
export * from './common'
export * from './auth'
export * from './group'
export * from './room'
export * from './booking'

// Export validation error handler
import { ZodError } from 'zod'
import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'

export function handleValidationError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }))
    
    const message = errors.map(e => `${e.field}: ${e.message}`).join(', ')
    return errorResponse(message, 400)
  }
  
  return errorResponse('Validation error', 400)
}

// Validation wrapper for API routes
export function validateRequest<T>(
  schema: any,
  data: unknown
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    return { success: false, error: handleValidationError(error) }
  }
}