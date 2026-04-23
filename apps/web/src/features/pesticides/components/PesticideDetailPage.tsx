import { LoaderIcon } from 'lucide-react'

import { PesticideApplicationTable } from '@/features/pesticides/components/PesticideApplicationTable'
import { PesticideDetailCard } from '@/features/pesticides/components/PesticideDetailCard'
import { usePesticideDetail } from '@/features/pesticides/hooks/usePesticideDetail'

type PesticideDetailPageProps = {
  pesticideId: string
}

export const PesticideDetailPage = ({
  pesticideId,
}: PesticideDetailPageProps) => {
  const { pesticide, isLoading } = usePesticideDetail(pesticideId)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <LoaderIcon className="size-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (!pesticide) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          農薬情報が見つかりませんでした
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PesticideDetailCard pesticide={pesticide} />
      <PesticideApplicationTable applications={pesticide.applications} />
    </div>
  )
}
