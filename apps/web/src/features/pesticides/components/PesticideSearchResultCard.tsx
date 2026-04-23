import type { PesticideSearchResult } from '@nouyakunote/common'
import { Link } from '@tanstack/react-router'
import { ChevronRightIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type PesticideSearchResultCardProps = {
  pesticide: PesticideSearchResult
}

export const PesticideSearchResultCard = ({
  pesticide,
}: PesticideSearchResultCardProps) => {
  const firstApp = pesticide.applications[0]

  return (
    <Link
      to="/pesticide/$id"
      params={{ id: pesticide.registrationNumber }}
      className="block no-underline"
    >
      <Card className="transition-colors hover:bg-accent">
        <CardContent>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {pesticide.pesticideName}
                </span>
                <Badge variant="secondary">{pesticide.pesticideType}</Badge>
              </div>
              {firstApp && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>対象: {firstApp.pestName}</span>
                  <span>希釈: {firstApp.dilutionRate}</span>
                  <span>使用回数: {firstApp.maxCount}</span>
                </div>
              )}
            </div>
            <ChevronRightIcon className="mt-1 size-5 shrink-0 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
