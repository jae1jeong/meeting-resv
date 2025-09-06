export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError extends Error {
  statusCode: number
  errors?: ValidationError[]
}