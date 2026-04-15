import { createFileRoute } from '@tanstack/react-router'

import { FieldFormPage } from '@/features/fields/components/FieldFormPage'

export const Route = createFileRoute('/_authed/fields/$fieldId')({
  component: FieldEditRoute,
})

function FieldEditRoute() {
  const { fieldId } = Route.useParams()
  return <FieldFormPage mode="edit" fieldId={fieldId} />
}
