'use client'

import { useFormStatus } from 'react-dom'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { cn } from '@/packages/shared/utils/utils'

interface LoginSubmitButtonProps {
  className?: string
  disabled?: boolean
}

export function LoginSubmitButton({ className, disabled = false }: LoginSubmitButtonProps) {
  const { pending } = useFormStatus()
  const isDisabled = disabled || pending

  return (
    <GlassButton
      type="submit"
      disabled={isDisabled}
      className={cn(
        "w-full bg-gradient-to-r from-purple-600 to-blue-600",
        "hover:from-purple-700 hover:to-blue-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "font-semibold transition-all duration-200",
        className
      )}
      radius="xl"
      size="md"
    >
      {isDisabled ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>로그인 중...</span>
        </div>
      ) : (
        '로그인'
      )}
    </GlassButton>
  )
}