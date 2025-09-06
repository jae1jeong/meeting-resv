import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'
import { ChangePasswordRequest } from '@/types/api'
import { changePasswordSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

// PUT /api/users/password - Change user password
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = changePasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || '잘못된 요청입니다',
        400
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true
      }
    })

    if (!user) {
      return errorResponse('사용자를 찾을 수 없습니다', 404)
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return errorResponse('현재 비밀번호가 일치하지 않습니다', 400)
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return errorResponse('새 비밀번호는 현재 비밀번호와 달라야 합니다', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    // Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: session.user.id }
    })

    return successResponse(null, '비밀번호가 변경되었습니다. 다시 로그인해주세요')
  } catch (error) {
    console.error('Error changing password:', error)
    return errorResponse('비밀번호 변경에 실패했습니다', 500)
  }
}