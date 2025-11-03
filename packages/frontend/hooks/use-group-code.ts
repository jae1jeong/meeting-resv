'use client'

import { useParams } from 'next/navigation'

/**
 * URL params에서 groupCode를 추출하는 훅
 */
export function useGroupCode(): string | null {
  const params = useParams()
  const groupCode = params?.groupCode

  if (typeof groupCode === 'string') {
    return groupCode
  }

  return null
}
