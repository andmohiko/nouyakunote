import type { CreateSprayDto, PesticideUnit } from '@nouyakunote/common'
import { Timestamp } from 'firebase/firestore'
import { toast } from 'sonner'

import { createSprayOperation } from '@/infrastructure/firestore/sprays'
import { serverTimestamp } from '@/lib/firebase'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'
import type { SprayFormValues } from '../schemas/spraySchema'

export const useCreateSprayMutation = () => {
  const { uid } = useFirebaseAuthContext()

  const createSpray = async (
    values: SprayFormValues,
    fieldName: string,
  ): Promise<void> => {
    if (!uid) throw new Error('認証エラー：再ログインしてください')

    try {
      const dto: CreateSprayDto = {
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
        userId: uid,
        createdAt: serverTimestamp,
        updatedAt: serverTimestamp,
      }

      await createSprayOperation(dto)
      toast.success('散布記録を登録しました')
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('散布記録の登録に失敗しました')
      throw e
    }
  }

  return { createSpray }
}
