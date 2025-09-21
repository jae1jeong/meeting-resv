'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { cn } from '@/packages/shared/utils/utils'
import { useAuth } from '@/packages/frontend/contexts/auth-context'
import { registerFormSchema, validateEmail, validatePassword, validateName } from '@/packages/frontend/lib/validation'
import { ZodError } from 'zod'

interface SignupFormProps {
  className?: string
}

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  groupCode: string
  termsAccepted: boolean
  privacyAccepted: boolean
}

export function SignupForm({ className = '' }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    groupCode: '',
    termsAccepted: false,
    privacyAccepted: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [groupInfo, setGroupInfo] = useState<{ name: string } | null>(null)
  const [isValidatingGroup, setIsValidatingGroup] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  // 실시간 유효성 검사 함수들
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setFormData(prev => ({ ...prev, name: newName }))
    
    if (newName.trim()) {
      const error = validateName(newName)
      setFieldErrors(prev => ({ ...prev, name: error || '' }))
    } else {
      setFieldErrors(prev => ({ ...prev, name: '' }))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setFormData(prev => ({ ...prev, email: newEmail }))
    
    if (newEmail.trim()) {
      const error = validateEmail(newEmail)
      setFieldErrors(prev => ({ ...prev, email: error || '' }))
    } else {
      setFieldErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData(prev => ({ ...prev, password: newPassword }))
    
    if (newPassword.trim()) {
      const error = validatePassword(newPassword)
      setFieldErrors(prev => ({ ...prev, password: error || '' }))
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }))
    }

    // 비밀번호 확인 재검증
    if (formData.confirmPassword && newPassword !== formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다' }))
    } else if (formData.confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value
    setFormData(prev => ({ ...prev, confirmPassword: newConfirmPassword }))
    
    if (newConfirmPassword && formData.password !== newConfirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다' }))
    } else {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleGroupCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGroupCode = e.target.value.toUpperCase()
    setFormData(prev => ({ ...prev, groupCode: newGroupCode }))
    setGroupInfo(null)

    if (newGroupCode.length === 6) {
      setIsValidatingGroup(true)
      setFieldErrors(prev => ({ ...prev, groupCode: '' }))

      try {
        const response = await fetch(`/api/auth/validate-group/${newGroupCode}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()

        if (response.ok && result.success && result.data) {
          setGroupInfo({ name: result.data.group.name })
          setFieldErrors(prev => ({ ...prev, groupCode: '' }))
        } else {
          setFieldErrors(prev => ({ ...prev, groupCode: result.error || '유효하지 않은 초대 코드입니다' }))
          setGroupInfo(null)
        }
      } catch (error: unknown) {
        console.error('그룹 코드 검증 오류:', error)
        const errorMessage = error instanceof Error
          ? error.message
          : '초대 코드 검증 중 오류가 발생했습니다'
        setFieldErrors(prev => ({ ...prev, groupCode: errorMessage }))
        setGroupInfo(null)
      } finally {
        setIsValidatingGroup(false)
      }
    } else if (newGroupCode.length > 0) {
      setFieldErrors(prev => ({ ...prev, groupCode: '초대 코드는 6자리여야 합니다' }))
    } else {
      setFieldErrors(prev => ({ ...prev, groupCode: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Zod 스키마로 유효성 검사 (약관 동의 포함)
    const validationData = {
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      confirmPassword: formData.confirmPassword,
      groupCode: formData.groupCode.trim(),
      termsAccepted: formData.termsAccepted,
      privacyAccepted: formData.privacyAccepted
    }

    try {
      // 회원가입 폼 스키마 검증 (그룹 코드 포함)
      registerFormSchema.parse(validationData)
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const errorMessage = validationError.issues[0]?.message || '입력값을 확인해주세요'
        setError(errorMessage)
      } else {
        setError('입력값을 확인해주세요')
      }
      setIsLoading(false)
      return
    }

    try {
      // Better Auth로 회원가입
      const result = await signUp.email({
        email: validationData.email,
        password: validationData.password,
        name: validationData.name
      })

      if (result.error) {
        setError(result.error.message || '회원가입에 실패했습니다')
      } else if (result.data) {
        // 회원가입 성공 후 그룹 가입 처리
        if (validationData.groupCode) {
          await fetch('/api/groups/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inviteCode: validationData.groupCode
            }),
            credentials: 'include'
          })
        }

        // 회원가입 성공 시 로그인 페이지로 이동
        router.push('/login?message=회원가입이 완료되었습니다. 로그인해주세요.')
      }
    } catch (error: unknown) {
      console.error('회원가입 오류:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : '회원가입 중 오류가 발생했습니다'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.password.trim() && 
           formData.confirmPassword.trim() &&
           formData.groupCode.length === 6 &&
           formData.termsAccepted &&
           formData.privacyAccepted &&
           !Object.values(fieldErrors).some(error => error) &&
           groupInfo
  }

  return (
    <div className={cn("w-full p-10 shadow-2xl liquid-glass rounded-3xl text-white", className)}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-white">회원가입</h2>
        <p className="mt-3 text-lg text-white/60">GroupMeet에 오신 것을 환영합니다!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* 그룹 초대 코드 */}
          <div>
            <label htmlFor="groupCode" className="sr-only">
              그룹 초대 코드
            </label>
            <GlassInput
              id="groupCode"
              name="groupCode"
              type="text"
              required
              placeholder="그룹 초대 코드 (6자리) *"
              value={formData.groupCode}
              onChange={handleGroupCodeChange}
              radius="xl"
              inputSize="sm"
              className={fieldErrors.groupCode ? 'border-red-500/50' : groupInfo ? 'border-green-500/50' : ''}
              maxLength={6}
            />
            {fieldErrors.groupCode && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.groupCode}</p>
            )}
            {isValidatingGroup && (
              <p className="mt-1 text-sm text-yellow-400">코드 확인 중...</p>
            )}
            {groupInfo && (
              <p className="mt-1 text-sm text-green-400">✓ 그룹: {groupInfo.name}</p>
            )}
          </div>

          {/* 이름 */}
          <div>
            <label htmlFor="name" className="sr-only">
              이름
            </label>
            <GlassInput
              id="name"
              name="name"
              type="text"
              required
              placeholder="이름 *"
              value={formData.name}
              onChange={handleNameChange}
              radius="xl"
              inputSize="sm"
              className={fieldErrors.name ? 'border-red-500/50' : ''}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="sr-only">
              이메일
            </label>
            <GlassInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="이메일 *"
              value={formData.email}
              onChange={handleEmailChange}
              radius="xl"
              inputSize="sm"
              className={fieldErrors.email ? 'border-red-500/50' : ''}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <GlassInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="비밀번호 (최소 8자, 대소문자, 숫자 포함) *"
              value={formData.password}
              onChange={handlePasswordChange}
              radius="xl"
              inputSize="sm"
              className={fieldErrors.password ? 'border-red-500/50' : ''}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="confirmPassword" className="sr-only">
              비밀번호 확인
            </label>
            <GlassInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="비밀번호 확인 *"
              value={formData.confirmPassword}
              onChange={handleConfirmPasswordChange}
              radius="xl"
              inputSize="sm"
              className={fieldErrors.confirmPassword ? 'border-red-500/50' : ''}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              id="termsAccepted"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
              className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-2 border-white/30 rounded focus:ring-purple-500 focus:ring-2 accent-purple-600"
            />
            <label htmlFor="termsAccepted" className="text-sm text-white/80 leading-relaxed">
              <span className="text-red-400">*</span>{' '}
              <button
                type="button"
                className="text-purple-300 hover:text-purple-100 underline transition-colors"
                onClick={() => {
                  // TODO: 약관 모달 열기
                  alert('서비스 이용약관 모달 (추후 구현)')
                }}
              >
                서비스 이용약관
              </button>
              에 동의합니다
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              id="privacyAccepted"
              type="checkbox"
              checked={formData.privacyAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, privacyAccepted: e.target.checked }))}
              className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-2 border-white/30 rounded focus:ring-purple-500 focus:ring-2 accent-purple-600"
            />
            <label htmlFor="privacyAccepted" className="text-sm text-white/80 leading-relaxed">
              <span className="text-red-400">*</span>{' '}
              <button
                type="button"
                className="text-purple-300 hover:text-purple-100 underline transition-colors"
                onClick={() => {
                  // TODO: 개인정보 처리방침 모달 열기
                  alert('개인정보 처리방침 모달 (추후 구현)')
                }}
              >
                개인정보 처리방침
              </button>
              에 동의합니다
            </label>
          </div>
          
          <div className="flex items-start space-x-3">
            <input
              id="allTermsAccepted"
              type="checkbox"
              checked={formData.termsAccepted && formData.privacyAccepted}
              onChange={(e) => {
                const checked = e.target.checked
                setFormData(prev => ({ 
                  ...prev, 
                  termsAccepted: checked,
                  privacyAccepted: checked
                }))
              }}
              className="mt-1 w-4 h-4 text-purple-600 bg-transparent border-2 border-white/30 rounded focus:ring-purple-500 focus:ring-2 accent-purple-600"
            />
            <label htmlFor="allTermsAccepted" className="text-sm text-white/90 leading-relaxed font-medium">
              위 약관에 모두 동의합니다
            </label>
          </div>
          
          {(fieldErrors.termsAccepted || fieldErrors.privacyAccepted) && (
            <div className="mt-2 space-y-1">
              {fieldErrors.termsAccepted && (
                <p className="text-sm text-red-400">{fieldErrors.termsAccepted}</p>
              )}
              {fieldErrors.privacyAccepted && (
                <p className="text-sm text-red-400">{fieldErrors.privacyAccepted}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <GlassButton
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
            radius="xl"
            size="md"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>가입 중...</span>
              </div>
            ) : (
              '회원가입'
            )}
          </GlassButton>
        </div>
      </form>

      <p className="mt-8 text-center text-xl text-white/60">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-white/70 hover:text-white transition-colors duration-200 text-xl">
          로그인
        </Link>
      </p>
    </div>
  )
}