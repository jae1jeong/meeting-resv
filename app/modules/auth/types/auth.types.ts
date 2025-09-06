export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  name: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface TokenPayload {
  userId: string
  email: string
  exp: number
  iat: number
}