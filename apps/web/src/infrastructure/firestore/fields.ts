import type {
  CreateFieldDto,
  Field,
  FieldId,
  Uid,
  UpdateFieldDto,
} from '@vectornote/common'
import { fieldCollection } from '@vectornote/common'
import type { Unsubscribe } from 'firebase/firestore'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { convertDate } from '@/utils/convertDate'

const dateColumns = ['createdAt', 'updatedAt'] as const satisfies Array<string>

/** ユーザーの全圃場を取得する（name昇順） */
export const fetchFieldsOperation = async (
  userId: Uid,
): Promise<Array<Field>> => {
  const snapshot = await getDocs(
    query(
      collection(db, fieldCollection),
      where('userId', '==', userId),
      orderBy('name', 'asc'),
    ),
  )
  return snapshot.docs.map(
    (d) => ({ fieldId: d.id, ...convertDate(d.data(), dateColumns) }) as Field,
  )
}

/** ユーザーの全圃場をリアルタイム購読する（name昇順） */
export const subscribeFieldsOperation = (
  userId: Uid,
  setter: (fields: Array<Field>) => void,
): Unsubscribe => {
  const q = query(
    collection(db, fieldCollection),
    where('userId', '==', userId),
    orderBy('name', 'asc'),
  )
  return onSnapshot(q, (snapshot) => {
    const fields = snapshot.docs.map(
      (d) => ({ fieldId: d.id, ...convertDate(d.data(), dateColumns) }) as Field,
    )
    setter(fields)
  })
}

/** 単一圃場をリアルタイム購読する */
export const subscribeFieldOperation = (
  fieldId: FieldId,
  setter: (field: Field | null) => void,
): Unsubscribe => {
  return onSnapshot(doc(db, fieldCollection, fieldId), (snapshot) => {
    const data = snapshot.data()
    if (!data) {
      setter(null)
      return
    }
    setter({ fieldId: snapshot.id, ...convertDate(data, dateColumns) } as Field)
  })
}

/** 単一圃場を取得する */
export const fetchFieldOperation = async (
  fieldId: FieldId,
): Promise<Field | null> => {
  const snapshot = await getDoc(doc(db, fieldCollection, fieldId))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return { fieldId: snapshot.id, ...convertDate(data, dateColumns) } as Field
}

/** 圃場を作成する */
export const createFieldOperation = async (
  dto: CreateFieldDto,
): Promise<void> => {
  await addDoc(collection(db, fieldCollection), dto)
}

/** 圃場を更新する */
export const updateFieldOperation = async (
  fieldId: FieldId,
  dto: UpdateFieldDto,
): Promise<void> => {
  await updateDoc(doc(db, fieldCollection, fieldId), dto)
}

/** 圃場を削除する */
export const deleteFieldOperation = async (
  fieldId: FieldId,
): Promise<void> => {
  await deleteDoc(doc(db, fieldCollection, fieldId))
}
