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
  // 모든 쿠키 출력 (디버깅)
  console.log('All cookies:', request.cookies.getAll())
  const sessionCookie = request.cookies.get('better-auth.session_token') ||
                        request.cookies.get('better-auth.session') ||
                        request.cookies.get('auth.session_token')

  // groupCode 없이 보호된 경로에 직접 접근하는 경우 체크
  // 예: /rooms, /bookings, /admin (groupCode 없이)
  const directProtectedPaths = ['/rooms', '/bookings', '/admin']
  const isDirectProtectedPath = directProtectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  if (isDirectProtectedPath) {
    // 인증되지 않은 경우 로그인으로
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // 인증된 경우 - 홈으로 리다이렉트 (홈에서 첫 그룹으로 리다이렉트)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // API 경로 보호
  const protectedApiPaths = ['/api/groups', '/api/rooms', '/api/bookings', '/api/users']
  const isProtectedApiPath = protectedApiPaths.some(path => pathname.startsWith(path))

  if (isProtectedApiPath && !sessionCookie) {
    return NextResponse.json(
      { error: '인증이 필요합니다' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}