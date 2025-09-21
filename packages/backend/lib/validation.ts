import { z } from 'zod'

// 백엔드 전용 회원가입 데이터 검증 스키마
export const registerDataSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다').max(50, '이름은 50자를 초과할 수 없습니다'),
  groupCode: z.string().length(6, '그룹 코드는 6자리여야 합니다').regex(/^[A-Z0-9]{6}$/, '그룹 코드는 대문자와 숫자로만 구성되어야 합니다'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: '서비스 이용약관에 동의해주세요'
  }),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: '개인정보 처리방침에 동의해주세요'
  })
})

export type ValidatedRegisterData = z.infer<typeof registerDataSchema>

/**
 * 요청 본문 검증 헬퍼 함수
 */
export function validateRegisterData(body: unknown): ValidatedRegisterData {
  return registerDataSchema.parse(body)
}