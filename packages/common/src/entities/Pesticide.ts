import type { FieldValue as AdminFieldValue } from 'firebase-admin/firestore'

/** コレクション名 */
export const pesticideCollection = 'pesticides' as const

/** 適用情報 */
export type PesticideApplication = {
  cropName: string
  pestName: string
  dilutionRate: string
  usagePeriod: string
  usageMethod: string
  maxCount: string
  totalMaxCount: string
}

/** Entity型（Firestoreから取得したデータ、Date変換済み） */
export type Pesticide = {
  registrationNumber: string
  pesticideName: string
  pesticideType: string
  usage: string
  companyName: string
  applications: Array<PesticideApplication>
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
