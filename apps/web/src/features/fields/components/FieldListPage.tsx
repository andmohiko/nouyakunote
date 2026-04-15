import { Link } from '@tanstack/react-router'
import { Loader2Icon, MapIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FieldCard } from '@/features/fields/components/FieldCard'
import { useFields } from '@/features/fields/hooks/useFields'

export const FieldListPage = () => {
  const { fields, isLoading } = useFields()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">圃場管理</h1>
        <Button asChild>
          <Link to="/fields/new">
            <PlusIcon className="size-4" />
            圃場を登録
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : fields.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <MapIcon className="size-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              圃場が登録されていません
            </p>
            <p className="text-sm text-muted-foreground">
              散布記録を登録するには、先に圃場を登録してください
            </p>
          </div>
          <Button asChild>
            <Link to="/fields/new">圃場を登録する</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <FieldCard key={field.fieldId} field={field} />
          ))}
        </div>
      )}
    </div>
  )
}
