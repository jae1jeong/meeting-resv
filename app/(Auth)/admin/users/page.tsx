import { requireAdmin } from '@/packages/backend/lib/auth-check'
import { getAllUsers } from '@/packages/backend/actions/admin/user-admin-actions'
import AdminUsersClient from './users-client'

export default async function AdminUsersPage() {
  await requireAdmin()

  const users = await getAllUsers()

  return <AdminUsersClient initialUsers={users} />
}