import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30분
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7일 (Refresh Token)
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

        if (!user) {
          throw new Error('존재하지 않는 사용자입니다')
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          throw new Error('비밀번호가 일치하지 않습니다')
        }

        // 기존 세션 모두 삭제 (동시 로그인 1개 제한)
        await prisma.session.deleteMany({
          where: {
            userId: user.id
          }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.iat = Math.floor(Date.now() / 1000)
        token.exp = Math.floor(Date.now() / 1000) + (30 * 60) // 30분
      }

      // 토큰 갱신 체크 (만료 5분 전)
      const now = Math.floor(Date.now() / 1000)
      const tokenExp = token.exp as number || 0
      
      if (tokenExp - now < 300) { // 5분 이내 만료
        // 토큰 갱신
        token.iat = now
        token.exp = now + (30 * 60) // 새로운 30분
      }

      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
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