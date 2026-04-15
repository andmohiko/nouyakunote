import { createFileRoute } from '@tanstack/react-router'

import { FieldFormPage } from '@/features/fields/components/FieldFormPage'

export const Route = createFileRoute('/_authed/fields/new')({
  component: () => <FieldFormPage mode="create" />,
})
