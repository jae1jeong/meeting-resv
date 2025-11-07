import { requireAdmin } from '@/packages/backend/lib/auth-check'
import AdminUsersClient from './users-client'

async function fetchUsers() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/users`, {
    cache: 'no-store'
  })
  if (response.ok) {
    const result = await response.json()
    return result.success ? result.data : []
  }
  return []
}

export default async function AdminUsersPage() {
  await requireAdmin()

  const users = await fetchUsers()

  return <AdminUsersClient initialUsers={users} />
}