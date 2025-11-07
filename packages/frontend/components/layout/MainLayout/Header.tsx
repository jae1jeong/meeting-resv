// Server Component - No "use client"
import { HeaderClient } from "./HeaderClient"

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
      <div className="flex items-center gap-4">
        <HeaderClient />
        <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
      </div>
    </header>
  )
}