import { NextRequest } from 'next/server'
import { prisma } from '@/packages/backend/lib/prisma'
import { getSession } from '@/packages/backend/auth/auth'
import { successResponse, errorResponse } from '@/packages/backend/utils/api-response'
import { UserResponse } from '@/packages/shared/types/api/user'
import { updateProfileSchema } from '@/packages/backend/validations'

// GET /api/users/profile - Get current user profile
export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        groupMemberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return errorResponse('사용자를 찾을 수 없습니다', 404)
    }

    return successResponse<UserResponse>(user, '프로필을 불러왔습니다')
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return errorResponse('프로필을 불러오는데 실패했습니다', 500)
  }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body = await request.json()
    
    // Validate request body
    const validationResult = updateProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(
        validationResult.error.issues[0]?.message || '잘못된 요청입니다',
        400
      )
    }

    const { name } = validationResult.data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return successResponse<UserResponse>(updatedUser, '프로필이 업데이트되었습니다')
  } catch (error) {
    console.error('Error updating profile:', error)
    return errorResponse('프로필 업데이트에 실패했습니다', 500)
  }
}