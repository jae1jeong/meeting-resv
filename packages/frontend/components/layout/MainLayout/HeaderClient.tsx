"use client"

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { Menu, Calendar, MapPin, LogOut, Shield } from "lucide-react"
import { cn } from '@/packages/frontend/lib/utils'
import { useAuth } from '@/packages/frontend/contexts/auth-context'

interface HeaderClientProps {
  onMenuClick?: () => void
}

interface MenuItem {
  icon: LucideIcon
  label: string
  href: string
}

export function HeaderClient({ onMenuClick }: HeaderClientProps) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { signOut, isAuthenticated, session } = useAuth()

  const groupSegment = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const [first] = segments
    if (!first) return null
    // 전역 관리자 페이지 등 특정 경로 제외
    const reserved = new Set([
      'login',
      'signup',
      'admin',
      'api',
      'groups'
    ])
    if (reserved.has(first)) {
      return null
    }
    return first
  }, [pathname])

  const baseGroupPath = groupSegment ? `/${groupSegment}` : ''
  const isAdminUser = Boolean(session?.user && (session.user as { isAdmin?: boolean }).isAdmin)

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = []

    if (baseGroupPath) {
      items.push(
        { icon: MapPin, label: '회의실 목록', href: `${baseGroupPath}/rooms` },
        { icon: Calendar, label: '예약 관리', href: `${baseGroupPath}/bookings` }
      )
      if (isAdminUser) {
        items.push({
          icon: Shield,
          label: '관리자 페이지',
          href: `${baseGroupPath}/admin`
        })
      }
    }

    return items
  }, [baseGroupPath, isAdminUser])

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
    </>
  )
}