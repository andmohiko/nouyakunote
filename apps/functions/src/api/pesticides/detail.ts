import type { Request, Response } from 'express'
import { prisma } from '~/lib/prisma'

/**
 * 農薬詳細を取得する
 * GET /pesticides/:registrationNumber
 */
exports.handle = async (req: Request, res: Response) => {
  try {
    const { registrationNumber } = req.params

    if (!registrationNumber) {
      return res.status(400).json({ error: '登録番号は必須です' })
    }

    const pesticide = await prisma.pesticide.findUnique({
      where: { registrationNumber },
      include: {
        applications: true,
      },
    })

    if (!pesticide) {
      return res.status(404).json({ error: '指定された農薬が見つかりません' })
    }

    return res.status(200).json({
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
  } catch (error) {
    console.error('農薬詳細取得エラー:', error)
    return res.status(500).json({ error: '農薬情報の取得に失敗しました' })
  }
}
