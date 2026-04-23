import type { FieldValue as AdminFieldValue } from 'firebase-admin/firestore'

/** コレクション名 */
export const pesticideCollection = 'pesticides' as const

/** 適用情報（検索結果用） */
export type PesticideApplicationSummary = {
  cropName: string
  pestName: string
  dilutionRate: string
  usagePeriod: string
  usageMethod: string
  maxCount: string
  totalMaxCount1: string | null
}

/** 適用情報（詳細用） */
export type PesticideApplicationDetail = PesticideApplicationSummary & {
  applicationPlace: string | null
  purpose: string | null
  sprayVolume: string | null
  totalMaxCount2: string | null
  totalMaxCount3: string | null
  totalMaxCount4: string | null
  totalMaxCount5: string | null
}

/** 検索結果の農薬（APIレスポンス） */
export type PesticideSearchResult = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  formulation: string
  applications: Array<PesticideApplicationSummary>
}

/** 農薬詳細（APIレスポンス） */
export type PesticideDetail = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  formulation: string
  activeIngredient: string
  concentration: string
  registrationDate: string | null
  applications: Array<PesticideApplicationDetail>
}

/** Entity型（Firestoreから取得したデータ、Date変換済み） */
export type Pesticide = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  applications: Array<PesticideApplicationSummary>
  updatedAt: Date
}

/** 作成用DTO（Cloud Functions からのバッチ取込用） */
export type CreatePesticideDtoFromAdmin = Omit<
  Pesticide,
  'updatedAt'
> & {
  updatedAt: AdminFieldValue
}

/** 更新用DTO（Cloud Functions からのバッチ取込用） */
export type UpdatePesticideDtoFromAdmin = {
  pesticideName?: Pesticide['pesticideName']
  pesticideType?: Pesticide['pesticideType']
  usage?: Pesticide['usage']
  companyName?: Pesticide['companyName']
  applications?: Pesticide['applications']
  updatedAt: AdminFieldValue
}

/** クライアント側での読み取り専用のため、client用DTOは定義しない */
/** 検索結果で使用する軽量型 */
export type PesticideSummary = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
}
