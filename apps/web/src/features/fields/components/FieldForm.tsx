import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { Field } from '@nouyakunote/common'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DeleteFieldDialog } from '@/features/fields/components/DeleteFieldDialog'
import { useCreateFieldMutation } from '@/features/fields/hooks/useCreateFieldMutation'
import { useUpdateFieldMutation } from '@/features/fields/hooks/useUpdateFieldMutation'
import {
  fieldFormSchema,
  type FieldFormValues,
} from '@/features/fields/schemas/fieldSchema'

type FieldFormProps =
  | { mode: 'create'; field?: undefined }
  | { mode: 'edit'; field: Field }

export const FieldForm = ({ mode, field }: FieldFormProps) => {
  const navigate = useNavigate()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { createField } = useCreateFieldMutation()
  const { updateField } = useUpdateFieldMutation(field?.fieldId ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    mode: 'all',
    defaultValues: {
      name: field?.name ?? '',
    },
  })

  const onSubmit = async (values: FieldFormValues): Promise<void> => {
    if (mode === 'create') {
      await createField(values)
    } else {
      await updateField(values)
    }
    navigate({ to: '/fields' })
  }

  return (
    <>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fieldName">圃場名 *</Label>
              <Input
                id="fieldName"
                type="text"
                placeholder="例: 第1圃場"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-between pt-2">
              {mode === 'edit' ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  削除
                </Button>
              ) : (
                <div />
              )}
              <Button type="submit" disabled={isSubmitting}>
                {mode === 'create' ? '登録する' : '更新する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {mode === 'edit' && field && (
        <DeleteFieldDialog
          fieldId={field.fieldId}
          fieldName={field.name}
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  )
}
