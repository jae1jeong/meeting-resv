import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 공개 경로들
  const publicPaths = [
    '/login',
    '/signup',
    '/api/auth',
    '/api/health',
    '/_next',
    '/favicon.ico'
  ]

  // 공개 경로는 통과
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 홈 페이지는 통과
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Better Auth 세션 쿠키 확인 (간단한 쿠키 존재 여부만 체크)
  const sessionCookie = request.cookies.get('better-auth.session_token')

  // 인증이 필요한 경로 처리
  const protectedPaths = [
    '/dashboard',
    '/groups',
    '/rooms',
    '/bookings',
    '/api/groups',
    '/api/rooms',
    '/api/bookings',
    '/api/users'
  ]

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !sessionCookie) {
    // API 요청인 경우 401 반환
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }
    // 페이지 요청인 경우 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}