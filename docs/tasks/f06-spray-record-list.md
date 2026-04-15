# F-06: 散布記録の一覧・詳細表示 実装計画

## 概要

散布記録の一覧表示、フィルタリング、詳細表示、編集、削除機能を実装する。

## 前提条件

- F-05（散布記録の登録）が実装済みであること

## 実装内容

### 1. 型定義の追加（packages/common）

**`packages/common/src/entities/Spray.ts` に追加:**

```typescript
export type UpdateSprayDto = {
  sprayedAt?: Timestamp
  pesticideName?: string
  registrationNumber?: string
  targetCrop?: string
  targetPest?: string
  fieldId?: string
  fieldName?: string
  dilutionRate?: number
  sprayAmount?: number
  sprayAmountUnit?: string
  pesticideAmount?: number
  pesticideAmountUnit?: string
  note?: string
  updatedAt: FieldValue
}
```

### 2. Firestore 操作の追加

**`apps/web/src/infrastructure/firestore/sprays.ts` に追加:**

| 関数名 | 説明 |
|--------|------|
| `fetchSpraysOperation(userId, filters?)` | 散布記録一覧取得（フィルタ・ソート対応） |
| `fetchSprayOperation(sprayId)` | 単一散布記録取得 |
| `updateSprayOperation(sprayId, dto)` | 散布記録更新 |
| `deleteSprayOperation(sprayId)` | 散布記録削除 |

**フィルタリング:**
```typescript
type SprayFilters = {
  startDate?: Date    // 開始日
  endDate?: Date      // 終了日
  fieldId?: string    // 圃場
  targetCrop?: string // 作物名
}
```

- `where('userId', '==', userId)` は必須
- `orderBy('sprayedAt', 'desc')` でソート
- 各フィルタ条件は `where` で追加
- Firestore の複合クエリ制限に注意（複合インデックスが必要）

### 3. Firestore インデックス

**`firestore.indexes.json` に追加:**

```json
{
  "collectionGroup": "sprays",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "sprayedAt", "order": "DESCENDING" }
  ]
}
```

フィルタ条件の組み合わせに応じて追加のインデックスが必要になる可能性あり。

### 4. Hooks

**`apps/web/src/features/sprays/hooks/`**

| ファイル | 説明 |
|---------|------|
| `useSprays.ts` | 散布記録一覧取得（useQuery、フィルタ対応） |
| `useSpray.ts` | 単一散布記録取得（useQuery） |
| `useUpdateSprayMutation.ts` | 散布記録更新（useMutation） |
| `useDeleteSprayMutation.ts` | 散布記録削除（useMutation） |

**QueryKey:**
```typescript
const spraysQueryKey = (userId: string, filters?: SprayFilters) =>
  ['sprays', userId, filters] as const
```

### 5. 散布記録一覧画面

**ルート:** `/sprays`（`apps/web/src/routes/_authed/sprays.tsx`）

**UI 構成:**
- フィルタバー:
  - 期間選択（開始日〜終了日の DatePicker）
  - 圃場セレクト（全圃場 or 個別選択）
  - 作物名テキスト入力
- 散布記録リスト:
  - 各行: 散布日 | 農薬名 | 対象作物 | 圃場名 | 散布量
  - タップで詳細モーダル or ページへ遷移
- 「+ 新規記録」ボタン → 登録モーダル（F-05）

### 6. 散布記録詳細・編集

散布記録一覧の各行をタップすると、詳細表示 + 編集・削除が可能。

**表示項目:** 散布日、農薬名、登録番号、対象作物、対象病害虫、圃場名、希釈倍率、散布量、農薬使用量、備考

**操作:**
- 「編集」ボタン → フォームに切り替えて各項目を編集可能に
- 「削除」ボタン → 確認ダイアログ表示後に削除
- 削除後は一覧画面に戻る

### 7. Firestore Security Rules

```
match /sprays/{sprayId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow update: if request.auth != null && resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `packages/common/src/entities/Spray.ts` | 修正（UpdateSprayDto 追加） |
| `apps/web/src/infrastructure/firestore/sprays.ts` | 修正（一覧・詳細・更新・削除 追加） |
| `apps/web/src/features/sprays/hooks/useSprays.ts` | 新規 |
| `apps/web/src/features/sprays/hooks/useSpray.ts` | 新規 |
| `apps/web/src/features/sprays/hooks/useUpdateSprayMutation.ts` | 新規 |
| `apps/web/src/features/sprays/hooks/useDeleteSprayMutation.ts` | 新規 |
| `apps/web/src/features/sprays/components/SprayList/` | 新規（一覧コンポーネント） |
| `apps/web/src/features/sprays/components/SprayFilterBar/` | 新規（フィルタバー） |
| `apps/web/src/features/sprays/components/SprayDetail/` | 新規（詳細・編集） |
| `apps/web/src/routes/_authed/sprays.tsx` | 修正（一覧 + フィルタ） |
| `firestore.rules` | 修正（sprays の read/update/delete 追加） |
| `firestore.indexes.json` | 修正（複合インデックス追加） |

## 確認方法

- 散布記録一覧が散布日の降順で表示されること
- 期間・圃場・作物名でフィルタリングできること
- 詳細画面で全項目が表示されること
- 散布記録を編集・更新できること
- 散布記録を削除できること（確認ダイアログ付き）
- 他ユーザーの散布記録にアクセスできないこと
- `pnpm web build` が通ること
