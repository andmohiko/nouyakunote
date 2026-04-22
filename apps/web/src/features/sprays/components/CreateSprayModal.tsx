import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateSprayMutation } from '@/features/sprays/hooks/useCreateSprayMutation'
import { SprayForm } from '@/features/sprays/components/SprayForm'
import type { SprayFormValues } from '@/features/sprays/schemas/spraySchema'

type CreateSprayModalProps = {
  open: boolean
  onClose: () => void
}

export const CreateSprayModal = ({ open, onClose }: CreateSprayModalProps) => {
  const { createSpray } = useCreateSprayMutation()

  const handleSubmit = async (
    values: SprayFormValues,
    fieldName: string,
  ): Promise<void> => {
    await createSpray(values, fieldName)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>散布記録を登録</DialogTitle>
        </DialogHeader>
        <SprayForm onCancel={onClose} onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
