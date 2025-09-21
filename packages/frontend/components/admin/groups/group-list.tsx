'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import {
  Users,
  Settings,
  Trash2,
  Edit,
  Copy,
  Shield,
  UserPlus,
  MoreVertical,
  Hash
} from 'lucide-react'

interface Group {
  id: string
  name: string
  description?: string
  memberCount: number
  adminCount: number
  roomCount: number
  inviteCode?: string
  createdAt: Date
}

interface GroupListProps {
  groups: Group[]
  onEdit?: (groupId: string) => void
  onDelete?: (groupId: string) => void
  onViewMembers?: (groupId: string) => void
  className?: string
}

export function GroupList({
  groups,
  onEdit,
  onDelete,
  onViewMembers,
  className
}: GroupListProps) {
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null)
  const [showMenu, setShowMenu] = React.useState<string | null>(null)

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    // TODO: 토스트 메시지 표시
  }

  return (
    <div className={cn("space-y-4", className)}>
      {groups.map((group) => (
        <div
          key={group.id}
          className={cn(
            "group relative",
            "rounded-2xl",
            "bg-gradient-to-br from-white/5 to-white/10",
            "backdrop-blur-2xl",
            "border border-white/10",
            "transition-all duration-300",
            "hover:border-white/20",
            "hover:shadow-2xl",
            selectedGroup === group.id && "border-blue-500/50 bg-blue-500/10"
          )}
          onClick={() => setSelectedGroup(group.id)}
        >
          {/* 그룹 정보 영역 */}
          <div className={cn("p-6")}>
            <div className={cn("flex items-start justify-between mb-4")}>
              {/* 그룹 기본 정보 */}
              <div className={cn("flex items-start space-x-4")}>
                <div className={cn(
                  "w-12 h-12 rounded-xl",
                  "bg-gradient-to-br from-blue-500/20 to-purple-500/20",
                  "backdrop-blur-xl border border-white/20",
                  "flex items-center justify-center"
                )}>
                  <Users className={cn("w-6 h-6 text-blue-400")} />
                </div>

                <div>
                  <h3 className={cn("text-lg font-bold text-white mb-1")}>
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className={cn("text-white/60 text-sm mb-2")}>
                      {group.description}
                    </p>
                  )}

                  {/* 초대 코드 */}
                  {group.inviteCode && (
                    <div className={cn(
                      "inline-flex items-center space-x-2",
                      "px-3 py-1 rounded-lg",
                      "bg-white/5 border border-white/10"
                    )}>
                      <Hash className={cn("w-3 h-3 text-white/50")} />
                      <span className={cn("text-white/70 text-xs font-mono")}>
                        {group.inviteCode}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyInviteCode(group.inviteCode!)
                        }}
                        className={cn(
                          "p-1 rounded hover:bg-white/10",
                          "transition-colors duration-200"
                        )}
                      >
                        <Copy className={cn("w-3 h-3 text-white/50")} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 메뉴 */}
              <div className={cn("relative")}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(showMenu === group.id ? null : group.id)
                  }}
                  className={cn(
                    "p-2 rounded-lg",
                    "hover:bg-white/10",
                    "transition-colors duration-200"
                  )}
                >
                  <MoreVertical className={cn("w-5 h-5 text-white/50")} />
                </button>

                {showMenu === group.id && (
                  <div className={cn(
                    "absolute right-0 top-10 z-10",
                    "w-48 rounded-xl",
                    "bg-black/80 backdrop-blur-2xl",
                    "border border-white/20",
                    "shadow-2xl",
                    "animate-fade-in"
                  )}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewMembers?.(group.id)
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
                      <UserPlus className={cn("w-4 h-4")} />
                      <span className={cn("text-sm")}>구성원 관리</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit?.(group.id)
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
                      <Edit className={cn("w-4 h-4")} />
                      <span className={cn("text-sm")}>그룹 수정</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete?.(group.id)
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
                      <span className={cn("text-sm")}>그룹 삭제</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 통계 정보 */}
            <div className={cn("grid grid-cols-3 gap-4")}>
              <div className={cn(
                "px-4 py-3 rounded-xl",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10"
              )}>
                <div className={cn("flex items-center space-x-2 mb-1")}>
                  <Users className={cn("w-4 h-4 text-blue-400")} />
                  <span className={cn("text-white/60 text-xs")}>전체 멤버</span>
                </div>
                <p className={cn("text-white text-xl font-bold")}>
                  {group.memberCount}
                </p>
              </div>

              <div className={cn(
                "px-4 py-3 rounded-xl",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10"
              )}>
                <div className={cn("flex items-center space-x-2 mb-1")}>
                  <Shield className={cn("w-4 h-4 text-purple-400")} />
                  <span className={cn("text-white/60 text-xs")}>관리자</span>
                </div>
                <p className={cn("text-white text-xl font-bold")}>
                  {group.adminCount}
                </p>
              </div>

              <div className={cn(
                "px-4 py-3 rounded-xl",
                "bg-white/5 backdrop-blur-xl",
                "border border-white/10"
              )}>
                <div className={cn("flex items-center space-x-2 mb-1")}>
                  <Settings className={cn("w-4 h-4 text-green-400")} />
                  <span className={cn("text-white/60 text-xs")}>회의실</span>
                </div>
                <p className={cn("text-white text-xl font-bold")}>
                  {group.roomCount}
                </p>
              </div>
            </div>
          </div>

          {/* 호버 효과 */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0",
            "bg-gradient-to-r from-blue-500/5 to-purple-500/5",
            "group-hover:opacity-100 transition-opacity duration-300",
            "pointer-events-none"
          )} />
        </div>
      ))}
    </div>
  )
}