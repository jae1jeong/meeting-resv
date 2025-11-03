import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/packages/backend/lib/prisma'
import bcrypt from 'bcryptjs'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:3000'
  ],

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 12)
      },
      verify: async (data: { hash: string; password: string }) => {
        return bcrypt.compare(data.password, data.hash)
      }
    }
  },

  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 세션 갱신
    cookieCache: {
      enabled: false // 쿠키 캐시 비활성화 - 항상 DB 확인
    }
  },

  user: {
    additionalFields: {
      isAdmin: {
        type: 'boolean',
        defaultValue: false,
        required: false
      }
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async (data) => {
        // 이메일 검증 비활성화
        console.log('이메일 변경 검증 비활성화:', data.newEmail)
      }
    }
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: []
    }
  },

  rateLimit: {
    enabled: true,
    window: 10 * 60, // 10분
    max: 10, // 최대 10번 시도
    storage: 'memory'
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    },
    generateId: false, // Prisma의 cuid 사용
    crossSubDomainCookies: {
      enabled: false
    }
  }
})

export type Auth = typeof auth

// 기존 NextAuth 호환성을 위한 헬퍼 함수들
export async function getSession(request?: Request) {
  if (!request) {
    // Server Component에서 호출시
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const cookie = headersList.get('cookie') || ''

    const mockRequest = new Request('http://localhost:3000', {
      headers: {
        cookie
      }
    })

    return auth.api.getSession({
      headers: mockRequest.headers
    })
  }

  return auth.api.getSession({
    headers: request.headers
  })
}

export async function getCurrentUser(request?: Request) {
  const session = await getSession(request)
  if (!session?.session || !session.user) return null

  // 그룹 정보를 포함한 전체 사용자 정보 조회
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      groupMemberships: {
        include: {
          group: true
        }
      }
    }
  })

  if (!user) return null

  return {
    ...user,
    groups: user.groupMemberships.map(membership => ({
      id: membership.group.id,
      name: membership.group.name,
      role: membership.role
    }))
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}