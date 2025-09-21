import 'better-auth/types'

declare module 'better-auth/types' {
  interface User {
    isAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      emailVerified?: boolean
      isAdmin?: boolean
    }
  }
}