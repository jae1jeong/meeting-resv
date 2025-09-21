import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import * as groupActions from '@/packages/backend/actions/admin/group-actions'

// Prisma 모킹
jest.mock('@/packages/backend/lib/prisma', () => ({
  prisma: {
    group: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    },
    groupMember: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}))

// auth-check 모킹
jest.mock('@/packages/backend/lib/auth-check', () => ({
  requireAdmin: jest.fn().mockResolvedValue({
    id: 'admin-user-id',
    email: 'admin@test.com',
    name: 'Admin User',
    isAdmin: true
  })
}))

// next/cache 모킹
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

const { prisma } = require('@/packages/backend/lib/prisma')

describe('group-actions 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getGroups', () => {
    it('그룹 목록을 올바르게 조회해야 함', async () => {
      const mockGroups = [
        {
          id: 'group1',
          name: '개발팀',
          description: '소프트웨어 개발',
          inviteCode: 'DEV123',
          createdAt: new Date(),
          _count: {
            members: 10,
            rooms: 3
          },
          members: [
            { id: 'member1' },
            { id: 'member2' }
          ]
        }
      ]

      prisma.group.findMany.mockResolvedValue(mockGroups)

      const result = await groupActions.getGroups()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: 'group1',
        name: '개발팀',
        description: '소프트웨어 개발',
        inviteCode: 'DEV123',
        memberCount: 10,
        adminCount: 2,
        roomCount: 3,
        createdAt: mockGroups[0].createdAt
      })

      expect(prisma.group.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              members: true,
              rooms: true
            }
          },
          members: {
            where: {
              role: 'ADMIN'
            },
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    })
  })

  describe('createGroup', () => {
    it('새 그룹을 생성하고 초대 코드를 생성해야 함', async () => {
      const mockGroup = {
        id: 'new-group',
        name: '신규팀',
        description: '새로운 팀',
        inviteCode: 'ABC123'
      }

      prisma.group.create.mockResolvedValue(mockGroup)

      const result = await groupActions.createGroup({
        name: '신규팀',
        description: '새로운 팀'
      })

      expect(result.name).toBe('신규팀')
      expect(result.description).toBe('새로운 팀')

      expect(prisma.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: '신규팀',
            description: '새로운 팀',
            inviteCode: expect.any(String),
            members: {
              create: {
                userId: 'admin-user-id',
                role: 'ADMIN'
              }
            }
          })
        })
      )
    })
  })

  describe('deleteGroup', () => {
    it('그룹을 삭제해야 함', async () => {
      prisma.group.delete.mockResolvedValue({ id: 'group1' })

      const result = await groupActions.deleteGroup('group1')

      expect(result).toEqual({ success: true })
      expect(prisma.group.delete).toHaveBeenCalledWith({
        where: {
          id: 'group1'
        }
      })
    })
  })

  describe('addGroupMember', () => {
    it('그룹에 새 멤버를 추가해야 함', async () => {
      const mockUser = {
        id: 'user1',
        email: 'user@test.com'
      }

      const mockMember = {
        id: 'member1',
        userId: 'user1',
        groupId: 'group1',
        role: 'MEMBER',
        user: mockUser
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.groupMember.findUnique.mockResolvedValue(null)
      prisma.groupMember.create.mockResolvedValue(mockMember)

      const result = await groupActions.addGroupMember({
        groupId: 'group1',
        userEmail: 'user@test.com',
        role: 'MEMBER'
      })

      expect(result).toEqual(mockMember)
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: 'user@test.com'
        }
      })
    })

    it('이미 멤버인 경우 에러를 발생시켜야 함', async () => {
      const mockUser = {
        id: 'user1',
        email: 'user@test.com'
      }

      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.groupMember.findUnique.mockResolvedValue({
        id: 'existing-member'
      })

      await expect(
        groupActions.addGroupMember({
          groupId: 'group1',
          userEmail: 'user@test.com',
          role: 'MEMBER'
        })
      ).rejects.toThrow('이미 그룹의 멤버입니다')
    })

    it('사용자를 찾을 수 없는 경우 에러를 발생시켜야 함', async () => {
      prisma.user.findUnique.mockResolvedValue(null)

      await expect(
        groupActions.addGroupMember({
          groupId: 'group1',
          userEmail: 'nonexistent@test.com',
          role: 'MEMBER'
        })
      ).rejects.toThrow('사용자를 찾을 수 없습니다')
    })
  })

  describe('changeGroupMemberRole', () => {
    it('멤버의 역할을 변경해야 함', async () => {
      const mockUpdatedMember = {
        id: 'member1',
        role: 'ADMIN'
      }

      prisma.groupMember.update.mockResolvedValue(mockUpdatedMember)

      const result = await groupActions.changeGroupMemberRole({
        memberId: 'member1',
        newRole: 'ADMIN'
      })

      expect(result.role).toBe('ADMIN')
      expect(prisma.groupMember.update).toHaveBeenCalledWith({
        where: {
          id: 'member1'
        },
        data: {
          role: 'ADMIN'
        }
      })
    })
  })
})