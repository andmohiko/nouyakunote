import type { PesticideDetail } from '@nouyakunote/common'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const CONSOLE_API_URL = import.meta.env.VITE_CONSOLE_API_URL

export type UsePesticideDetailReturn = {
  pesticide: PesticideDetail | null
  isLoading: boolean
}

export const usePesticideDetail = (
  registrationNumber: string,
): UsePesticideDetailReturn => {
  const [pesticide, setPesticide] = useState<PesticideDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${CONSOLE_API_URL}/api/pesticides/${encodeURIComponent(registrationNumber)}`,
        )

        if (!response.ok) {
          throw new Error('農薬情報の取得に失敗しました')
        }

        const data = (await response.json()) as PesticideDetail
        setPesticide(data)
      } catch (e) {
        console.error(e)
        toast.error('農薬情報の取得に失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [registrationNumber])

  return { pesticide, isLoading }
}
