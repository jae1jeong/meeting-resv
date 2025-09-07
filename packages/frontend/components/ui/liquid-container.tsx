import { ReactNode } from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { LiquidBackground } from './liquid-background'

interface LiquidContainerProps {
  children: ReactNode
  className?: string
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  withBackground?: boolean
}

export function LiquidContainer({ 
  children, 
  className = '',
  radius = 'none',
  size = 'full',
  withBackground = true
}: LiquidContainerProps) {
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full'
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'w-full'
  }

  return (
    <div className={cn(
      'relative overflow-hidden',
      radiusClasses[radius],
      sizeClasses[size],
      className
    )}>
      {withBackground && (
        <>
          {/* 배경 그라디언트 블러 효과 */}
          <div className="absolute inset-0 z-0">
            <LiquidBackground />
          </div>
        </>
      )}
      
      {/* 콘텐츠 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}