import { NextRequest, NextResponse } from 'next/server'
import { prismaClient } from '@/lib/prisma'

type Params = {
  params: Promise<{ registrationNumber: string }>
}

/**
 * 農薬詳細を取得するAPI
 * GET /api/pesticides/[registrationNumber]
 */
export const GET = async (
  _request: NextRequest,
  { params }: Params,
): Promise<NextResponse> => {
  const { registrationNumber } = await params

  const pesticide = await prismaClient.pesticide.findUnique({
    where: { registrationNumber },
    include: {
      applications: true,
    },
  })

  if (!pesticide) {
    return NextResponse.json(
      { error: '指定された農薬が見つかりません' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    registrationNumber: pesticide.registrationNumber,
    pesticideName: pesticide.pesticideName,
    pesticideType: pesticide.pesticideType,
    usage: pesticide.usage,
    companyName: pesticide.companyName,
    formulation: pesticide.formulation,
    activeIngredient: pesticide.activeIngredient,
    concentration: pesticide.concentration,
    registrationDate: pesticide.registrationDate,
    applications: pesticide.applications.map((app) => ({
      cropName: app.cropName,
      applicationPlace: app.applicationPlace,
      pestName: app.pestName,
      purpose: app.purpose,
      dilutionRate: app.dilutionRate,
      sprayVolume: app.sprayVolume,
      usagePeriod: app.usagePeriod,
      maxCount: app.maxCount,
      usageMethod: app.usageMethod,
      totalMaxCount1: app.totalMaxCount1,
      totalMaxCount2: app.totalMaxCount2,
      totalMaxCount3: app.totalMaxCount3,
      totalMaxCount4: app.totalMaxCount4,
      totalMaxCount5: app.totalMaxCount5,
    })),
  })
}
