import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/packages/backend/lib/auth-check'
import { AppHeader } from '@/packages/frontend/components/layout/app-header'
import { LoginFormClient } from '@/packages/frontend/components/auth/login-form-client'

export const metadata: Metadata = {
  title: '로그인 - GroupMeet',
  description: '그룹 미팅룸 예약 시스템 로그인',
}

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // 이미 로그인된 경우 메인 페이지로 리다이렉션
  const authenticated = await isAuthenticated()

  if (authenticated) {
    redirect('/rooms')
  }

  // URL 파라미터에서 에러 메시지 추출
  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : undefined

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[600px]">
          <LoginFormClient initialError={error} />
        </div>
      </main>
    </div>
  )
}