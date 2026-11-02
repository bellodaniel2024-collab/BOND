import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { AssetsView } from '@/components/assets/AssetsView'

export const metadata: Metadata = { title: 'Supported Assets' }

export default function AssetsPage() {
  return (
    <AppShell>
      <AssetsView />
    </AppShell>
  )
}
