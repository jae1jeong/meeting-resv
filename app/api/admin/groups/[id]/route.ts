import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { UpdateGroupRequest } from '@/packages/shared/types/api/group'
import type { Prisma } from '@prisma/client'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.group.delete({
      where: {
        id: id
      }
    })

    revalidatePath('/admin/groups')
    return successResponse({ success: true }, '그룹이 삭제되었습니다')
  } catch (error) {
    console.error('그룹 삭제 오류:', error)
    return errorResponse('그룹 삭제 중 오류가 발생했습니다', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body: UpdateGroupRequest = await request.json()
    const { name, description, backgroundImage, backgroundBlur, backgroundOpacity, backgroundPosition } = body

    const updateData: Prisma.GroupUpdateInput = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (backgroundImage !== undefined) updateData.backgroundImage = backgroundImage
    if (backgroundBlur !== undefined) updateData.backgroundBlur = backgroundBlur
    if (backgroundOpacity !== undefined) updateData.backgroundOpacity = backgroundOpacity
    if (backgroundPosition !== undefined) updateData.backgroundPosition = backgroundPosition

    const group = await prisma.group.update({
      where: {
        id: id
      },
      data: updateData
    })

    revalidatePath('/admin/groups')
    revalidatePath(`/admin/groups/${id}`)

    // 배경화면 관련 속성이 변경된 경우, 해당 그룹의 모든 회의실 배경화면 캐시 무효화
    const backgroundChanged = 
      backgroundImage !== undefined || 
      backgroundBlur !== undefined || 
      backgroundOpacity !== undefined || 
      backgroundPosition !== undefined

    if (backgroundChanged) {
      const rooms = await prisma.meetingRoom.findMany({
        where: {
          groupId: id
        },
        select: {
          id: true
        }
      })

      // 각 회의실의 배경화면 캐시 태그 무효화
      for (const room of rooms) {
        revalidateTag(`group-background-${room.id}`)
      }

      // 그룹 레벨 태그도 무효화
      revalidateTag(`group-background-group-${id}`)

      // 프리패치: 각 회의실의 배경화면 API를 프리패치하여 새로운 캐시 생성
      // 주의: 인증이 필요한 API이므로 쿠키를 전달해야 함
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const cookieHeader = request.headers.get('cookie') || ''
      
      for (const room of rooms) {
        try {
          // 백그라운드에서 프리패치 (에러는 무시)
          // await 없이 실행하여 응답을 기다리지 않음
          fetch(`${baseUrl}/api/rooms/${room.id}/group-background`, {
            method: 'GET',
            headers: {
              'Cookie': cookieHeader
            },
            cache: 'no-store'
          }).catch(() => {
            // 프리패치 실패는 무시 (다음 요청에서 자동으로 캐시됨)
          })
        } catch {
          // 프리패치 실패는 무시
        }
      }
    }

    return successResponse(group, '그룹이 수정되었습니다')
  } catch (error) {
    console.error('그룹 수정 오류:', error)
    return errorResponse('그룹 수정 중 오류가 발생했습니다', 500)
  }
}

