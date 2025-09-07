export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: User
  error?: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
}