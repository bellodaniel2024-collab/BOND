import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { SendView } from '@/components/send/SendView'

export const metadata: Metadata = { title: 'Send Cryptocurrency' }

export default function SendPage() {
  return (
    <AppShell>
      <SendView />
    </AppShell>
  )
}
