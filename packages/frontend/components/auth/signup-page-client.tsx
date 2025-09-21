'use client'

import { useRedirectIfAuthenticated } from '@/packages/frontend/contexts/auth-context'
import { SignupForm } from './signup-form'

export function SignupPageClient() {
  // 이미 로그인된 사용자는 자동으로 리다이렉트
  useRedirectIfAuthenticated('/')

  return <SignupForm />
}