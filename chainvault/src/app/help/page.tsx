import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { HelpView } from '@/components/help/HelpView'

export const metadata: Metadata = { title: 'Help & Support' }

export default function HelpPage() {
  return (
    <AppShell>
      <HelpView />
    </AppShell>
  )
}
