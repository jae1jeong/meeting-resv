'use client'

import { createAuthClient } from 'better-auth/react'
import type { Auth } from '@/packages/backend/auth/better-auth'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
})

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  updateUser
} = authClient