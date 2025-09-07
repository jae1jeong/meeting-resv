import { ReactNode } from 'react'
import { LiquidBackground } from '@/packages/frontend/components/ui/liquid-background'

interface UnAuthLayoutProps {
  children: ReactNode
}

export default function UnAuthLayout({ children }: UnAuthLayoutProps) {
  return (
    <div className="min-h-screen w-full overflow-hidden relative text-white" style={{ backgroundColor: '#111118' }}>
      {/* 배경 그라디언트 블러 효과 */}
      <div className="fixed inset-0 z-0">
        <LiquidBackground />
      </div>
     
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}