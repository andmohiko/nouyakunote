import type { Spray } from '@vectornote/common'
import { SprayCanIcon } from 'lucide-react'

import { Spinner } from '@/components/ui/spinner'
import { SprayCard } from '@/features/sprays/components/SprayCard'

type SprayListProps = {
  sprays: Array<Spray>
  isLoading: boolean
  onSelect: (spray: Spray) => void
}

export const SprayList = ({ sprays, isLoading, onSelect }: SprayListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (sprays.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <SprayCanIcon className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">散布記録がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sprays.map((spray) => (
        <SprayCard
          key={spray.sprayId}
          spray={spray}
          onClick={() => onSelect(spray)}
        />
      ))}
    </div>
  )
}
