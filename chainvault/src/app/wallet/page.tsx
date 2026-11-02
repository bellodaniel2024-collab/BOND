import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { WalletConnectionView } from '@/components/wallet/WalletConnectionView'

export const metadata: Metadata = { title: 'Wallet Connection' }

export default function WalletPage() {
  return (
    <AppShell>
      <WalletConnectionView />
    </AppShell>
  )
}
