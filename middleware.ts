import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all /api routes except auth endpoints
        if (req.nextUrl.pathname.startsWith('/api')) {
          // Allow access to auth endpoints
          if (
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname === '/api/health'
          ) {
            return true
          }
          // Require authentication for other API routes
          return !!token
        }
        
        // Protect dashboard and app routes
        if (
          req.nextUrl.pathname.startsWith('/dashboard') ||
          req.nextUrl.pathname.startsWith('/groups') ||
          req.nextUrl.pathname.startsWith('/rooms') ||
          req.nextUrl.pathname.startsWith('/bookings')
        ) {
          return !!token
        }

        return true
      }
    }
  }
)

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/groups/:path*',
    '/rooms/:path*',
    '/bookings/:path*'
  ]
}