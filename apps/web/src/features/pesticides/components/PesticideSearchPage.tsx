import { PesticideSearchForm } from '@/features/pesticides/components/PesticideSearchForm'
import { PesticideSearchResultList } from '@/features/pesticides/components/PesticideSearchResultList'
import { useSearchPesticides } from '@/features/pesticides/hooks/useSearchPesticides'

export const PesticideSearchPage = () => {
  const { results, isLoading, hasSearched, search } = useSearchPesticides()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-bold">農薬検索</h1>
      <PesticideSearchForm onSearch={search} isLoading={isLoading} />
      <PesticideSearchResultList
        results={results}
        isLoading={isLoading}
        hasSearched={hasSearched}
      />
    </div>
  )
}
