import type { PesticideApplicationDetail } from '@nouyakunote/common'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PesticideApplicationTableProps = {
  applications: Array<PesticideApplicationDetail>
}

export const PesticideApplicationTable = ({
  applications,
}: PesticideApplicationTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>適用情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  作物名
                </th>
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  対象病害虫
                </th>
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  希釈倍数
                </th>
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  使用時期
                </th>
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  使用方法
                </th>
                <th className="whitespace-nowrap pb-2 pr-4 font-medium text-muted-foreground">
                  使用回数
                </th>
                <th className="whitespace-nowrap pb-2 font-medium text-muted-foreground">
                  総使用回数
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.cropName}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.pestName}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.dilutionRate}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.usagePeriod}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.usageMethod}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-4">
                    {app.maxCount}
                  </td>
                  <td className="whitespace-nowrap py-2.5">
                    {app.totalMaxCount1 ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
