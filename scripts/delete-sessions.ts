import { prisma } from '../packages/backend/lib/prisma'

async function main() {
  await prisma.session.deleteMany()
  console.log('모든 세션 삭제 완료')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
