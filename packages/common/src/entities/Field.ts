import type { FieldValue } from 'firebase/firestore'

import type { Uid } from './Auth'

/** コレクション名 */
export const fieldCollection = 'fields' as const

/** ID型エイリアス */
export type FieldId = string

/** Entity型（Firestoreから取得したデータ、Date変換済み） */
export type Field = {
  fieldId: FieldId
  createdAt: Date
  name: string
  updatedAt: Date
  userId: Uid
}

/** 作成用DTO */
export type CreateFieldDto = Omit<
  Field,
  'fieldId' | 'createdAt' | 'updatedAt'
> & {
  createdAt: FieldValue
  updatedAt: FieldValue
}

/** 更新用DTO */
export type UpdateFieldDto = {
  name?: Field['name']
  updatedAt: FieldValue
}
