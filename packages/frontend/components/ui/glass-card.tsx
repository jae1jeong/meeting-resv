import { ReactNode } from 'react'
import { cn } from '@/packages/shared/utils/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'light' | 'dark'
  glow?: boolean
  liquid?: boolean
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function GlassCard({ 
  children, 
  className = '',
  variant = 'light',
  glow = false,
  liquid = false,
  radius = '2xl',
  size = 'md'
}: GlassCardProps) {
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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
    full: 'p-6'
  }

  return (
    <div 
      className={cn(
        'backdrop-blur-xl',
        variant === 'light' ? 'glass-card' : 'glass-dark',
        glow && 'glass-glow',
        liquid && 'liquid-glass',
        radiusClasses[radius],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}