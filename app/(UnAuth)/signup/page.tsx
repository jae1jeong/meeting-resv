import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/packages/backend/auth/better-auth'
import { AppHeader } from '@/packages/frontend/components/layout/app-header'
import { SignupPageClient } from '@/packages/frontend/components/auth/signup-page-client'

export const metadata: Metadata = {
  title: '회원가입 - GroupMeet',
  description: '그룹 미팅룸 예약 시스템 회원가입',
}

export default async function SignupPage() {
  // 이미 로그인된 경우 메인 페이지로 리다이렉션
  const session = await getSession()

  if (session?.session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[600px]">
          <SignupPageClient />
        </div>
      </main>
    </div>
  )
}