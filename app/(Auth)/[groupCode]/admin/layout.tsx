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
    <div className={cn("relative min-h-screen w-full")}>
      <AdminSidebar />
      <main className={cn(
        "ml-64 pt-16 min-h-screen",
        "p-8"
      )}>
        <div className={cn("max-w-7xl mx-auto")}>
          {children}
        </div>
      </main>
    </div>
  )
}