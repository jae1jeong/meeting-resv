'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/packages/shared/utils/utils'
import { MemberManagement } from '@/packages/frontend/components/admin/groups/member-management'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { ArrowLeft } from 'lucide-react'
import { AdminService } from '@/packages/frontend/services/admin.service'

interface Member {
  id: string
  userId: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  joinedAt: Date
}

interface Group {
  id: string
  name: string
  description: string | null
}

interface GroupDetailClientProps {
  group: Group
  members: Member[]
  groupId: string
}

export default function GroupDetailClient({
  group,
  members: initialMembers,
  groupId
}: GroupDetailClientProps) {
  const router = useRouter()
  const [members, setMembers] = React.useState(initialMembers)

  const handleAddMember = () => {
    // TODO: 멤버 추가 모달 또는 페이지로 이동
    console.log('Add member to group:', groupId)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('정말로 이 구성원을 그룹에서 제거하시겠습니까?')) {
      try {
        // 멤버 ID가 아닌 groupMember의 ID를 찾아야 함
        const memberToRemove = members.find(m => m.userId === memberId)
        if (memberToRemove) {
          const result = await AdminService.removeGroupMember(groupId, memberToRemove.id)
          if (result.success) {
            // 로컬 상태 업데이트
            setMembers(members.filter(m => m.userId !== memberId))
          } else {
            alert(result.error?.message || '멤버 제거에 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('멤버 제거 실패:', error)
        alert('멤버 제거에 실패했습니다.')
      }
    }
  }

  const handleChangeRole = async (memberId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      // 멤버 ID가 아닌 groupMember의 ID를 찾아야 함
      const memberToUpdate = members.find(m => m.userId === memberId)
      if (memberToUpdate) {
        const result = await AdminService.changeGroupMemberRole(
          groupId,
          memberToUpdate.id,
          newRole
        )
        if (result.success) {
          // 로컬 상태 업데이트
          setMembers(members.map(m =>
            m.userId === memberId ? { ...m, role: newRole } : m
          ))
        } else {
          alert(result.error?.message || '역할 변경에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('역할 변경 실패:', error)
      alert('역할 변경에 실패했습니다.')
    }
  }

  // MemberManagement 컴포넌트 형식에 맞게 변환
  const formattedMembers = members.map(m => ({
    id: m.userId, // MemberManagement는 userId를 id로 사용
    name: m.name,
    email: m.email,
    role: m.role,
    joinedAt: m.joinedAt
  }))

  return (
    <div className={cn("space-y-6")}>
      {/* 뒤로가기 버튼 */}
      <GlassButton
        onClick={() => router.back()}
        variant="ghost"
        size="sm"
        radius="lg"
        className={cn("text-white/70 hover:text-white")}
      >
        <ArrowLeft className={cn("w-4 h-4 mr-2")} />
        그룹 목록으로
      </GlassButton>

      {/* 구성원 관리 컴포넌트 */}
      <MemberManagement
        groupId={groupId}
        groupName={group.name}
        members={formattedMembers}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onChangeRole={handleChangeRole}
      />
    </div>
  )
}