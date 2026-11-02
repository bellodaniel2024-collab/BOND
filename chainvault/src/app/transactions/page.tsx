import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { TransactionsView } from '@/components/transactions/TransactionsView'

export const metadata: Metadata = { title: 'Transaction History' }

export default function TransactionsPage() {
  return (
    <AppShell>
      <TransactionsView />
    </AppShell>
  )
}
