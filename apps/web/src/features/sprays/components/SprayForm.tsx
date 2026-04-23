import { zodResolver } from '@hookform/resolvers/zod'
import type { Spray } from '@nouyakunote/common'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFields } from '@/features/fields/hooks/useFields'
import {
  sprayFormSchema,
  type SprayFormValues,
} from '@/features/sprays/schemas/spraySchema'

/** 今日の日付を yyyy-MM-dd 形式で返す */
const getTodayString = (): string => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Date を yyyy-MM-dd 形式に変換する */
const toDateString = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type SprayFormProps = {
  onCancel: () => void
  onSubmit: (values: SprayFormValues, fieldName: string) => Promise<void>
  defaultValues?: Spray
  submitLabel?: string
}

export const SprayForm = ({
  onCancel,
  onSubmit,
  defaultValues,
  submitLabel = '記録する',
}: SprayFormProps) => {
  const { fields } = useFields()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SprayFormValues>({
    resolver: zodResolver(sprayFormSchema),
    mode: 'all',
    defaultValues: defaultValues
      ? {
          sprayedAt: toDateString(defaultValues.sprayedAt),
          pesticideName: defaultValues.pesticideName,
          registrationNumber: defaultValues.registrationNumber,
          targetCrop: '',
          targetPest: '',
          fieldId: defaultValues.fieldId,
          dilutionRate: defaultValues.dilutionRate,
          sprayAmount: defaultValues.sprayAmount,
          pesticideAmount: defaultValues.pesticideAmount,
          pesticideUnit: defaultValues.pesticideUnit,
          note: defaultValues.note,
        }
      : {
          sprayedAt: getTodayString(),
          pesticideName: '',
          registrationNumber: '',
          targetCrop: '',
          targetPest: '',
          fieldId: '',
          dilutionRate: undefined,
          sprayAmount: undefined,
          pesticideAmount: undefined,
          pesticideUnit: 'ml',
          note: '',
        },
  })

  const selectedFieldId = watch('fieldId')
  const selectedPesticideUnit = watch('pesticideUnit')

  const handleFormSubmit = async (values: SprayFormValues): Promise<void> => {
    const field = fields.find((f) => f.fieldId === values.fieldId)
    const fieldName = field?.name ?? ''
    await onSubmit(values, fieldName)
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-4"
    >
      {/* 散布日 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="sprayedAt">散布日 *</Label>
        <Input
          id="sprayedAt"
          type="date"
          max={getTodayString()}
          {...register('sprayedAt')}
        />
        {errors.sprayedAt && (
          <p className="text-sm text-destructive">{errors.sprayedAt.message}</p>
        )}
      </div>

      {/* 農薬名 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="pesticideName">農薬名 *</Label>
        <Input
          id="pesticideName"
          type="text"
          placeholder="農薬名を入力または検索から選択"
          {...register('pesticideName')}
        />
        {errors.pesticideName && (
          <p className="text-sm text-destructive">
            {errors.pesticideName.message}
          </p>
        )}
      </div>

      {/* 対象作物 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="targetCrop">対象作物 *</Label>
        <Input
          id="targetCrop"
          type="text"
          placeholder="例: 大根"
          {...register('targetCrop')}
        />
        {errors.targetCrop && (
          <p className="text-sm text-destructive">
            {errors.targetCrop.message}
          </p>
        )}
      </div>

      {/* 対象病害虫 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="targetPest">対象病害虫</Label>
        <Input
          id="targetPest"
          type="text"
          placeholder="例: アブラムシ類"
          {...register('targetPest')}
        />
      </div>

      {/* 圃場 */}
      <div className="flex flex-col gap-2">
        <Label>圃場 *</Label>
        <Select
          value={selectedFieldId}
          onValueChange={(value) => setValue('fieldId', value, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="圃場を選択" />
          </SelectTrigger>
          <SelectContent>
            {fields.length === 0 ? (
              <SelectItem value="__empty" disabled>
                圃場を登録してください
              </SelectItem>
            ) : (
              fields.map((field) => (
                <SelectItem key={field.fieldId} value={field.fieldId}>
                  {field.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.fieldId && (
          <p className="text-sm text-destructive">{errors.fieldId.message}</p>
        )}
      </div>

      {/* 希釈倍率 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="dilutionRate">希釈倍率 *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="dilutionRate"
            type="number"
            min={1}
            placeholder="1000"
            {...register('dilutionRate')}
          />
          <span className="shrink-0 text-sm text-muted-foreground">倍</span>
        </div>
        {errors.dilutionRate && (
          <p className="text-sm text-destructive">
            {errors.dilutionRate.message}
          </p>
        )}
      </div>

      {/* 散布量 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="sprayAmount">散布量 *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="sprayAmount"
            type="number"
            min={0}
            step="0.1"
            placeholder="100"
            {...register('sprayAmount')}
          />
          <span className="shrink-0 text-sm text-muted-foreground">L</span>
        </div>
        {errors.sprayAmount && (
          <p className="text-sm text-destructive">
            {errors.sprayAmount.message}
          </p>
        )}
      </div>

      {/* 農薬使用量 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="pesticideAmount">農薬使用量 *</Label>
        <div className="flex items-center gap-2">
          <Input
            id="pesticideAmount"
            type="number"
            min={0}
            step="0.1"
            placeholder="100"
            {...register('pesticideAmount')}
          />
          <Select
            value={selectedPesticideUnit}
            onValueChange={(value) =>
              setValue('pesticideUnit', value as SprayFormValues['pesticideUnit'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.pesticideAmount && (
          <p className="text-sm text-destructive">
            {errors.pesticideAmount.message}
          </p>
        )}
      </div>

      {/* 備考 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="note">備考</Label>
        <Textarea
          id="note"
          placeholder="メモを入力"
          rows={3}
          {...register('note')}
        />
        {errors.note && (
          <p className="text-sm text-destructive">{errors.note.message}</p>
        )}
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
