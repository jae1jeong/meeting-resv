import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from '@/shared/types/responses'

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error
      },
      timestamp: new Date().toISOString()
    },
    { status }
  )
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  message?: string
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  return NextResponse.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1
      }
    },
    message,
    timestamp: new Date().toISOString()
  })
}