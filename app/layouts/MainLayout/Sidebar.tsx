// Server Component - No "use client"
import { CreateButton } from "./CreateButton"

interface SidebarProps {
  children?: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="w-64 h-full glass rounded-tr-3xl p-4 shadow-xl flex flex-col justify-between">
      <div>
        <CreateButton />
        {children}
      </div>
    </div>
  )
}