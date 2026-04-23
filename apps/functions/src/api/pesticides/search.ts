import type { Request, Response } from 'express'
import { prisma } from '~/lib/prisma'

/**
 * 作物名で農薬を検索する
 * GET /pesticides/search?crop={作物名}
 */
exports.handle = async (req: Request, res: Response) => {
  try {
    const crop = req.query.crop as string | undefined

    if (!crop) {
      return res.status(400).json({ error: '作物名（crop）は必須です' })
    }

    const applications = await prisma.pesticideApplication.findMany({
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

    return res.status(200).json({
      pesticides: Array.from(pesticideMap.values()),
    })
  } catch (error) {
    console.error('農薬検索エラー:', error)
    return res.status(500).json({ error: '農薬の検索に失敗しました' })
  }
}
