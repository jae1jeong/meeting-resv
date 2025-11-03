'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useGroupCode } from '@/packages/frontend/hooks/use-group-code'

interface Group {
  id: string
  slug: string
  name: string
  description?: string | null
  role: string
}

interface GroupContextType {
  currentGroup: Group | null
  userGroups: Group[]
  isLoading: boolean
  switchGroup: (groupSlug: string) => void
  refreshGroups: () => Promise<void>
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

interface GroupProviderProps {
  children: ReactNode
  initialGroup?: Group | null
  initialUserGroups?: Group[]
}

export function GroupProvider({ children, initialGroup, initialUserGroups = [] }: GroupProviderProps) {
  const router = useRouter()
  const groupCode = useGroupCode()

  const [currentGroup, setCurrentGroup] = useState<Group | null>(initialGroup || null)
  const [userGroups, setUserGroups] = useState<Group[]>(initialUserGroups)
  const [isLoading, setIsLoading] = useState(false)

  // groupCode가 변경되면 currentGroup 업데이트
  useEffect(() => {
    if (groupCode && userGroups.length > 0) {
      const group = userGroups.find(g => g.slug === groupCode)
      if (group) {
        setCurrentGroup(group)
      }
    }
  }, [groupCode, userGroups])

  const switchGroup = (groupSlug: string) => {
    const group = userGroups.find(g => g.slug === groupSlug)
    if (group) {
      setCurrentGroup(group)
      router.push(`/${groupSlug}/rooms`)
    }
  }

  const refreshGroups = async () => {
    setIsLoading(true)
    try {
      // TODO: API 호출로 사용자 그룹 목록 가져오기
      const response = await fetch('/api/users/me/groups')
      if (response.ok) {
        const groups = await response.json()
        setUserGroups(groups)
      }
    } catch (error) {
      console.error('그룹 목록 가져오기 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GroupContext.Provider
      value={{
        currentGroup,
        userGroups,
        isLoading,
        switchGroup,
        refreshGroups
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider')
  }
  return context
}
