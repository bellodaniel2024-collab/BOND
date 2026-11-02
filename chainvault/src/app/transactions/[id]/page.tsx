import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { TransactionDetailView } from '@/components/transactions/TransactionDetailView'

export const metadata: Metadata = { title: 'Transaction Details' }

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <AppShell>
      <TransactionDetailView id={id} />
    </AppShell>
  )
}
