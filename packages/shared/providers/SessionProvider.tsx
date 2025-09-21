"use client"

import { AuthProvider as CustomAuthProvider } from "@/packages/frontend/contexts/auth-context"
import type { ReactNode } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <CustomAuthProvider>
      {children}
    </CustomAuthProvider>
  )
}