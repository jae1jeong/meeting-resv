import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AppHeader } from '@/packages/frontend/components/layout/app-header'
import { LoginForm } from '@/packages/frontend/components/auth/login-form'

export const metadata: Metadata = {
  title: '로그인 - GroupMeet',
  description: '그룹 미팅룸 예약 시스템 로그인',
}

export default async function LoginPage() {
  // 이미 로그인된 경우 메인 페이지로 리다이렉션
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[600px]">
          <LoginForm />
        </div>
      </main>
    </div>
  )
}