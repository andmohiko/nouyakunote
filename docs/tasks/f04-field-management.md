# F-04: 圃場管理 実装計画

## 概要

ユーザーの圃場（畑の場所）の CRUD 機能を実装する。散布記録登録時に圃場を選択するため、事前登録が必要。

## 実装内容

### 1. 型定義（packages/common）

**`packages/common/src/entities/Field.ts`（新規）**

```typescript
export const fieldCollection = 'fields' as const
export type FieldId = string

export type Field = {
  fieldId: FieldId
  name: string
  userId: Uid
  createdAt: Date
  updatedAt: Date
}

export type CreateFieldDto = {
  name: string
  userId: Uid
  createdAt: FieldValue
  updatedAt: FieldValue
}

export type UpdateFieldDto = {
  name?: string
  updatedAt: FieldValue
}
```

### 2. Firestore 操作

**`apps/web/src/infrastructure/firestore/fields.ts`（新規）**

| 関数名 | 説明 |
|--------|------|
| `fetchFieldsOperation(userId)` | ユーザーの全圃場を取得（name 昇順） |
| `fetchFieldOperation(fieldId)` | 単一圃場を取得 |
| `createFieldOperation(dto)` | 圃場を作成 |
| `updateFieldOperation(fieldId, dto)` | 圃場を更新 |
| `deleteFieldOperation(fieldId)` | 圃場を削除 |

### 3. Hooks

**`apps/web/src/features/fields/hooks/`**

| ファイル | 説明 |
|---------|------|
| `useFields.ts` | 圃場一覧取得（useQuery） |
| `useCreateFieldMutation.ts` | 圃場作成（useMutation） |
| `useUpdateFieldMutation.ts` | 圃場更新（useMutation） |
| `useDeleteFieldMutation.ts` | 圃場削除（useMutation） |

**QueryKey:** `['fields', userId]`

### 4. Zod スキーマ

**`apps/web/src/features/fields/schemas/fieldSchema.ts`（新規）**

```typescript
export const fieldFormSchema = z.object({
  name: z.string().min(1, '圃場名を入力してください').max(50, '圃場名は50文字以内です'),
})
```

### 5. 画面

**圃場一覧画面:** `/fields`（`apps/web/src/routes/_authed/fields.tsx`）
- 圃場のリスト表示（名前）
- 「+ 圃場を追加」ボタン → 登録画面へ
- 各圃場に編集・削除ボタン
- 削除時: 紐づく散布記録がある場合は警告ダイアログ表示

**圃場登録画面:** `/fields/new`（`apps/web/src/routes/_authed/fields.new.tsx`）
- 圃場名入力フォーム
- 「保存」ボタン

**圃場編集画面:** `/fields/$fieldId`（`apps/web/src/routes/_authed/fields.$fieldId.tsx`）
- 既存データをフォームに表示
- 「更新」ボタン

### 6. Firestore Security Rules

```
match /fields/{fieldId} {
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow update: if request.auth != null && resource.data.userId == request.auth.uid;
  allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

## 対象ファイル

| ファイル | 操作 |
|---------|------|
| `packages/common/src/entities/Field.ts` | 新規（型定義） |
| `packages/common/src/entities/index.ts` | 修正（エクスポート追加） |
| `apps/web/src/infrastructure/firestore/fields.ts` | 新規（Firestore 操作） |
| `apps/web/src/features/fields/hooks/useFields.ts` | 新規 |
| `apps/web/src/features/fields/hooks/useCreateFieldMutation.ts` | 新規 |
| `apps/web/src/features/fields/hooks/useUpdateFieldMutation.ts` | 新規 |
| `apps/web/src/features/fields/hooks/useDeleteFieldMutation.ts` | 新規 |
| `apps/web/src/features/fields/schemas/fieldSchema.ts` | 新規 |
| `apps/web/src/routes/_authed/fields.tsx` | 新規（一覧画面） |
| `apps/web/src/routes/_authed/fields.new.tsx` | 新規（登録画面） |
| `apps/web/src/routes/_authed/fields.$fieldId.tsx` | 新規（編集画面） |
| `firestore.rules` | 修正（fields ルール追加） |

## 確認方法

- 圃場を新規登録できること
- 圃場一覧に登録した圃場が表示されること
- 圃場名を編集・更新できること
- 圃場を削除できること
- 他ユーザーの圃場にアクセスできないこと（Security Rules）
- `pnpm web build` が通ること
