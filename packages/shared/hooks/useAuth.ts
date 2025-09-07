"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import type { SessionUser } from "@/shared/types/auth.types"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const user: SessionUser | null = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name
  } : null

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated" && !!user

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    requireAuth
  }
}