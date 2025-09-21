export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  groupCode: string
  termsAccepted: boolean
  privacyAccepted: boolean
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
}

// API 에러 응답 타입
export interface ApiErrorResponse {
  success: false
  error: string
  message: string
  statusCode?: number
}

// API 성공 응답 타입 (제네릭)
export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data?: T
}

// 통합 API 응답 타입
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// 그룹 정보 타입
export interface GroupInfo {
  id: string
  name: string
  description: string | null
  memberCount: number
  isMember: boolean
}

// 그룹 코드 검증 응답 타입
export interface GroupCodeValidationResponse {
  success: boolean
  data?: {
    group: GroupInfo
  }
  error?: string
}