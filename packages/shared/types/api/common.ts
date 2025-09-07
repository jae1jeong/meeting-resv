export interface ValidationError {
  field: string
  message: string
}

export interface ApiError extends Error {
  statusCode: number
  errors?: ValidationError[]
}