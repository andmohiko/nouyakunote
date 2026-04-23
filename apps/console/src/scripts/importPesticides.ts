import 'dotenv/config'
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'csv-parse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CHUNK_SIZE = 1000
const CSV_DIR = resolve(__dirname, '../../../../assets/csv')

type PesticideCsvRow = {
  registration_number: string
  pesticide_type: string
  pesticide_name: string
  company_name: string
  active_ingredient: string
  active_ingredient_for_total_count: string
  concentration: string
  mix_count: string
  usage: string
  formulation: string
  registration_date: string
}

type ApplicationCsvRow = {
  registration_number: string
  usage: string
  pesticide_type: string
  pesticide_name: string
  company_abbreviation: string
  crop_name: string
  application_place: string
  pest_name: string
  purpose: string
  dilution_rate: string
  spray_volume: string
  usage_period: string
  max_count: string
  usage_method: string
  fumigation_time: string
  fumigation_temperature: string
  application_soil: string
  application_area: string
  application_pesticide_name: string
  mix_count: string
  total_max_count_1: string
  total_max_count_2: string
  total_max_count_3: string
  total_max_count_4: string
  total_max_count_5: string
}

const parseCsv = <T>(filePath: string): Promise<Array<T>> => {
  return new Promise((resolve, reject) => {
    const records: Array<T> = []
    createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row: T) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err))
  })
}

const toNullableString = (value: string): string | null => {
  return value === '' ? null : value
}

const parseRegistrationDate = (value: string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const importPesticides = async (): Promise<void> => {
  console.log('🌱 農薬基本情報のインポートを開始します...')

  const rows = await parseCsv<PesticideCsvRow>(
    resolve(CSV_DIR, 'pesticides.csv'),
  )
  console.log(`  ${rows.length} 件の農薬データを読み込みました`)

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)

    await prisma.$transaction(
      chunk.map((row) =>
        prisma.pesticide.upsert({
          where: { registrationNumber: row.registration_number },
          create: {
            registrationNumber: row.registration_number,
            pesticideType: row.pesticide_type,
            pesticideName: row.pesticide_name,
            companyName: row.company_name,
            activeIngredient: row.active_ingredient,
            activeIngredientForTotalCount:
              row.active_ingredient_for_total_count,
            concentration: row.concentration,
            mixCount: Number.parseInt(row.mix_count, 10) || 0,
            usage: row.usage,
            formulation: row.formulation,
            registrationDate: parseRegistrationDate(row.registration_date),
          },
          update: {
            pesticideType: row.pesticide_type,
            pesticideName: row.pesticide_name,
            companyName: row.company_name,
            activeIngredient: row.active_ingredient,
            activeIngredientForTotalCount:
              row.active_ingredient_for_total_count,
            concentration: row.concentration,
            mixCount: Number.parseInt(row.mix_count, 10) || 0,
            usage: row.usage,
            formulation: row.formulation,
            registrationDate: parseRegistrationDate(row.registration_date),
          },
        }),
      ),
    )

    console.log(`  ${Math.min(i + CHUNK_SIZE, rows.length)} / ${rows.length} 件完了`)
  }

  console.log('✅ 農薬基本情報のインポートが完了しました')
}

const importApplications = async (): Promise<void> => {
  console.log('🌱 農薬適用情報のインポートを開始します...')

  const rows = await parseCsv<ApplicationCsvRow>(
    resolve(CSV_DIR, 'applications.csv'),
  )
  console.log(`  ${rows.length} 件の適用データを読み込みました`)

  // 既存データを全削除してから投入（差分管理が困難なため）
  await prisma.pesticideApplication.deleteMany()
  console.log('  既存の適用データを削除しました')

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)

    await prisma.pesticideApplication.createMany({
      data: chunk.map((row) => ({
        registrationNumber: row.registration_number,
        usage: row.usage,
        pesticideType: row.pesticide_type,
        pesticideName: row.pesticide_name,
        companyAbbreviation: row.company_abbreviation,
        cropName: row.crop_name,
        applicationPlace: toNullableString(row.application_place),
        pestName: row.pest_name,
        purpose: toNullableString(row.purpose),
        dilutionRate: row.dilution_rate,
        sprayVolume: toNullableString(row.spray_volume),
        usagePeriod: row.usage_period,
        maxCount: row.max_count,
        usageMethod: row.usage_method,
        fumigationTime: toNullableString(row.fumigation_time),
        fumigationTemperature: toNullableString(row.fumigation_temperature),
        applicationSoil: toNullableString(row.application_soil),
        applicationArea: toNullableString(row.application_area),
        applicationPesticideName: toNullableString(
          row.application_pesticide_name,
        ),
        mixCount: Number.parseInt(row.mix_count, 10) || 0,
        totalMaxCount1: toNullableString(row.total_max_count_1),
        totalMaxCount2: toNullableString(row.total_max_count_2),
        totalMaxCount3: toNullableString(row.total_max_count_3),
        totalMaxCount4: toNullableString(row.total_max_count_4),
        totalMaxCount5: toNullableString(row.total_max_count_5),
      })),
    })

    console.log(`  ${Math.min(i + CHUNK_SIZE, rows.length)} / ${rows.length} 件完了`)
  }

  console.log('✅ 農薬適用情報のインポートが完了しました')
}

const main = async (): Promise<void> => {
  try {
    await importPesticides()
    await importApplications()
    console.log('🎉 すべてのインポートが完了しました')
  } catch (error) {
    console.error('❌ インポート中にエラーが発生しました:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
