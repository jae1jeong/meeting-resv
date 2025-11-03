'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleAdminStatus } from '@/packages/backend/actions/admin/user-admin-actions'
import { GlassCard } from '@/packages/frontend/components/ui/glass-card'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { cn } from '@/packages/shared/utils/utils'
import { Shield, ShieldOff, Users, Mail, Calendar, Search } from 'lucide-react'

interface User {
  id: string
  email: string | null
  name: string | null
  isAdmin: boolean
  createdAt: Date
  _count: {
    groupMemberships: number
    bookings: number
  }
}

interface AdminUsersClientProps {
  initialUsers: User[]
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // 검색 필터링
  const filteredUsers = users.filter(user => {
    const search = searchQuery.toLowerCase()
    return (
      (user.name?.toLowerCase().includes(search) || false) ||
      (user.email?.toLowerCase().includes(search) || false)
    )
  })

  const handleToggleAdmin = async (userId: string) => {
    setIsLoading(userId)
    try {
      const updatedUser = await toggleAdminStatus(userId)

      // 로컬 상태 업데이트
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, isAdmin: updatedUser.isAdmin } : user
        )
      )

      router.refresh()
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '권한 변경에 실패했습니다')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className={cn("min-h-screen p-6 space-y-6")}>
      {/* 헤더 */}
      <div className={cn("flex items-center justify-between")}>
        <div>
          <h1 className={cn("text-2xl font-bold text-white")}>사용자 관리</h1>
          <p className={cn("text-white/60 text-sm mt-1")}>
            전체 {users.length}명 · Admin {users.filter(u => u.isAdmin).length}명
          </p>
        </div>
      </div>

      {/* 검색 */}
      <GlassCard className={cn("p-4")}>
        <div className={cn("relative")}>
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40")} />
          <input
            type="text"
            placeholder="이름 또는 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-3 rounded-xl",
              "bg-white/5 border border-white/10",
              "text-white placeholder:text-white/40",
              "focus:bg-white/10 focus:border-white/20",
              "transition-all duration-200"
            )}
          />
        </div>
      </GlassCard>

      {/* 사용자 목록 */}
      <div className={cn("grid gap-4")}>
        {filteredUsers.map(user => (
          <GlassCard key={user.id} className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              {/* 사용자 정보 */}
              <div className={cn("flex items-center space-x-4")}>
                {/* 아바타 */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  user.isAdmin
                    ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border border-yellow-400/30"
                    : "bg-white/10 border border-white/20"
                )}>
                  {user.isAdmin ? (
                    <Shield className={cn("w-6 h-6 text-yellow-400")} />
                  ) : (
                    <span className={cn("text-lg font-semibold text-white")}>
                      {user.name?.[0] || user.email?.[0] || '?'}
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div>
                  <div className={cn("flex items-center space-x-2")}>
                    <h3 className={cn("text-lg font-semibold text-white")}>
                      {user.name || '이름 없음'}
                    </h3>
                    {user.isAdmin && (
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        "bg-gradient-to-r from-yellow-400/20 to-orange-400/20",
                        "border border-yellow-400/30 text-yellow-300"
                      )}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div className={cn("flex items-center space-x-4 mt-1 text-sm text-white/60")}>
                    <div className={cn("flex items-center space-x-1")}>
                      <Mail className={cn("w-3 h-3")} />
                      <span>{user.email || '이메일 없음'}</span>
                    </div>
                    <div className={cn("flex items-center space-x-1")}>
                      <Users className={cn("w-3 h-3")} />
                      <span>{user._count.groupMemberships}개 그룹</span>
                    </div>
                    <div className={cn("flex items-center space-x-1")}>
                      <Calendar className={cn("w-3 h-3")} />
                      <span>{user._count.bookings}개 예약</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <GlassButton
                onClick={() => handleToggleAdmin(user.id)}
                disabled={isLoading === user.id}
                variant={user.isAdmin ? "secondary" : "primary"}
                className={cn("flex items-center space-x-2")}
              >
                {isLoading === user.id ? (
                  <>
                    <div className={cn(
                      "w-4 h-4 border-2 border-white/20 border-t-white/60",
                      "rounded-full animate-spin"
                    )} />
                    <span>처리 중...</span>
                  </>
                ) : user.isAdmin ? (
                  <>
                    <ShieldOff className={cn("w-4 h-4")} />
                    <span>Admin 제거</span>
                  </>
                ) : (
                  <>
                    <Shield className={cn("w-4 h-4")} />
                    <span>Admin 승급</span>
                  </>
                )}
              </GlassButton>
            </div>

            {/* 가입일 */}
            <div className={cn("mt-4 pt-4 border-t border-white/10")}>
              <p className={cn("text-xs text-white/40")}>
                가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredUsers.length === 0 && (
        <GlassCard className={cn("p-12 text-center")}>
          <Users className={cn("w-12 h-12 mx-auto text-white/40 mb-4")} />
          <p className={cn("text-white/60")}>
            {searchQuery ? '검색 결과가 없습니다' : '등록된 사용자가 없습니다'}
          </p>
        </GlassCard>
      )}
    </div>
  )
}