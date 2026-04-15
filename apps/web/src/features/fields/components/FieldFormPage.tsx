import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldForm } from '@/features/fields/components/FieldForm'
import { useField } from '@/features/fields/hooks/useField'

type FieldFormPageProps = {
  mode: 'create' | 'edit'
  fieldId?: string
}

export const FieldFormPage = ({ mode, fieldId }: FieldFormPageProps) => {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/fields">
            <ArrowLeftIcon className="size-4" />
            圃場一覧に戻る
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {mode === 'create' ? '圃場を登録' : '圃場を編集'}
        </h1>
      </div>
      {mode === 'edit' && fieldId ? (
        <EditFieldFormLoader fieldId={fieldId} />
      ) : (
        <FieldForm mode="create" />
      )}
    </div>
  )
}

const EditFieldFormLoader = ({ fieldId }: { fieldId: string }) => {
  const { field, isLoading } = useField(fieldId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!field) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        圃場が見つかりませんでした
      </p>
    )
  }

  return <FieldForm mode="edit" field={field} />
}
