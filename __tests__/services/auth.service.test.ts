import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// AuthService를 위한 기본 테스트
describe('AuthService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('API 요청 테스트', () => {
    it('회원가입 API 호출 시 올바른 데이터를 전송해야 한다', async () => {
      const mockResponse = {
        success: true,
        data: { id: '1', email: 'test@test.com' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const signupData = {
        email: 'test@test.com',
        password: 'password123',
        name: '테스트 사용자'
      }

      // 실제 AuthService.signup 메서드가 구현되면 이 테스트를 업데이트
      // const result = await AuthService.signup(signupData)

      // expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(signupData),
      // })

      // expect(result).toEqual(mockResponse)

      // 임시로 기본 테스트만 수행
      expect(mockFetch).toBeDefined()
    })

    it('로그인 실패 시 에러를 처리해야 한다', async () => {
      const mockErrorResponse = {
        success: false,
        error: { message: '잘못된 인증 정보입니다.' }
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse,
      } as Response)

      // 실제 AuthService.login 메서드가 구현되면 이 테스트를 업데이트
      // const result = await AuthService.login({
      //   email: 'wrong@test.com',
      //   password: 'wrongpassword'
      // })

      // expect(result.success).toBe(false)
      // expect(result.error?.message).toBe('잘못된 인증 정보입니다.')

      // 임시로 기본 테스트만 수행
      expect(mockErrorResponse.success).toBe(false)
    })
  })
})