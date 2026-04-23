import type { FieldId, UpdateFieldDto } from '@nouyakunote/common'
import { toast } from 'sonner'

import { updateFieldOperation } from '@/infrastructure/firestore/fields'
import { serverTimestamp } from '@/lib/firebase'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'
import type { FieldFormValues } from '../schemas/fieldSchema'

export const useUpdateFieldMutation = (fieldId: FieldId) => {
  const { uid } = useFirebaseAuthContext()

  const updateField = async (values: FieldFormValues): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      const dto: UpdateFieldDto = {
        name: values.name,
        updatedAt: serverTimestamp,
      }

      await updateFieldOperation(fieldId, dto)
      toast.success('圃場を更新しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('圃場の更新に失敗しました')
      throw e
    }
  }

  return { updateField }
}
