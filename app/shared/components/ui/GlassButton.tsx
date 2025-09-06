"use client"

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

export function GlassButton({ 
  children, 
  className,
  variant = 'primary',
  size = 'md',
  glow = false,
  ...props 
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    primary: 'glass-button text-white',
    secondary: 'glass-button bg-white/5 text-white/80',
    ghost: 'bg-transparent border border-white/20 text-white hover:bg-white/10'
  }

  return (
    <button 
      className={cn(
        'rounded-xl transition-all duration-300 font-medium backdrop-blur-xl',
        variantClasses[variant],
        sizeClasses[size],
        glow && 'glass-glow',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}