'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { LoginSubmitButton } from './login-submit-button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/packages/shared/utils/utils'
import { authClient } from '@/packages/frontend/lib/auth-client'

interface LoginFormClientProps {
  className?: string
  initialError?: string
}

export function LoginFormClient({ className = '', initialError }: LoginFormClientProps) {
  const router = useRouter()
  const [error, setError] = useState(initialError)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Better Auth 클라이언트 사용
      const { data, error: signInError } = await authClient.signIn.email({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signInError) {
        throw new Error(signInError.message || '로그인에 실패했습니다')
      }

      // 로그인 성공 - 사용자의 첫 번째 그룹으로 리다이렉트
      // 서버에서 그룹 목록 가져오기
      const groupsResponse = await fetch('/api/users/me/groups')
      if (groupsResponse.ok) {
        const groups = await groupsResponse.json()
        if (groups.length > 0 && groups[0].inviteCode) {
          router.push(`/${groups[0].inviteCode}/rooms`)
        } else {
          // 그룹이 없는 경우
          router.push('/groups/join')
        }
      } else {
        // 그룹 정보를 가져오지 못한 경우 기본 경로로
        router.push('/rooms')
      }
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다'
      setError(errorMessage)
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
              radius="xl"
              inputSize="sm"
              disabled={isLoading}
            />
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
              radius="xl"
              inputSize="sm"
              minLength={8}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              name="remember-me"
              disabled={isLoading}
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
          <LoginSubmitButton disabled={isLoading} />
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
