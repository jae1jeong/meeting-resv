'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/packages/shared/utils/utils'

interface LoginFormProps {
  className?: string
}

export function LoginForm({ className = '' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('이메일 또는 비밀번호가 잘못되었습니다')
      } else if (result?.ok) {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다')
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
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
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
              onChange={(e) => setEmail(e.target.value)}
              radius="xl"
              inputSize="sm"
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
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            radius="xl"
            size="md"
          >
            {isLoading ? '로그인 중...' : '로그인'}
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