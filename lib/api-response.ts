import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from '@/types/api'

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message
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
      error
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
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    },
    message
  })
}