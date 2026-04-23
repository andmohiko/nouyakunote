import type { Field, FieldId } from '@nouyakunote/common'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { subscribeFieldOperation } from '@/infrastructure/firestore/fields'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'

export type UseFieldReturn = {
  field: Field | null | undefined
  isLoading: boolean
}

export const useField = (fieldId: FieldId): UseFieldReturn => {
  const { uid } = useFirebaseAuthContext()
  const [field, setField] = useState<Field | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!uid || !fieldId) return

    try {
      const unsubscribe = subscribeFieldOperation(fieldId, (data) => {
        setField(data)
        setIsLoading(false)
      })
      return () => unsubscribe()
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('圃場の取得に失敗しました')
      setIsLoading(false)
    }
  }, [uid, fieldId])

  return { field, isLoading }
}
