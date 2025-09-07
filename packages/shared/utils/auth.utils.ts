import type { RegisterData, LoginCredentials } from "@/shared/types/auth.types"

export const authValidation = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 8
  },

  validateRegisterData: (data: RegisterData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.name.trim()) {
      errors.push("이름을 입력해주세요")
    }

    if (!authValidation.isValidEmail(data.email)) {
      errors.push("유효한 이메일 주소를 입력해주세요")
    }

    if (!authValidation.isValidPassword(data.password)) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다")
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  validateLoginData: (data: LoginCredentials): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!authValidation.isValidEmail(data.email)) {
      errors.push("유효한 이메일 주소를 입력해주세요")
    }

    if (!data.password) {
      errors.push("비밀번호를 입력해주세요")
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}