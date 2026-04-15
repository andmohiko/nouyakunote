import type { FieldValue } from 'firebase/firestore'

import type { Uid } from './Auth'
import type { FieldId } from './Field'

/** コレクション名 */
export const sprayCollection = 'sprays' as const

/** ID型エイリアス */
export type SprayId = string

/** 農薬の単位（液体 or 粉末） */
export type PesticideUnit = 'ml' | 'L' | 'g' | 'kg'

/** Entity型（Firestoreから取得したデータ、Date変換済み） */
export type Spray = {
  sprayId: SprayId
  createdAt: Date
  dilutionRate: number
  fieldId: FieldId
  fieldName: string
  note: string
  pesticideAmount: number
  pesticideName: string
  pesticideUnit: PesticideUnit
  registrationNumber: string
  sprayAmount: number
  sprayedAt: Date
  updatedAt: Date
  userId: Uid
}

/** 作成用DTO */
export type CreateSprayDto = Omit<
  Spray,
  'sprayId' | 'createdAt' | 'updatedAt' | 'sprayedAt'
> & {
  createdAt: FieldValue
  sprayedAt: FieldValue
  updatedAt: FieldValue
}

/** 更新用DTO */
export type UpdateSprayDto = {
  dilutionRate?: Spray['dilutionRate']
  fieldId?: Spray['fieldId']
  fieldName?: Spray['fieldName']
  note?: Spray['note']
  pesticideAmount?: Spray['pesticideAmount']
  pesticideName?: Spray['pesticideName']
  pesticideUnit?: Spray['pesticideUnit']
  registrationNumber?: Spray['registrationNumber']
  sprayAmount?: Spray['sprayAmount']
  sprayedAt?: FieldValue
  updatedAt: FieldValue
}
