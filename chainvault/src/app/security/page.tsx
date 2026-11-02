import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { SecurityView } from '@/components/security/SecurityView'

export const metadata: Metadata = { title: 'Security Settings' }

export default function SecurityPage() {
  return (
    <AppShell>
      <SecurityView />
    </AppShell>
  )
}
