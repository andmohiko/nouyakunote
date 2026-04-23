import type { FieldId } from '@nouyakunote/common'
import { toast } from 'sonner'

import { deleteFieldOperation } from '@/infrastructure/firestore/fields'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'

export const useDeleteFieldMutation = () => {
  const { uid } = useFirebaseAuthContext()

  const deleteField = async (fieldId: FieldId): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      await deleteFieldOperation(fieldId)
      toast.success('圃場を削除しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('圃場の削除に失敗しました')
      throw e
    }
  }

  return { deleteField }
}
