'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import {
  User,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  UserPlus,
  Search,
  Crown
} from 'lucide-react'

interface Member {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
  avatar?: string
}

interface MemberManagementProps {
  groupId: string
  groupName: string
  members: Member[]
  onAddMember?: () => void
  onRemoveMember?: (memberId: string) => void
  onChangeRole?: (memberId: string, newRole: 'ADMIN' | 'MEMBER') => void
  className?: string
}

export function MemberManagement({
  groupId,
  groupName,
  members,
  onAddMember,
  onRemoveMember,
  onChangeRole,
  className
}: MemberManagementProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedMembers, setSelectedMembers] = React.useState<string[]>([])
  const [showMenu, setShowMenu] = React.useState<string | null>(null)

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id))
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 헤더 */}
      <div className={cn(
        "p-6 rounded-2xl",
        "bg-gradient-to-br from-blue-500/10 to-purple-500/10",
        "backdrop-blur-2xl",
        "border border-blue-500/20"
      )}>
        <h2 className={cn("text-2xl font-bold text-white mb-2")}>
          {groupName} 구성원 관리
        </h2>
        <p className={cn("text-white/60")}>
          총 {members.length}명의 구성원
        </p>
      </div>

      {/* 액션 바 */}
      <div className={cn("flex items-center justify-between")}>
        <div className={cn("flex items-center space-x-4 flex-1")}>
          {/* 검색 */}
          <div className={cn("relative flex-1 max-w-md")}>
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2",
              "w-5 h-5 text-white/40"
            )} />
            <input
              type="text"
              placeholder="이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10 rounded-xl",
                "text-white placeholder-white/40",
                "focus:outline-none focus:border-blue-500/50",
                "transition-colors duration-200"
              )}
            />
          </div>

          {/* 선택된 항목 수 */}
          {selectedMembers.length > 0 && (
            <div className={cn(
              "px-4 py-2 rounded-lg",
              "bg-blue-500/20 border border-blue-500/30",
              "text-blue-300 text-sm"
            )}>
              {selectedMembers.length}명 선택됨
            </div>
          )}
        </div>

        {/* 구성원 추가 버튼 */}
        <GlassButton
          onClick={onAddMember}
          className={cn(
            "bg-gradient-to-r from-green-500 to-emerald-500",
            "hover:from-green-600 hover:to-emerald-600"
          )}
          size="md"
          radius="xl"
        >
          <UserPlus className={cn("w-5 h-5 mr-2")} />
          구성원 추가
        </GlassButton>
      </div>

      {/* 멤버 테이블 */}
      <div className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white/5 backdrop-blur-2xl",
        "border border-white/10"
      )}>
        {/* 테이블 헤더 */}
        <div className={cn(
          "px-6 py-4",
          "bg-white/5 border-b border-white/10",
          "grid grid-cols-12 gap-4",
          "text-white/60 text-sm font-medium"
        )}>
          <div className={cn("col-span-1 flex items-center")}>
            <input
              type="checkbox"
              checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
              onChange={handleSelectAll}
              className={cn(
                "w-4 h-4 rounded",
                "bg-white/10 border border-white/20",
                "checked:bg-blue-500 checked:border-blue-500"
              )}
            />
          </div>
          <div className={cn("col-span-4")}>구성원</div>
          <div className={cn("col-span-3")}>이메일</div>
          <div className={cn("col-span-2")}>역할</div>
          <div className={cn("col-span-2 text-right")}>가입일</div>
        </div>

        {/* 멤버 리스트 */}
        <div className={cn("divide-y divide-white/5")}>
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={cn(
                "px-6 py-4",
                "grid grid-cols-12 gap-4 items-center",
                "hover:bg-white/5 transition-colors duration-200",
                selectedMembers.includes(member.id) && "bg-blue-500/10"
              )}
            >
              <div className={cn("col-span-1")}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleSelectMember(member.id)}
                  className={cn(
                    "w-4 h-4 rounded",
                    "bg-white/10 border border-white/20",
                    "checked:bg-blue-500 checked:border-blue-500"
                  )}
                />
              </div>

              <div className={cn("col-span-4 flex items-center space-x-3")}>
                <div className={cn(
                  "w-10 h-10 rounded-full",
                  "bg-gradient-to-br from-blue-500 to-purple-500",
                  "flex items-center justify-center",
                  "text-white font-bold"
                )}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={cn("text-white font-medium")}>
                    {member.name}
                  </p>
                </div>
              </div>

              <div className={cn("col-span-3")}>
                <p className={cn("text-white/70 text-sm")}>
                  {member.email}
                </p>
              </div>

              <div className={cn("col-span-2")}>
                <div className={cn(
                  "inline-flex items-center space-x-2",
                  "px-3 py-1 rounded-lg",
                  member.role === 'ADMIN'
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-blue-500/20 text-blue-300"
                )}>
                  {member.role === 'ADMIN' ? (
                    <Crown className={cn("w-4 h-4")} />
                  ) : (
                    <User className={cn("w-4 h-4")} />
                  )}
                  <span className={cn("text-xs font-medium")}>
                    {member.role === 'ADMIN' ? '관리자' : '멤버'}
                  </span>
                </div>
              </div>

              <div className={cn("col-span-2 flex items-center justify-between")}>
                <span className={cn("text-white/60 text-sm")}>
                  {formatDate(member.joinedAt)}
                </span>

                {/* 액션 메뉴 */}
                <div className={cn("relative")}>
                  <button
                    onClick={() => setShowMenu(showMenu === member.id ? null : member.id)}
                    className={cn(
                      "p-2 rounded-lg",
                      "hover:bg-white/10",
                      "transition-colors duration-200"
                    )}
                  >
                    <MoreVertical className={cn("w-4 h-4 text-white/50")} />
                  </button>

                  {showMenu === member.id && (
                    <div className={cn(
                      "absolute right-0 top-10 z-10",
                      "w-48 rounded-xl",
                      "bg-black/90 backdrop-blur-2xl",
                      "border border-white/20",
                      "shadow-2xl"
                    )}>
                      <button
                        onClick={() => {
                          onChangeRole?.(member.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')
                          setShowMenu(null)
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left",
                          "flex items-center space-x-3",
                          "hover:bg-white/10",
                          "transition-colors duration-200",
                          "text-white/80 hover:text-white"
                        )}
                      >
                        <Shield className={cn("w-4 h-4")} />
                        <span className={cn("text-sm")}>
                          {member.role === 'ADMIN' ? '멤버로 변경' : '관리자로 변경'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onRemoveMember?.(member.id)
                          setShowMenu(null)
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left",
                          "flex items-center space-x-3",
                          "hover:bg-red-500/20",
                          "transition-colors duration-200",
                          "text-red-400 hover:text-red-300"
                        )}
                      >
                        <Trash2 className={cn("w-4 h-4")} />
                        <span className={cn("text-sm")}>그룹에서 제거</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 일괄 작업 */}
      {selectedMembers.length > 0 && (
        <div className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2",
          "px-6 py-4 rounded-2xl",
          "bg-black/80 backdrop-blur-2xl",
          "border border-white/20",
          "shadow-2xl",
          "flex items-center space-x-4",
          "animate-slide-up"
        )}>
          <span className={cn("text-white text-sm")}>
            {selectedMembers.length}명 선택됨
          </span>

          <GlassButton
            onClick={() => {
              // TODO: 일괄 역할 변경
              setSelectedMembers([])
            }}
            variant="ghost"
            size="sm"
            radius="lg"
          >
            역할 변경
          </GlassButton>

          <GlassButton
            onClick={() => {
              // TODO: 일괄 제거
              setSelectedMembers([])
            }}
            variant="ghost"
            className={cn("text-red-400 hover:bg-red-500/20")}
            size="sm"
            radius="lg"
          >
            제거
          </GlassButton>
        </div>
      )}
    </div>
  )
}