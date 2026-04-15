import { createFileRoute } from '@tanstack/react-router'

import { FieldListPage } from '@/features/fields/components/FieldListPage'

export const Route = createFileRoute('/_authed/fields/')({
  component: FieldListPage,
})
