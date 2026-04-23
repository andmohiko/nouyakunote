import type { SprayId } from '@nouyakunote/common'
import { toast } from 'sonner'

import { deleteSprayOperation } from '@/infrastructure/firestore/sprays'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'

export const useDeleteSprayMutation = () => {
  const { uid } = useFirebaseAuthContext()

  const deleteSpray = async (sprayId: SprayId): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      await deleteSprayOperation(sprayId)
      toast.success('散布記録を削除しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('散布記録の削除に失敗しました')
      throw e
    }
  }

  return { deleteSpray }
}
