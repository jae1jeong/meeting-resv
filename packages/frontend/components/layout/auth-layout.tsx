import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

export function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더 */}
      <header className="absolute top-0 left-0 w-full px-6 py-4 md:px-10 md:py-5 z-20">
        <div className="flex items-center gap-3 text-white">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            G
          </div>
          <h1 className="text-xl font-bold tracking-tighter">GroupMeet</h1>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={`flex flex-1 items-center justify-center p-4 ${className}`}>
        {children}
      </main>
    </div>
  )
}