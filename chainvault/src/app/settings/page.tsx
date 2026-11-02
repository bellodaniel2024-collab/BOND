import type { Metadata } from 'next'
import { AppShell } from '@/components/layout/AppShell'
import { SettingsView } from '@/components/settings/SettingsView'

export const metadata: Metadata = { title: 'Account Settings' }

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsView />
    </AppShell>
  )
}
