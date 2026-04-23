import type { Spray } from '@nouyakunote/common'
import { CalendarIcon, MapPinIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type SprayCardProps = {
  spray: Spray
  onClick: () => void
}

/** 日付を yyyy/MM/dd 形式で表示する */
const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export const SprayCard = ({ spray, onClick }: SprayCardProps) => {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={onClick}>
      <CardContent>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {spray.pesticideName}
              </span>
              <Badge variant="outline">{spray.pesticideUnit}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="size-3.5" />
                {formatDate(spray.sprayedAt)}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="size-3.5" />
                {spray.fieldName}
              </span>
              <span>希釈: {spray.dilutionRate}倍</span>
              <span>散布量: {spray.sprayAmount}L</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
