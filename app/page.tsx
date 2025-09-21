import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/packages/backend/lib/auth-check'

// Server Component - 서버에서 초기 데이터 로드
export default async function Home() {
  // 서버 사이드에서 인증 체크
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect('/login')
  }

  redirect('/rooms')
}