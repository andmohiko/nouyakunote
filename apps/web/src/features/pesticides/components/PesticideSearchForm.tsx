import { SearchIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PesticideSearchFormProps = {
  onSearch: (cropName: string) => Promise<void>
  isLoading: boolean
}

export const PesticideSearchForm = ({
  onSearch,
  isLoading,
}: PesticideSearchFormProps) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="作物名を入力（例: 大根、トマト）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={!query.trim() || isLoading}>
        {isLoading ? '検索中...' : '検索'}
      </Button>
    </form>
  )
}
