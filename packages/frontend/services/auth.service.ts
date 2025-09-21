'use client'

import { authClient } from '@/packages/frontend/lib/auth-client'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  GroupCodeValidationResponse
} from '@/packages/shared/types/auth.types'

/**
 * 타입 안전한 API 호출을 위한 헬퍼 함수
 */
const safeFetchJson = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  // JSON 파싱 후 타입 단언 (런타임 검증은 별도로 필요)
  const data = await response.json()
  return data as T
}

/**
 * 인증 관련 API 서비스
 */
export class AuthService {
  /**
   * 로그인
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '이메일 또는 비밀번호가 잘못되었습니다',
          message: ''
        }
      }

      return {
        success: true,
        message: '로그인에 성공했습니다',
        user: result.user
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      return {
        success: false,
        error: '로그인 중 오류가 발생했습니다',
        message: ''
      }
    }
  }

  /**
   * 회원가입
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const result = await safeFetchJson<AuthResponse>('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return result
    } catch (error: unknown) {
      console.error('회원가입 오류:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : '회원가입 중 오류가 발생했습니다'
      
      return {
        success: false,
        error: errorMessage,
        message: ''
      }
    }
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<Omit<AuthResponse, 'user'>> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const result = await response.json()
        return {
          success: false,
          error: result.error || '로그아웃 중 오류가 발생했습니다',
          message: ''
        }
      }

      return {
        success: true,
        message: '로그아웃되었습니다',
        error: undefined
      }
    } catch (error: unknown) {
      console.error('로그아웃 오류:', error)

      const errorMessage = error instanceof Error
        ? error.message
        : '로그아웃 중 오류가 발생했습니다'

      return {
        success: false,
        error: errorMessage,
        message: ''
      }
    }
  }

  /**
   * 현재 사용자 정보 가져오기
   */
  static async getCurrentUser() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const result = await response.json()
      return result.user
    } catch (error: unknown) {
      console.error('사용자 정보 조회 오류:', error)
      return null
    }
  }

  /**
   * 토큰 새로고침
   */
  static async refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const result = await response.json()
      return result.user
    } catch (error: unknown) {
      console.error('토큰 새로고침 오류:', error)
      return null
    }
  }

  /**
   * 그룹 코드 유효성 검증 (그룹 정보 미리보기)
   */
  static async validateGroupCode(groupCode: string): Promise<GroupCodeValidationResponse> {
    try {
      const response = await fetch(`/api/groups/join?code=${groupCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '그룹 코드 검증 중 오류가 발생했습니다'
        }
      }

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('그룹 코드 검증 오류:', error)
      return {
        success: false,
        error: '네트워크 오류가 발생했습니다'
      }
    }
  }
}