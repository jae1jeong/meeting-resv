import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/packages/backend/auth/better-auth'

export const { GET, POST } = toNextJsHandler(auth)