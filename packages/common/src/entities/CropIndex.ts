import type { FieldValue as AdminFieldValue } from 'firebase-admin/firestore'

/** コレクション名 */
export const cropIndexCollection = 'cropIndex' as const

/** Entity型（Firestoreから取得したデータ） */
export type CropIndex = {
  cropName: string
  registrationNumbers: Array<string>
}

/** 作成・更新用DTO（Cloud Functions からのバッチ取込用） */
export type UpsertCropIndexDtoFromAdmin = {
  registrationNumbers: Array<string>
  updatedAt: AdminFieldValue
}
