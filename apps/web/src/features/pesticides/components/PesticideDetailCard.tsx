import type { PesticideDetail } from '@nouyakunote/common'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, SprayCanIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PesticideDetailCardProps = {
  pesticide: PesticideDetail
}

export const PesticideDetailCard = ({
  pesticide,
}: PesticideDetailCardProps) => {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/search">
          <ArrowLeftIcon className="size-4" />
          検索に戻る
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {pesticide.pesticideName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                登録番号: {pesticide.registrationNumber}
              </p>
            </div>
            <Badge variant="secondary">{pesticide.pesticideType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">用途</dt>
              <dd className="font-medium">{pesticide.usage}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">剤型</dt>
              <dd className="font-medium">{pesticide.formulation}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">製造元</dt>
              <dd className="font-medium">{pesticide.companyName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">有効成分</dt>
              <dd className="font-medium">{pesticide.activeIngredient}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">濃度</dt>
              <dd className="font-medium">{pesticide.concentration}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" asChild>
        <Link to="/sprays">
          <SprayCanIcon className="size-4" />
          この農薬で記録する
        </Link>
      </Button>
    </div>
  )
}
