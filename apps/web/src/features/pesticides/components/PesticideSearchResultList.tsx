import type { PesticideSearchResult } from '@nouyakunote/common'
import { LoaderIcon, SearchIcon } from 'lucide-react'

import { PesticideSearchResultCard } from '@/features/pesticides/components/PesticideSearchResultCard'

type PesticideSearchResultListProps = {
  results: Array<PesticideSearchResult>
  isLoading: boolean
  hasSearched: boolean
}

export const PesticideSearchResultList = ({
  results,
  isLoading,
  hasSearched,
}: PesticideSearchResultListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <LoaderIcon className="size-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">検索中...</p>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <SearchIcon className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          作物名を入力して農薬を検索してください
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <SearchIcon className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          検索結果が見つかりませんでした
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {results.length}件の農薬が見つかりました
      </p>
      {results.map((result) => (
        <PesticideSearchResultCard
          key={result.registrationNumber}
          pesticide={result}
        />
      ))}
    </div>
  )
}
