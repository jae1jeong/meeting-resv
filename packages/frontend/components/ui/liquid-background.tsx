export function LiquidBackground() {
  return (
    <>
      {/* 보라색 블러 원형 - 좌상단 */}
      <div className="fixed -top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/30 blur-[150px]" />
      
      {/* 파란색 블러 원형 - 우하단 */}
      <div className="fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-500/30 blur-[150px]" />
      
      {/* 인디고색 블러 원형 - 중앙 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/20 blur-[150px]" />
    </>
  )
}