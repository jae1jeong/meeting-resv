import { ReactNode } from 'react'
import { AdminSidebar } from '@/packages/frontend/components/admin/layout/admin-sidebar'
import { cn } from '@/packages/shared/utils/utils'
import { requireAdmin } from '@/packages/backend/lib/auth-check'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 어드민 권한 체크
  await requireAdmin()
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900")}>
      <AdminSidebar />
      <main className={cn(
        "ml-64 pt-16 min-h-[calc(100vh-4rem)]",
        "p-8"
      )}>
        <div className={cn("max-w-7xl mx-auto")}>
          {children}
        </div>
      </main>
    </div>
  )
}