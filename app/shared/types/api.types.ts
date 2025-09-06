// ApiResponse, ApiError, and PaginatedResponse are defined in responses.ts

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface QueryFilters {
  search?: string
  startDate?: Date
  endDate?: Date
  status?: string
  [key: string]: unknown
}