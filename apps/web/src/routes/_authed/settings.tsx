import { createFileRoute } from '@tanstack/react-router'

import { SettingsPage } from '@/features/settings/components/SettingsPage'

export const Route = createFileRoute('/_authed/settings')({
  component: SettingsPage,
})
