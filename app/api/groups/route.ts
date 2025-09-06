import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { CreateGroupRequest, GroupWithMembers } from '@/types/api'

// GET /api/groups - List user's groups
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const includeMembers = searchParams.get('includeMembers') === 'true'

    const skip = (page - 1) * pageSize

    const where = {
      members: {
        some: {
          userId: session.user.id
        }
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          members: includeMembers ? {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          } : false,
          _count: {
            select: {
              members: true,
              rooms: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.group.count({ where })
    ])

    return paginatedResponse(groups, total, page, pageSize)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return errorResponse('그룹 목록을 불러오는데 실패했습니다', 500)
  }
}

// POST /api/groups - Create new group
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return errorResponse('인증이 필요합니다', 401)
    }

    const body: CreateGroupRequest = await request.json()
    const { name, description } = body

    if (!name) {
      return errorResponse('그룹 이름을 입력해주세요', 400)
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            rooms: true
          }
        }
      }
    })

    return successResponse<GroupWithMembers>(group, '그룹이 생성되었습니다', 201)
  } catch (error) {
    console.error('Error creating group:', error)
    return errorResponse('그룹 생성에 실패했습니다', 500)
  }
}