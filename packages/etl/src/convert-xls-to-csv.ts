import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { read, utils } from 'xlsx'

const ROOT_DIR = resolve(import.meta.dirname, '..', '..', '..')
const RAW_DIR = resolve(ROOT_DIR, 'assets', 'raw')
const CSV_DIR = resolve(ROOT_DIR, 'assets', 'csv')

/** 日本語ヘッダー → 英語スネークケースのマッピング（登録基本部） */
const PESTICIDE_HEADER_MAP: Record<string, string> = {
  登録番号: 'registration_number',
  農薬の種類: 'pesticide_type',
  農薬の名称: 'pesticide_name',
  '登録を有する者の名称': 'company_name',
  有効成分: 'active_ingredient',
  '総使用回数における有効成分': 'active_ingredient_for_total_count',
  濃度: 'concentration',
  混合数: 'mix_count',
  用途: 'usage',
  剤型名: 'formulation',
  登録年月日: 'registration_date',
}

/** 日本語ヘッダー → 英語スネークケースのマッピング（登録適用部） */
const APPLICATION_HEADER_MAP: Record<string, string> = {
  登録番号: 'registration_number',
  用途: 'usage',
  農薬の種類: 'pesticide_type',
  農薬の名称: 'pesticide_name',
  '登録を有する者の略称': 'company_abbreviation',
  作物名: 'crop_name',
  適用場所: 'application_place',
  適用病害虫雑草名: 'pest_name',
  使用目的: 'purpose',
  希釈倍数使用量: 'dilution_rate',
  散布液量: 'spray_volume',
  使用時期: 'usage_period',
  本剤の使用回数: 'max_count',
  使用方法: 'usage_method',
  くん蒸時間: 'fumigation_time',
  くん蒸温度: 'fumigation_temperature',
  適用土壌: 'application_soil',
  適用地帯名: 'application_area',
  適用農薬名: 'application_pesticide_name',
  混合数: 'mix_count',
  '有効成分①を含む農薬の総使用回数': 'total_max_count_1',
  '有効成分②を含む農薬の総使用回数': 'total_max_count_2',
  '有効成分③を含む農薬の総使用回数': 'total_max_count_3',
  '有効成分④を含む農薬の総使用回数': 'total_max_count_4',
  '有効成分⑤を含む農薬の総使用回数': 'total_max_count_5',
}

/** Excelシリアル値をYYYY-MM-DD形式に変換 */
const excelDateToString = (serial: number): string => {
  const date = new Date((serial - 25569) * 86400 * 1000)
  return date.toISOString().split('T')[0]
}

/** CSV用に値をエスケープ */
const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** xlsファイルの指定シートを読み込み、行配列として返す */
const readSheet = (filePath: string, sheetName: string): unknown[][] => {
  const buffer = readFileSync(filePath)
  const workbook = read(buffer, { type: 'buffer' })
  const worksheet = workbook.Sheets[sheetName]
  if (!worksheet) {
    throw new Error(`シート "${sheetName}" が見つかりません: ${filePath}`)
  }
  return utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
}

/** ヘッダーマッピングを適用してCSV文字列を生成 */
const convertToCsv = (
  rows: unknown[][],
  headerMap: Record<string, string>,
  dateColumns: string[],
): string => {
  const originalHeaders = rows[0] as string[]
  const englishHeaders = originalHeaders.map((h) => {
    const mapped = headerMap[h]
    if (!mapped) {
      throw new Error(`未知のカラム: "${h}"`)
    }
    return mapped
  })

  const dateColumnIndices = dateColumns.map((col) => englishHeaders.indexOf(col))

  const csvLines: string[] = [englishHeaders.join(',')]

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const values = englishHeaders.map((_, colIndex) => {
      let value = row[colIndex]
      if (dateColumnIndices.includes(colIndex) && typeof value === 'number') {
        value = excelDateToString(value)
      }
      return escapeCsvValue(value)
    })
    csvLines.push(values.join(','))
  }

  return csvLines.join('\n') + '\n'
}

const main = (): void => {
  if (!existsSync(CSV_DIR)) {
    mkdirSync(CSV_DIR, { recursive: true })
  }

  // 登録基本部
  console.log('登録基本部を変換中...')
  const pesticideRows = readSheet(
    resolve(RAW_DIR, '登録基本部.xls'),
    '登録基本部',
  )
  const pesticideCsv = convertToCsv(pesticideRows, PESTICIDE_HEADER_MAP, [
    'registration_date',
  ])
  const pesticidesPath = resolve(CSV_DIR, 'pesticides.csv')
  writeFileSync(pesticidesPath, pesticideCsv, 'utf-8')
  console.log(`  → ${pesticidesPath} (${pesticideRows.length - 1}行)`)

  // 登録適用部一
  console.log('登録適用部一を変換中...')
  const app1Rows = readSheet(
    resolve(RAW_DIR, '登録適用部一.xls'),
    '登録適用部一',
  )

  // 登録適用部二
  console.log('登録適用部二を変換中...')
  const app2Rows = readSheet(
    resolve(RAW_DIR, '登録適用部二.xls'),
    '登録適用部二',
  )

  // 適用部一 + 適用部二を結合（ヘッダーは適用部一のものを使用、適用部二はデータ行のみ）
  const combinedRows = [...app1Rows, ...app2Rows.slice(1)]
  const applicationsCsv = convertToCsv(
    combinedRows,
    APPLICATION_HEADER_MAP,
    [],
  )
  const applicationsPath = resolve(CSV_DIR, 'applications.csv')
  writeFileSync(applicationsPath, applicationsCsv, 'utf-8')
  console.log(
    `  → ${applicationsPath} (${combinedRows.length - 1}行 = 適用部一 ${app1Rows.length - 1}行 + 適用部二 ${app2Rows.length - 1}行)`,
  )

  console.log('変換完了')
}

main()
