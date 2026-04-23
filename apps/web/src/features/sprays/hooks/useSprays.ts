import type { Spray } from '@nouyakunote/common'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { SprayFilters } from '@/infrastructure/firestore/sprays'
import { subscribeSpraysOperation } from '@/infrastructure/firestore/sprays'
import { useFirebaseAuthContext } from '@/providers/FirebaseAuthProvider'
import { errorMessage } from '@/utils/errorMessage'

export type UseSpraysReturn = {
  sprays: Array<Spray>
  isLoading: boolean
}

export const useSprays = (filters?: SprayFilters): UseSpraysReturn => {
  const { uid } = useFirebaseAuthContext()
  const [sprays, setSprays] = useState<Array<Spray>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    try {
      const unsubscribe = subscribeSpraysOperation(uid, filters, (items) => {
        setSprays(items)
        setIsLoading(false)
      })
      return () => unsubscribe()
    } catch (e) {
      console.error(errorMessage(e))
      toast.error('散布記録の取得に失敗しました')
      setIsLoading(false)
    }
  }, [uid, filters?.fieldId, filters?.startDate?.getTime(), filters?.endDate?.getTime()])

  return { sprays, isLoading }
}
