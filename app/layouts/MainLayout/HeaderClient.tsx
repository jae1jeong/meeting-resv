"use client"

import { Menu, Settings } from "lucide-react"

interface HeaderClientProps {
  onMenuClick?: () => void
  onSettingsClick?: () => void
}

export function HeaderClient({ onMenuClick, onSettingsClick }: HeaderClientProps) {
  return (
    <>
      <button onClick={onMenuClick} className="hover:opacity-80 transition-opacity">
        <Menu className="h-6 w-6 text-white" />
      </button>
      <button onClick={onSettingsClick} className="hover:opacity-80 transition-opacity">
        <Settings className="h-6 w-6 text-white drop-shadow-md" />
      </button>
    </>
  )
}