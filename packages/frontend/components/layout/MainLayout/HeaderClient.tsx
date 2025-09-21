"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Settings, Home, Calendar, MapPin, LogOut } from "lucide-react"
import { cn } from '@/packages/frontend/lib/utils'
import { useAuth } from '@/packages/frontend/contexts/auth-context'

interface HeaderClientProps {
  onMenuClick?: () => void
  onSettingsClick?: () => void
}

export function HeaderClient({ onMenuClick, onSettingsClick }: HeaderClientProps) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const { signOut, isAuthenticated } = useAuth()

  const menuItems = [
    { icon: Home, label: '홈', href: '/' },
    { icon: MapPin, label: '회의실 목록', href: '/rooms' },
    { icon: Calendar, label: '예약 관리', href: '/bookings' },
  ]

  const handleMenuItemClick = (href: string) => {
    router.push(href)
    setShowMenu(false)
  }

  return (
    <>
      <div className="relative">
        <button 
          onClick={() => {
            setShowMenu(!showMenu)
            onMenuClick?.()
          }} 
          className="hover:opacity-80 transition-opacity"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
        
        {showMenu && (
          <div className="absolute top-12 left-0 w-48 py-2 bg-gray-800/95 rounded-lg border border-white/20 backdrop-blur-xl z-50">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleMenuItemClick(item.href)}
                className={cn(
                  "w-full px-4 py-3 text-left text-white hover:bg-white/10",
                  "transition-colors flex items-center space-x-3"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            {isAuthenticated && (
              <>
                <hr className="border-white/20 my-2" />
                <button
                  onClick={async () => {
                    setShowMenu(false)
                    await signOut()
                  }}
                  className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/10 transition-colors flex items-center space-x-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <button onClick={onSettingsClick} className="hover:opacity-80 transition-opacity">
        <Settings className="h-6 w-6 text-white drop-shadow-md" />
      </button>
    </>
  )
}