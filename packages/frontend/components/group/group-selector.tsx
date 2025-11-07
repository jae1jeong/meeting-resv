'use client'

import { useState } from 'react'
import { useGroup } from '@/packages/frontend/contexts/group-context'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/packages/shared/utils/utils'

interface GroupSelectorProps {
  className?: string
}

export function GroupSelector({ className }: GroupSelectorProps) {
  const { currentGroup, userGroups, switchGroup } = useGroup()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentGroup || userGroups.length === 0) {
    return null
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-2",
          "text-white bg-white/10 backdrop-blur-md",
          "rounded-lg border border-white/20",
          "hover:bg-white/20 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-purple-500"
        )}
      >
        <span className="font-medium">{currentGroup.name}</span>
        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
      </button>

      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 드롭다운 메뉴 */}
          <div
            className={cn(
              "absolute z-20 w-full mt-2",
              "bg-white/10 backdrop-blur-md",
              "rounded-lg border border-white/20",
              "shadow-xl overflow-hidden"
            )}
          >
            {userGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  if (group.inviteCode !== currentGroup.inviteCode) {
                    switchGroup(group.inviteCode)
                  }
                  setIsOpen(false)
                }}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3",
                  "text-white hover:bg-white/20 transition-colors",
                  "focus:outline-none focus:bg-white/20",
                  group.id === currentGroup.id && "bg-white/10"
                )}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{group.name}</span>
                  {group.description && (
                    <span className="text-xs text-white/60 mt-0.5">
                      {group.description}
                    </span>
                  )}
                </div>
                {group.id === currentGroup.id && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
