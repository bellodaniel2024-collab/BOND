import type { Metadata } from 'next'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  )
}
