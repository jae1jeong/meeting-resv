/**
 * 그룹 관련 유틸리티 함수
 */

import { prisma } from './prisma'

/**
 * 고유한 6자리 그룹 초대 코드 생성
 * 형식: 대문자 + 숫자 조합 (예: A1B2C3)
 */
export async function generateUniqueInviteCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // 데이터베이스에서 중복 확인
    const existingGroup = await prisma.group.findUnique({
      where: { inviteCode: code }
    })

    if (!existingGroup) {
      return code
    }

    attempts++
  }

  throw new Error('고유한 초대 코드 생성에 실패했습니다')
}

/**
 * 초대 코드 유효성 검증
 * @param code 초대 코드
 * @returns 유효한 그룹 정보 또는 null
 */
export async function validateInviteCode(code: string) {
  if (!code || code.length !== 6) {
    return null
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode: code.toUpperCase() },
    include: {
      members: true,
      _count: {
        select: { members: true }
      }
    }
  })

  if (!group || !group.inviteCode) {
    return null
  }

  // 코드 만료 확인
  if (group.codeExpiresAt && group.codeExpiresAt < new Date()) {
    return null
  }

  return group
}

/**
 * 그룹 초대 코드 재생성
 * @param groupId 그룹 ID
 * @param expiresInDays 만료 일수 (선택적, 기본 30일)
 */
export async function regenerateInviteCode(groupId: string, expiresInDays = 30) {
  const newCode = await generateUniqueInviteCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  return await prisma.group.update({
    where: { id: groupId },
    data: {
      inviteCode: newCode,
      codeExpiresAt: expiresAt
    }
  })
}

/**
 * 초대 코드 비활성화
 * @param groupId 그룹 ID
 */
export async function disableInviteCode(groupId: string) {
  return await prisma.group.update({
    where: { id: groupId },
    data: {
      inviteCode: null,
      codeExpiresAt: null
    }
  })
}