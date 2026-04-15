import type { CreateFieldDto } from '@vectornote/common'
import { toast } from 'sonner'

import { createFieldOperation } from '@/infrastructure/firestore/fields'
import { serverTimestamp } from '@/lib/firebase'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'
import type { FieldFormValues } from '../schemas/fieldSchema'

export const useCreateFieldMutation = () => {
  const { uid } = useFirebaseAuthContext()

  const createField = async (values: FieldFormValues): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      const dto: CreateFieldDto = {
        name: values.name,
        userId: uid,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp,
      }

      await createFieldOperation(dto)
      toast.success('圃場を登録しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('圃場の登録に失敗しました')
      throw e
    }
  }

  return { createField }
}
