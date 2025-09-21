'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/packages/shared/utils/utils'
import { useAuth } from '@/packages/frontend/contexts/auth-context'
import { loginFormSchema, validateEmail } from '@/packages/frontend/lib/validation'
import { ZodError } from 'zod'

interface LoginFormProps {
  className?: string
}

export function LoginForm({ className = '' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')

  const { signIn } = useAuth()

  // 실시간 이메일 유효성 검사
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    if (newEmail.trim()) {
      const error = validateEmail(newEmail)
      setEmailError(error || '')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = {
      email: email.trim(),
      password: password
    }

    // Zod 스키마로 유효성 검사
    try {
      loginFormSchema.parse(formData)
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
      const result = await signIn.email({
        email: formData.email,
        password: formData.password
      })

      if (result.error) {
        setError(result.error.message || '로그인에 실패했습니다')
      } else if (result.data) {
        // 로그인 성공 시 자동으로 리다이렉트
        window.location.href = '/rooms'
      }
    } catch (error: any) {
      console.error('로그인 오류:', error)
      setError(error.message || '로그인에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("w-full p-10 shadow-2xl liquid-glass rounded-3xl text-white", className)}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold tracking-tight text-white">로그인</h2>
        <p className="mt-3 text-lg text-white/60">다시 오신 것을 환영합니다!</p>
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
              placeholder="이메일"
              value={email}
              onChange={handleEmailChange}
              radius="xl"
              inputSize="sm"
              className={emailError ? 'border-red-500/50' : ''}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-400">{emailError}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <GlassInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              radius="xl"
              inputSize="sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="w-5 h-5 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <label
              htmlFor="remember-me"
              className="text-xl font-medium text-white/60 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              아이디 저장
            </label>
          </div>

          <div className="text-xl">
            <a href="#" className="font-medium text-white/70 hover:text-white transition-colors duration-200">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </div>

        <div>
          <GlassButton
            type="submit"
            disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
            radius="xl"
            size="md"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>로그인 중...</span>
              </div>
            ) : (
              '로그인'
            )}
          </GlassButton>
        </div>
      </form>

      <p className="mt-8 text-center text-xl text-white/60">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-white/70 hover:text-white transition-colors duration-200 text-xl">
          회원가입
        </Link>
      </p>
    </div>
  )
}