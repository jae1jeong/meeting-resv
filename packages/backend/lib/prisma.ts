import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma 클라이언트 생성 (로깅 추가)
const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Prisma 확장으로 날짜 처리 로직 추가
const extendedPrisma = prismaClient.$extends({
  query: {
    booking: {
      async create({ args, query }) {
        // 생성 시 date 필드는 이미 parseKSTDate를 통해 올바른 UTC 날짜로 변환됨
        // 추가 변환 없이 그대로 사용
        if (args.data?.date) {
          console.log('📅 [PRISMA] Create - date 필드:', args.data.date)
        }
        return query(args)
      },
      async update({ args, query }) {
        // 수정 시 date 필드도 이미 올바른 형식
        if (args.data?.date) {
          console.log('📅 [PRISMA] Update - date 필드:', args.data.date)
        }
        return query(args)
      },
      async findMany({ args, query }) {
        const result = await query(args)
        // 조회 결과는 그대로 반환 (이미 UTC 날짜가 올바르게 저장됨)
        result.forEach((booking: any) => {
          if (booking?.date) {
            console.log('📅 [PRISMA] FindMany - 조회된 날짜:', booking.date)
          }
        })
        return result
      },
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result?.date) {
          console.log('📅 [PRISMA] FindFirst - 조회된 날짜:', result.date)
        }
        return result
      },
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result?.date) {
          console.log('📅 [PRISMA] FindUnique - 조회된 날짜:', result.date)
        }
        return result
      }
    }
  }
})

export const prisma = global.prisma || extendedPrisma

if (process.env.NODE_ENV !== 'production') {
  global.prisma = extendedPrisma as any
}

export default prisma