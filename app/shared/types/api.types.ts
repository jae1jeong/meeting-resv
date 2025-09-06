export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface QueryFilters {
  search?: string
  startDate?: Date
  endDate?: Date
  status?: string
  [key: string]: any
}