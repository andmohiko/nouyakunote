import type { Spray } from '@vectornote/common'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteSprayMutation } from '@/features/sprays/hooks/useDeleteSprayMutation'
import { useUpdateSprayMutation } from '@/features/sprays/hooks/useUpdateSprayMutation'
import { SprayForm } from '@/features/sprays/components/SprayForm'
import type { SprayFormValues } from '@/features/sprays/schemas/spraySchema'

type SprayDetailModalProps = {
  spray: Spray | null
  open: boolean
  onClose: () => void
}

/** 日付を yyyy/MM/dd 形式で表示する */
const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export const SprayDetailModal = ({
  spray,
  open,
  onClose,
}: SprayDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { updateSpray } = useUpdateSprayMutation(spray?.sprayId ?? '')
  const { deleteSpray } = useDeleteSprayMutation()

  if (!spray) return null

  const handleUpdate = async (
    values: SprayFormValues,
    fieldName: string,
  ): Promise<void> => {
    await updateSpray(values, fieldName)
    setIsEditing(false)
    onClose()
  }

  const handleDelete = async (): Promise<void> => {
    await deleteSpray(spray.sprayId)
    setIsDeleteDialogOpen(false)
    onClose()
  }

  const handleClose = (): void => {
    setIsEditing(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? '散布記録を編集' : '散布記録の詳細'}
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <SprayForm
              onCancel={() => setIsEditing(false)}
              onSubmit={handleUpdate}
              defaultValues={spray}
              submitLabel="更新する"
            />
          ) : (
            <div className="flex flex-col gap-4">
              <DetailRow label="散布日" value={formatDate(spray.sprayedAt)} />
              <DetailRow label="農薬名" value={spray.pesticideName} />
              {spray.registrationNumber && (
                <DetailRow
                  label="農薬登録番号"
                  value={spray.registrationNumber}
                />
              )}
              <DetailRow label="圃場" value={spray.fieldName} />
              <DetailRow
                label="希釈倍率"
                value={`${spray.dilutionRate}倍`}
              />
              <DetailRow
                label="散布量"
                value={`${spray.sprayAmount}L`}
              />
              <DetailRow
                label="農薬使用量"
                value={`${spray.pesticideAmount}${spray.pesticideUnit}`}
              />
              {spray.note && <DetailRow label="備考" value={spray.note} />}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  削除
                </Button>
                <Button onClick={() => setIsEditing(true)}>編集</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>散布記録を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。「{spray.pesticideName}」の散布記録を削除します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type DetailRowProps = {
  label: string
  value: string
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
)
