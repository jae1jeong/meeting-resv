import { prisma } from '../packages/backend/lib/prisma'

/**
 * 문자열을 URL-friendly slug로 변환
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '') // 특수문자 제거 (한글 유지)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .trim()
}

/**
 * 고유한 slug 생성 (중복 방지)
 */
async function generateUniqueSlug(baseName: string, existingSlugs: Set<string>): Promise<string> {
  let slug = generateSlug(baseName)
  let counter = 1

  // 중복되지 않을 때까지 숫자 추가
  while (existingSlugs.has(slug)) {
    slug = `${generateSlug(baseName)}-${counter}`
    counter++
  }

  existingSlugs.add(slug)
  return slug
}

async function main() {
  console.log('🔄 그룹 slug 마이그레이션 시작...')

  // 모든 그룹 조회
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })

  console.log(`📊 총 ${groups.length}개의 그룹 발견`)

  // 이미 존재하는 slug들
  const existingSlugs = new Set<string>(
    groups.filter(g => g.slug).map(g => g.slug as string)
  )

  // slug가 없는 그룹들 업데이트
  const groupsWithoutSlug = groups.filter(g => !g.slug)
  console.log(`🔧 ${groupsWithoutSlug.length}개의 그룹에 slug 생성 필요`)

  for (const group of groupsWithoutSlug) {
    const slug = await generateUniqueSlug(group.name, existingSlugs)

    await prisma.group.update({
      where: { id: group.id },
      data: { slug }
    })

    console.log(`  ✅ ${group.name} → ${slug}`)
  }

  console.log('✨ 마이그레이션 완료!')
}

main()
  .catch((e) => {
    console.error('❌ 마이그레이션 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
