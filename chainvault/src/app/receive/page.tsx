import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { ReceiveView } from '@/components/receive/ReceiveView'

export const metadata: Metadata = { title: 'Receive Cryptocurrency' }

export default function ReceivePage() {
  return (
    <AppShell>
      <ReceiveView />
    </AppShell>
  )
}
