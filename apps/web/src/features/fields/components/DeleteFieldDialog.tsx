import { useNavigate } from '@tanstack/react-router'
import type { FieldId } from '@vectornote/common'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteFieldMutation } from '@/features/fields/hooks/useDeleteFieldMutation'

type DeleteFieldDialogProps = {
  fieldId: FieldId
  fieldName: string
  open: boolean
  onClose: () => void
}

export const DeleteFieldDialog = ({
  fieldId,
  fieldName,
  open,
  onClose,
}: DeleteFieldDialogProps) => {
  const navigate = useNavigate()
  const { deleteField } = useDeleteFieldMutation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true)
    try {
      await deleteField(fieldId)
      onClose()
      navigate({ to: '/fields' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>圃場を削除</DialogTitle>
          <DialogDescription>
            「{fieldName}」を削除してもよろしいですか？この圃場に紐づく散布記録がある場合、記録の圃場情報が失われます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
