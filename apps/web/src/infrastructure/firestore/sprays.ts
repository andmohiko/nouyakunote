import type {
  CreateSprayDto,
  Spray,
  SprayId,
  Uid,
  UpdateSprayDto,
} from '@vectornote/common'
import { sprayCollection } from '@vectornote/common'
import type { Unsubscribe } from 'firebase/firestore'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { convertDate } from '@/utils/convertDate'

const dateColumns = [
  'createdAt',
  'updatedAt',
  'sprayedAt',
] as const satisfies Array<string>

/** フィルタ条件 */
export type SprayFilters = {
  startDate?: Date
  endDate?: Date
  fieldId?: string
}

/** ユーザーの散布記録をリアルタイム購読する（sprayedAt降順） */
export const subscribeSpraysOperation = (
  userId: Uid,
  filters: SprayFilters | undefined,
  setter: (sprays: Array<Spray>) => void,
): Unsubscribe => {
  const constraints = [
    where('userId', '==', userId),
    orderBy('sprayedAt', 'desc'),
  ]

  if (filters?.fieldId) {
    constraints.splice(1, 0, where('fieldId', '==', filters.fieldId))
  }
  if (filters?.startDate) {
    constraints.push(where('sprayedAt', '>=', Timestamp.fromDate(filters.startDate)))
  }
  if (filters?.endDate) {
    const endOfDay = new Date(filters.endDate)
    endOfDay.setHours(23, 59, 59, 999)
    constraints.push(where('sprayedAt', '<=', Timestamp.fromDate(endOfDay)))
  }

  const q = query(collection(db, sprayCollection), ...constraints)
  return onSnapshot(q, (snapshot) => {
    const sprays = snapshot.docs.map(
      (d) =>
        ({ sprayId: d.id, ...convertDate(d.data(), [...dateColumns]) }) as Spray,
    )
    setter(sprays)
  })
}

/** 単一散布記録を取得する */
export const fetchSprayOperation = async (
  sprayId: SprayId,
): Promise<Spray | null> => {
  const snapshot = await getDoc(doc(db, sprayCollection, sprayId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return {
    sprayId: snapshot.id,
    ...convertDate(data, [...dateColumns]),
  } as Spray
}

/** 散布記録を作成する */
export const createSprayOperation = async (
  dto: CreateSprayDto,
): Promise<void> => {
  await addDoc(collection(db, sprayCollection), dto)
}

/** 散布記録を更新する */
export const updateSprayOperation = async (
  sprayId: SprayId,
  dto: UpdateSprayDto,
): Promise<void> => {
  await updateDoc(doc(db, sprayCollection, sprayId), dto)
}

/** 散布記録を削除する */
export const deleteSprayOperation = async (
  sprayId: SprayId,
): Promise<void> => {
  await deleteDoc(doc(db, sprayCollection, sprayId))
}
