import type { Metadata } from 'next'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  )
}
