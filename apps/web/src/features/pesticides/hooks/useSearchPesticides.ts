import type { PesticideSearchResult } from '@nouyakunote/common'
import { useState } from 'react'
import { toast } from 'sonner'

const CONSOLE_API_URL = import.meta.env.VITE_CONSOLE_API_URL

export type UseSearchPesticidesReturn = {
  results: Array<PesticideSearchResult>
  isLoading: boolean
  hasSearched: boolean
  search: (cropName: string) => Promise<void>
}

export const useSearchPesticides = (): UseSearchPesticidesReturn => {
  const [results, setResults] = useState<Array<PesticideSearchResult>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = async (cropName: string): Promise<void> => {
    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(
        `${CONSOLE_API_URL}/api/pesticides/search?crop=${encodeURIComponent(cropName)}`,
      )

      if (!response.ok) {
        throw new Error('検索に失敗しました')
      }

      const data = (await response.json()) as {
        pesticides: Array<PesticideSearchResult>
      }
      setResults(data.pesticides)
    } catch (e) {
      console.error(e)
      toast.error('農薬の検索に失敗しました')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return { results, isLoading, hasSearched, search }
}
