"use client"

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/packages/shared/utils/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
}

export function GlassButton({ 
  children, 
  className = '',
  variant = 'primary',
  size = 'md',
  glow = true,
  radius = 'xl',
  ...props 
}: GlassButtonProps) {
  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'h-12 px-4 py-3 text-base'
      case 'md':
        return 'h-16 px-6 py-4 text-lg'
      case 'lg':
        return 'h-20 px-8 py-6 text-xl'
      default:
        return 'h-16 px-6 py-4 text-lg'
    }
  }

  const variantClasses = {
    primary: 'glass-button text-white',
    secondary: 'glass-button bg-white/5 text-white/80',
    ghost: 'glass-button bg-transparent border-white/20 text-white hover:bg-white/10'
  }

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

  return (
    <button 
      className={cn(
        'transition-all duration-300 font-medium',
        'flex items-center justify-center',
        variantClasses[variant],
        getSizeClasses(size),
        radiusClasses[radius],
        glow && 'glass-glow',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}