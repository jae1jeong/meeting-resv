import { z } from 'zod'

// 이메일 유효성 검사 스키마
export const emailSchema = z
  .string()
  .email('올바른 이메일 주소를 입력해주세요')
  .min(1, '이메일을 입력해주세요')

// 비밀번호 유효성 검사 스키마
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다')

// 이름 유효성 검사 스키마
export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(50, '이름은 50자를 초과할 수 없습니다')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름에는 한글, 영문, 공백만 사용할 수 있습니다')

// 로그인 폼 유효성 검사 스키마
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

// 그룹 코드 유효성 검사 스키마
export const groupCodeSchema = z
  .string()
  .length(6, '초대 코드는 6자리여야 합니다')
  .regex(/^[A-Z0-9]{6}$/, '초대 코드는 대문자와 숫자로만 구성되어야 합니다')

// 회원가입 폼 유효성 검사 스키마
export const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  groupCode: groupCodeSchema,
  termsAccepted: z.boolean().refine(val => val === true, {
    message: '서비스 이용약관에 동의해주세요'
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: '개인정보 처리방침에 동의해주세요'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

// 타입 추론
export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>

// 실시간 유효성 검사 함수
export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || '유효하지 않은 이메일입니다'
    }
    return '유효하지 않은 이메일입니다'
  }
}

export const validatePassword = (password: string): string | null => {
  try {
    passwordSchema.parse(password)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || '유효하지 않은 비밀번호입니다'
    }
    return '유효하지 않은 비밀번호입니다'
  }
}

export const validateName = (name: string): string | null => {
  try {
    nameSchema.parse(name)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || '유효하지 않은 이름입니다'
    }
    return '유효하지 않은 이름입니다'
  }
}

export const validateGroupCode = (groupCode: string): string | null => {
  try {
    groupCodeSchema.parse(groupCode)
    return null
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || '유효하지 않은 초대 코드입니다'
    }
    return '유효하지 않은 초대 코드입니다'
  }
}