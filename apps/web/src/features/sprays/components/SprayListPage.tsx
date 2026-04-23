import type { Spray } from '@nouyakunote/common'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { CreateSprayModal } from '@/features/sprays/components/CreateSprayModal'
import { SprayDetailModal } from '@/features/sprays/components/SprayDetailModal'
import { SprayFilterForm } from '@/features/sprays/components/SprayFilterForm'
import { SprayList } from '@/features/sprays/components/SprayList'
import { useSprays } from '@/features/sprays/hooks/useSprays'
import type { SprayFilters } from '@/infrastructure/firestore/sprays'

export const SprayListPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSpray, setSelectedSpray] = useState<Spray | null>(null)
  const [filters, setFilters] = useState<SprayFilters>({})
  const { sprays, isLoading } = useSprays(filters)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">散布記録</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="size-4" />
          新規登録
        </Button>
      </div>
      <SprayFilterForm filters={filters} onChangeFilters={setFilters} />
      <SprayList
        sprays={sprays}
        isLoading={isLoading}
        onSelect={setSelectedSpray}
      />
      <CreateSprayModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <SprayDetailModal
        spray={selectedSpray}
        open={selectedSpray !== null}
        onClose={() => setSelectedSpray(null)}
      />
    </div>
  )
}
