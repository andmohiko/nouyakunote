import { FilterIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFields } from '@/features/fields/hooks/useFields'
import type { SprayFilters } from '@/infrastructure/firestore/sprays'

type SprayFilterFormProps = {
  filters: SprayFilters
  onChangeFilters: (filters: SprayFilters) => void
}

export const SprayFilterForm = ({
  filters,
  onChangeFilters,
}: SprayFilterFormProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { fields } = useFields()

  const handleStartDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = e.target.value
    onChangeFilters({
      ...filters,
      startDate: value ? new Date(value) : undefined,
    })
  }

  const handleEndDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value = e.target.value
    onChangeFilters({
      ...filters,
      endDate: value ? new Date(value) : undefined,
    })
  }

  const handleFieldChange = (value: string): void => {
    onChangeFilters({
      ...filters,
      fieldId: value === 'all' ? undefined : value,
    })
  }

  /** Date を yyyy-MM-dd 形式に変換する */
  const toInputDate = (date: Date | undefined): string => {
    if (!date) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FilterIcon className="size-4" />
        フィルター
      </Button>

      {isOpen && (
        <Card className="mt-3">
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label>期間（開始日）</Label>
                <Input
                  type="date"
                  value={toInputDate(filters.startDate)}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>期間（終了日）</Label>
                <Input
                  type="date"
                  value={toInputDate(filters.endDate)}
                  onChange={handleEndDateChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>圃場</Label>
                <Select
                  value={filters.fieldId ?? 'all'}
                  onValueChange={handleFieldChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {fields.map((field) => (
                      <SelectItem key={field.fieldId} value={field.fieldId}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
