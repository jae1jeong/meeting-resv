import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/packages/backend/lib/prisma'
import { verifyPassword } from '@/packages/backend/auth/auth'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          throw new Error('존재하지 않는 사용자입니다')
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다')
        }

        // 기존 세션은 NextAuth가 자동으로 관리

        return {
          id: user.id,
          email: user.email || '',
          name: user.name || '',
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // JWT 토큰에 사용자 정보 포함
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // JWT에서 세션으로 정보 전달
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
    async signIn() {
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }