import { cn } from '@/packages/shared/utils/utils'

interface AppHeaderProps {
  className?: string
}

export function AppHeader({ className = '' }: AppHeaderProps) {
  return (
    <header className={cn(
      "absolute top-0 left-0 w-full px-6 py-4 md:px-10 md:py-5 z-20",
      className
    )}>
      <div className="flex items-center gap-3 text-white">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
          G
        </div>
        <h1 className="text-xl font-bold tracking-tighter">GroupMeet</h1>
      </div>
    </header>
  )
}