'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/packages/shared/utils/utils'
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  ChevronRight,
  Shield,
  UserPlus,
  DoorOpen
} from 'lucide-react'

interface AdminSidebarProps {
  className?: string
}

const menuItems = [
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    id: 'users',
    label: '사용자 관리',
    href: '/admin/users',
    icon: Shield,
    exact: false
  },
  {
    id: 'groups',
    label: '그룹 관리',
    href: '/admin/groups',
    icon: Users,
    subItems: [
      { label: '그룹 목록', href: '/admin/groups' },
      { label: '그룹 생성', href: '/admin/groups/new' }
    ]
  },
  {
    id: 'members',
    label: '구성원 관리',
    href: '/admin/members',
    icon: UserPlus,
    subItems: [
      { label: '전체 구성원', href: '/admin/members' },
      { label: '권한 관리', href: '/admin/members/roles' }
    ]
  },
  {
    id: 'rooms',
    label: '회의실 관리',
    href: '/admin/rooms',
    icon: DoorOpen,
    subItems: [
      { label: '회의실 목록', href: '/admin/rooms' },
      { label: '회의실 추가', href: '/admin/rooms/new' }
    ]
  },
  {
    id: 'settings',
    label: '시스템 설정',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-64 z-10",
      "bg-gradient-to-b from-black/40 via-black/30 to-black/40",
      "backdrop-blur-2xl border-r border-white/10",
      "flex flex-col",
      className
    )}>
      {/* Admin 헤더 */}
      <div className={cn("p-6 border-b border-white/10 flex-shrink-0")}>
        <div className={cn("flex items-center space-x-3")}>
          <div className={cn(
            "w-10 h-10 rounded-xl",
            "bg-gradient-to-br from-purple-500/30 to-pink-500/30",
            "backdrop-blur-xl border border-white/20",
            "flex items-center justify-center"
          )}>
            <Shield className={cn("w-5 h-5 text-white")} />
          </div>
          <div>
            <h2 className={cn("text-white font-bold text-lg")}>관리자 패널</h2>
            <p className={cn("text-white/60 text-xs")}>시스템 관리</p>
          </div>
        </div>
      </div>

      {/* 메뉴 아이템 */}
      <nav className={cn("p-4 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10")}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedItems.includes(item.id)
          const isItemActive = isActive(item.href, item.exact)

          return (
            <div key={item.id}>
              <div
                className={cn(
                  "group relative"
                )}
              >
                {/* 활성 상태 배경 */}
                {isItemActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl",
                    "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
                    "backdrop-blur-xl",
                    "animate-pulse-slow"
                  )} />
                )}

                <button
                  onClick={() => item.subItems && toggleExpand(item.id)}
                  className={cn(
                    "relative w-full px-4 py-3 rounded-xl",
                    "flex items-center justify-between",
                    "transition-all duration-300",
                    "hover:bg-white/5",
                    isItemActive && "text-white",
                    !isItemActive && "text-white/70 hover:text-white"
                  )}
                >
                  <Link
                    href={item.href}
                    className={cn("flex items-center space-x-3 flex-1")}
                    onClick={(e) => item.subItems && e.preventDefault()}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isItemActive && "text-blue-400"
                    )} />
                    <span className={cn("font-medium")}>{item.label}</span>
                  </Link>

                  {item.subItems && (
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      isExpanded && "rotate-90"
                    )} />
                  )}
                </button>

                {/* 호버 효과 */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0",
                  "bg-gradient-to-r from-blue-500/10 to-purple-500/10",
                  "group-hover:opacity-100 transition-opacity duration-300",
                  "pointer-events-none"
                )} />
              </div>

              {/* 서브메뉴 */}
              {item.subItems && isExpanded && (
                <div className={cn(
                  "mt-2 ml-4 pl-8 space-y-1",
                  "border-l border-white/10",
                  "animate-slide-down"
                )}>
                  {item.subItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "block px-4 py-2 rounded-lg",
                          "transition-all duration-300",
                          "hover:bg-white/5",
                          isSubActive ? "text-blue-400 bg-white/5" : "text-white/60 hover:text-white"
                        )}
                      >
                        <span className={cn("text-sm")}>{subItem.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* 하단 정보 */}
      <div className={cn(
        "p-6 flex-shrink-0",
        "border-t border-white/10",
        "bg-gradient-to-t from-black/40 to-transparent"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-xl",
          "bg-gradient-to-r from-orange-500/10 to-red-500/10",
          "border border-orange-500/20"
        )}>
          <p className={cn("text-orange-300 text-xs font-medium mb-1")}>
            관리자 모드
          </p>
          <p className={cn("text-white/60 text-xs")}>
            모든 변경사항은 즉시 적용됩니다
          </p>
        </div>
      </div>
    </aside>
  )
}