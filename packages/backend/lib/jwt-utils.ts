import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
const ACCESS_TOKEN_EXPIRES_IN = '9h' // 9시간

interface TokenPayload {
  userId: string
  email: string
  name: string
  isAdmin: boolean
}

/**
 * 액세스 토큰 생성
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  })
}

/**
 * 액세스 토큰 검증
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 토큰에서 사용자 정보 추출 (검증 없이)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    return decoded
  } catch {
    return null
  }
}