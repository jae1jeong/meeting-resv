import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

// jwt-db는 서버 액션에서만 사용되므로 일반 PrismaClient 사용
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

/**
 * 리프레시 토큰 생성 및 DB 저장
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7일 후 만료

  // 기존 리프레시 토큰 삭제
  await prisma.refreshToken.deleteMany({
    where: { userId }
  })

  // 새 리프레시 토큰 저장
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })

  return token
}

/**
 * 리프레시 토큰 검증
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token }
  })

  if (!refreshToken) {
    return null
  }

  // 만료 확인
  if (refreshToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({
      where: { id: refreshToken.id }
    })
    return null
  }

  return { userId: refreshToken.userId }
}

/**
 * 리프레시 토큰 삭제 (로그아웃)
 */
export async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token }
  })
}

/**
 * 사용자의 모든 리프레시 토큰 삭제
 */
export async function deleteAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  })
}