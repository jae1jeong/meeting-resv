"use client"

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
}

export function GlassModal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className 
}: GlassModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={cn(
        'relative glass-card max-w-lg w-full mx-4 animate-fade-in backdrop-blur-xl',
        'transform transition-all duration-300',
        className
      )}>
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="text-white">
          {children}
        </div>
      </div>
    </div>
  )
}