import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import * as authCheck from '@/packages/backend/lib/auth-check'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/packages/backend/lib/jwt-utils'
import { prisma } from '@/packages/backend/lib/prisma'

// next/navigation 모킹
jest.mock('next/navigation', () => ({
  redirect: jest.fn()
}))

// next/headers 모킹
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}))

// jwt-utils 모킹
jest.mock('@/packages/backend/lib/jwt-utils', () => ({
  verifyAccessToken: jest.fn()
}))

// prisma 모킹
jest.mock('@/packages/backend/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

describe('auth-check 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requireAdmin', () => {
    it('어드민 권한이 있으면 사용자 정보를 반환해야 함', async () => {
      const mockUser = {
        id: 'admin-id',
        email: 'admin@test.com',
        name: 'Admin User',
        isAdmin: true
      }

      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'admin-id',
        email: 'admin@test.com',
        name: 'Admin User',
        isAdmin: true
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true })

      const result = await authCheck.requireAdmin()

      expect(result).toEqual(mockUser)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('어드민 권한이 없으면 홈으로 리다이렉트해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        email: 'user@test.com',
        name: 'Regular User',
        isAdmin: false
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false })

      await authCheck.requireAdmin()

      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('토큰이 없으면 로그인 페이지로 리다이렉트해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(null)
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)

      await authCheck.requireAdmin()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('requireAuth', () => {
    it('인증된 사용자면 사용자 정보를 반환해야 함', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        name: 'User',
        isAdmin: false
      }

      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        email: 'user@test.com',
        name: 'User',
        isAdmin: false
      })

      const result = await authCheck.requireAuth()

      expect(result).toEqual(mockUser)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('인증되지 않은 사용자면 로그인 페이지로 리다이렉트해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(null)
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)

      await authCheck.requireAuth()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('isAdmin', () => {
    it('어드민이면 true를 반환해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'admin-id',
        email: 'admin@test.com',
        name: 'Admin',
        isAdmin: true
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ isAdmin: true })

      const result = await authCheck.isAdmin()

      expect(result).toBe(true)
    })

    it('어드민이 아니면 false를 반환해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        email: 'user@test.com',
        name: 'User',
        isAdmin: false
      })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ isAdmin: false })

      const result = await authCheck.isAdmin()

      expect(result).toBe(false)
    })

    it('토큰이 없으면 false를 반환해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(null)
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)

      const result = await authCheck.isAdmin()

      expect(result).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('현재 사용자 정보를 반환해야 함', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'user@test.com',
        name: 'User',
        isAdmin: false
      }

      const mockCookies = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)
      ;(verifyAccessToken as jest.Mock).mockReturnValue({
        userId: 'user-id',
        email: 'user@test.com',
        name: 'User',
        isAdmin: false
      })

      const result = await authCheck.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('토큰이 없으면 null을 반환해야 함', async () => {
      const mockCookies = {
        get: jest.fn().mockReturnValue(null)
      }
      ;(cookies as jest.Mock).mockResolvedValue(mockCookies)

      const result = await authCheck.getCurrentUser()

      expect(result).toBeNull()
    })
  })
})