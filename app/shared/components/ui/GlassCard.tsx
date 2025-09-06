import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'light' | 'dark'
  glow?: boolean
  liquid?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'light',
  glow = false,
  liquid = false 
}: GlassCardProps) {
  return (
    <div 
      className={cn(
        'backdrop-blur-xl',
        variant === 'light' ? 'glass-card' : 'glass-dark rounded-2xl p-6',
        glow && 'glass-glow',
        liquid && 'liquid-glass',
        className
      )}
    >
      {children}
    </div>
  )
}