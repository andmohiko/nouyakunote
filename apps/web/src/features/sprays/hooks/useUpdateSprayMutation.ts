import type { PesticideUnit, SprayId, UpdateSprayDto } from '@nouyakunote/common'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'sonner'

import { updateSprayOperation } from '@/infrastructure/firestore/sprays'
import { serverTimestamp } from '@/lib/firebase'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'
import type { SprayFormValues } from '../schemas/spraySchema'

export const useUpdateSprayMutation = (sprayId: SprayId) => {
  const { uid } = useFirebaseAuthContext()

  const updateSpray = async (
    values: SprayFormValues,
    fieldName: string,
  ): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      const dto: UpdateSprayDto = {
        dilutionRate: values.dilutionRate,
        fieldId: values.fieldId,
        fieldName,
        note: values.note ?? '',
        pesticideAmount: values.pesticideAmount,
        pesticideName: values.pesticideName,
        pesticideUnit: values.pesticideUnit as PesticideUnit,
        registrationNumber: values.registrationNumber ?? '',
        sprayAmount: values.sprayAmount,
        sprayedAt: Timestamp.fromDate(new Date(values.sprayedAt)),
        updatedAt: serverTimestamp,
      }

      await updateSprayOperation(sprayId, dto)
      toast.success('散布記録を更新しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('散布記録の更新に失敗しました')
      throw e
    }
  }

  return { updateSpray }
}
