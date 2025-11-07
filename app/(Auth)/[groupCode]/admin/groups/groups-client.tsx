'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { GroupList } from '@/packages/frontend/components/admin/groups/group-list'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { Plus, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminService } from '@/packages/frontend/services/admin.service'

interface Group {
  id: string
  name: string
  description: string | null
  memberCount: number
  adminCount: number
  roomCount: number
  inviteCode: string | null
  createdAt: Date
}

interface AdminGroupsClientProps {
  initialGroups: Group[]
}

export default function AdminGroupsClient({ initialGroups }: AdminGroupsClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [groups, setGroups] = React.useState(initialGroups)

  // 클라이언트 사이드 필터링
  const filteredGroups = groups.filter(group => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const handleCreateGroup = () => {
    router.push('/admin/groups/new')
  }

  const handleEditGroup = (groupId: string) => {
    router.push(`/admin/groups/${groupId}/edit`)
  }

  const handleViewMembers = (groupId: string) => {
    router.push(`/admin/groups/${groupId}`)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('정말로 이 그룹을 삭제하시겠습니까?')) {
      try {
        const result = await AdminService.deleteGroup(groupId)
        if (result.success) {
          // 로컬 상태 업데이트
          setGroups(groups.filter(g => g.id !== groupId))
        } else {
          alert(result.error?.message || '그룹 삭제에 실패했습니다.')
        }
      } catch (error) {
        console.error('그룹 삭제 실패:', error)
        alert('그룹 삭제에 실패했습니다.')
      }
    }
  }

  return (
    <div className={cn("space-y-8")}>
      {/* 페이지 헤더 */}
      <div className={cn("flex items-center justify-between")}>
        <div>
          <h1 className={cn(
            "text-3xl font-bold text-white mb-2",
            "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          )}>
            그룹 관리
          </h1>
          <p className={cn("text-white/60")}>
            시스템에 등록된 모든 그룹을 관리합니다
          </p>
        </div>

        <GlassButton
          onClick={handleCreateGroup}
          className={cn(
            "bg-gradient-to-r from-blue-500 to-purple-500",
            "hover:from-blue-600 hover:to-purple-600"
          )}
          size="md"
          radius="xl"
        >
          <Plus className={cn("w-5 h-5 mr-2")} />
          새 그룹 생성
        </GlassButton>
      </div>

      {/* 검색 및 필터 바 */}
      <div className={cn(
        "flex items-center space-x-4",
        "p-4 rounded-2xl",
        "bg-white/5 backdrop-blur-2xl",
        "border border-white/10"
      )}>
        <div className={cn("flex-1 relative")}>
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2",
            "w-5 h-5 text-white/40"
          )} />
          <input
            type="text"
            placeholder="그룹 이름으로 검색..."
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

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={cn(
            "p-3 rounded-xl",
            "bg-white/5 backdrop-blur-xl",
            "border border-white/10",
            "hover:bg-white/10 hover:border-white/20",
            "transition-all duration-200"
          )}
        >
          <Filter className={cn("w-5 h-5 text-white/60")} />
        </button>
      </div>

      {/* 필터 옵션 (토글) */}
      {filterOpen && (
        <div className={cn(
          "p-4 rounded-2xl",
          "bg-white/5 backdrop-blur-2xl",
          "border border-white/10",
          "animate-slide-down"
        )}>
          <div className={cn("grid grid-cols-3 gap-4")}>
            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                멤버 수
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-blue-500/50"
              )}>
                <option value="">전체</option>
                <option value="1-10">1-10명</option>
                <option value="11-50">11-50명</option>
                <option value="50+">50명 이상</option>
              </select>
            </div>

            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                회의실 수
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-blue-500/50"
              )}>
                <option value="">전체</option>
                <option value="1-5">1-5개</option>
                <option value="6-10">6-10개</option>
                <option value="10+">10개 이상</option>
              </select>
            </div>

            <div>
              <label className={cn("text-white/60 text-sm block mb-2")}>
                정렬
              </label>
              <select className={cn(
                "w-full px-4 py-2 rounded-lg",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-blue-500/50"
              )}>
                <option value="name">이름순</option>
                <option value="members">멤버 수</option>
                <option value="created">생성일</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 목록 */}
      <GroupList
        groups={filteredGroups}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
        onViewMembers={handleViewMembers}
      />
    </div>
  )
}