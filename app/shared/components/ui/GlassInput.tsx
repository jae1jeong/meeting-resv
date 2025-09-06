"use client"

import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export function GlassInput({ 
  className,
  icon,
  ...props 
}: GlassInputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'glass-input w-full backdrop-blur-xl',
          icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  )
}