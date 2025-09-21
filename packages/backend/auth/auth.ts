// NextAuth 호환성 레이어 - Better Auth로 리다이렉트
export {
  hashPassword,
  verifyPassword,
  getSession,
  getCurrentUser
} from '@/packages/backend/auth/better-auth'