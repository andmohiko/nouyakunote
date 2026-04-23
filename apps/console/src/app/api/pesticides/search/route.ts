import { type NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'

/**
 * 作物名で農薬を検索するAPI
 * GET /api/pesticides/search?crop={作物名}
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const crop = request.nextUrl.searchParams.get('crop')

  if (!crop) {
    return NextResponse.json(
      { error: '作物名（crop）は必須です' },
      { status: 400 },
    )
  }

  const applications = await prismaClient.pesticideApplication.findMany({
    where: { cropName: crop },
    include: {
      pesticide: true,
    },
  })

  // 農薬ごとにグルーピング
  const pesticideMap = new Map<
    string,
    {
      registrationNumber: string
      pesticideName: string
      pesticideType: string
      usage: string
      companyName: string
      formulation: string
      applications: Array<{
        cropName: string
        pestName: string
        dilutionRate: string
        usagePeriod: string
        usageMethod: string
        maxCount: string
        totalMaxCount1: string | null
      }>
    }
  >()

  for (const app of applications) {
    const key = app.registrationNumber

    if (!pesticideMap.has(key)) {
      pesticideMap.set(key, {
        registrationNumber: app.pesticide.registrationNumber,
        pesticideName: app.pesticide.pesticideName,
        pesticideType: app.pesticide.pesticideType,
        usage: app.pesticide.usage,
        companyName: app.pesticide.companyName,
        formulation: app.pesticide.formulation,
        applications: [],
      })
    }

    pesticideMap.get(key)?.applications.push({
      cropName: app.cropName,
      pestName: app.pestName,
      dilutionRate: app.dilutionRate,
      usagePeriod: app.usagePeriod,
      usageMethod: app.usageMethod,
      maxCount: app.maxCount,
      totalMaxCount1: app.totalMaxCount1,
    })
  }

  return NextResponse.json({
    pesticides: Array.from(pesticideMap.values()),
  })
}
