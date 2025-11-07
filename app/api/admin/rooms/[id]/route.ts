import { NextRequest } from 'next/server'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { prisma } from '@/packages/backend/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    await prisma.meetingRoom.delete({
      where: {
        id: id
      }
    })

    revalidatePath('/admin/rooms')
    return successResponse({ success: true }, '회의실이 삭제되었습니다')
  } catch (error) {
    console.error('회의실 삭제 오류:', error)
    return errorResponse('회의실 삭제 중 오류가 발생했습니다', 500)
  }
}



