"use client"

import { InputHTMLAttributes } from 'react'
import { cn } from '@/packages/shared/utils/utils'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  icon?: React.ReactNode
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  inputSize?: 'sm' | 'md' | 'lg'
}

export function GlassInput({ 
  className = '',
  icon,
  radius = 'lg',
  inputSize = 'md',
  ...props 
}: GlassInputProps) {
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

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'h-14 px-4 py-4 text-lg'
      case 'md':
        return 'h-16 px-5 py-5 text-xl'
      case 'lg':
        return 'h-20 px-6 py-6 text-2xl'
      default:
        return 'h-16 px-5 py-5 text-xl'
    }
  }

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 z-10">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'glass-input w-full transition-all duration-300',
          radiusClasses[radius],
          getSizeClasses(inputSize),
          icon && 'pl-12',
          className
        )}
        {...props}
      />
    </div>
  )
}