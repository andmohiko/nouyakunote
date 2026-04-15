import type { Field } from '@vectornote/common'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { subscribeFieldsOperation } from '@/infrastructure/firestore/fields'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'

export type UseFieldsReturn = {
  fields: Array<Field>
  isLoading: boolean
}

export const useFields = (): UseFieldsReturn => {
  const { uid } = useFirebaseAuthContext()
  const [fields, setFields] = useState<Array<Field>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    try {
      const unsubscribe = subscribeFieldsOperation(uid, (items) => {
        setFields(items)
        setIsLoading(false)
      })
      return () => unsubscribe()
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('圃場の取得に失敗しました')
      setIsLoading(false)
    }
  }, [uid])

  return { fields, isLoading }
}
