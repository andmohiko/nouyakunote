import { Link } from '@tanstack/react-router'
import type { Field } from '@vectornote/common'
import { MapPinIcon, PencilIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type FieldCardProps = {
  field: Field
}

export const FieldCard = ({ field }: FieldCardProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">{field.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to="/fields/$fieldId" params={{ fieldId: field.fieldId }}>
              <PencilIcon className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
